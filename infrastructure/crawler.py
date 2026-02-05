import os
import requests
import time
import concurrent.futures
from pathlib import Path
import sys
import subprocess

# Configuration
API_URL = "http://localhost:8000/ingest"
TARGET_DIRS = [
    os.path.expanduser("~/Documents"),
    os.path.expanduser("~/CloudDrive"),
    os.path.expanduser("~/Dev")
]
EXTENSIONS = ['*.md', '*.pdf', '*.docx', '*.csv']
EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'venv', '__pycache__', 'dist', 'build', '.gemini']
MAX_THREADS = 8

def discover_files():
    """Fast discovery using native tools."""
    files_to_index = []
    print("AGLA Hunt & Seek: Starting discovery phase...")
    
    for root_dir in TARGET_DIRS:
        if not os.path.exists(root_dir): continue
        print(f"  > Scanning {root_dir}...", end="", flush=True)
        
        start_count = len(files_to_index)
        
        # Use rclone for CloudDrive if possible
        if "CloudDrive" in root_dir:
            try:
                # rclone lsf -R --files-only --include "*.{md,pdf,docx,csv}" gdrive:
                # We use the remote 'gdrive:' directly for speed
                include_pattern = ",".join([ext.replace('*', '') for ext in EXTENSIONS])
                cmd = ["rclone", "lsf", "-R", "--files-only", "--include", f"*.{{{include_pattern}}}", "gdrive:"]
                result = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8', errors='ignore')
                for line in result.splitlines():
                    if not any(ex in line for ex in EXCLUDE_DIRS):
                        files_to_index.append(Path(root_dir) / line)
                print(f" Done. Found {len(files_to_index) - start_count} files.")
                continue
            except Exception:
                pass # Fallback to find if rclone fails

        # Standard find for local dirs
        name_filters = []
        for ext in EXTENSIONS:
            if name_filters: name_filters.append("-o")
            name_filters.extend(["-name", ext])
        exclude_filters = []
        for ex in EXCLUDE_DIRS:
            exclude_filters.extend(["-not", "-path", f"*/{ex}/*"])

        cmd = ["find", root_dir, "-type", "f", "("] + name_filters + [")"] + exclude_filters
        try:
            result = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8', errors='ignore')
            lines = [Path(l) for l in result.splitlines() if l.strip()]
            files_to_index.extend(lines)
            print(f" Done. Found {len(lines)} files.")
        except Exception as e:
            print(f" Failed: {e}")

    return files_to_index

def ingest_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            files_payload = {'file': (file_path.name, f)}
            data_payload = {
                'tier': 'essential',
                'file_path': str(file_path)
            }
            response = requests.post(API_URL, files=files_payload, data=data_payload, timeout=60)
        return response.status_code == 200
    except Exception:
        return False

def show_progress(current, total, filename):
    width = 40
    percent = (current / total) * 100
    filled = int(width * current // total)
    bar = "█" * filled + "-" * (width - filled)
    fn = (filename[:30] + '..') if len(filename) > 32 else filename.ljust(32)
    sys.stdout.write(f"\rIngesting: |{bar}| {percent:3.1f}% [{current}/{total}] {fn}")
    sys.stdout.flush()

def crawl():
    all_files = discover_files()
    total = len(all_files)
    
    if total == 0:
        print("\nNo documents found to index.")
        return

    print(f"\nDiscovered {total} total documents. Starting parallel ingestion...")
    
    successful = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        future_to_file = {executor.submit(ingest_file, f): f for f in all_files}
        
        for i, future in enumerate(concurrent.futures.as_completed(future_to_file), 1):
            file_path = future_to_file[future]
            if future.result():
                successful += 1
            show_progress(i, total, file_path.name)

    print(f"\n\n--- Hunt & Seek Complete ---")
    print(f"Successfully Indexed: {successful}")
    print(f"Failed/Skipped: {total - successful}")

if __name__ == "__main__":
    try:
        crawl()
    except KeyboardInterrupt:
        print("\n\nCrawl interrupted by user.")
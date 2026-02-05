import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 relative overflow-auto h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
"use client";

// import dynamic from 'next/dynamic';

// const RemoteChat = dynamic(() => import('cortex/Chat'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex items-center justify-center min-h-screen text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">
//       Initialising Cortex Link...
//     </div>
//   ),
// });

export default function ChatPage() {
  return (
    <div className="h-full flex items-center justify-center text-gray-500 font-mono">
      {/* <RemoteChat /> */}
      <div className="text-center space-y-4">
        <p className="text-xl font-bold uppercase tracking-widest">Cortex Link Offline</p>
        <p className="text-xs">Federation disabled for OCI Build Stability</p>
      </div>
    </div>
  );
}

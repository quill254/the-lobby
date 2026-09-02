import dynamic from "next/dynamic";
import { Metadata } from "next";
import ChatRoom from "@/components/chat-room";

const ThreeBackground = dynamic(
  () => import("@/components/three-background"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "The Lobby — Anonymous Chat",
  description:
    "Drop in. No accounts. No history. Just real people, real time. The Lobby is an anonymous chatroom.",
  openGraph: {
    title: "The Lobby",
    description: "Anonymous real-time chat. No accounts required.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      <ThreeBackground />
      
      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              The Lobby
            </h1>
            <p className="text-xs text-neutral-500">Anonymous chatroom</p>
          </div>
          <nav className="flex gap-4 text-sm">
  <a href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
    Privacy
  </a>
</nav>
        </header>

        <div className="container mx-auto px-4 py-6">
          <ChatRoom />
        </div>
      </div>
    </main>
  );
}
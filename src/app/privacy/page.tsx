import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — The Lobby",
  description: "How The Lobby handles your data.",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 p-8 max-w-2xl mx-auto font-sans">
      <a href="/" className="text-sm text-neutral-500 hover:text-white mb-8 block">
        ← Back to The Lobby
      </a>
      
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
        Privacy Policy
      </h1>

      <p className="text-sm text-white/60 leading-relaxed mb-6">
        Last updated: September 1, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">What We Collect</h2>
        <ul className="text-sm text-white/60 list-disc pl-5 space-y-2">
          <li><strong>Country:</strong> Detected from your IP to show a flag emoji.</li>
          <li><strong>Messages:</strong> Stored temporarily and visible to all users.</li>
          <li><strong>Session presence:</strong> Shows how many people are online.</li>
          <li><strong>Device ID:</strong> Anonymous ID in your browser to enforce bans.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">What We Do NOT Collect</h2>
        <ul className="text-sm text-white/60 list-disc pl-5 space-y-2">
          <li>Your real name, email, or phone number</li>
          <li>Your exact IP address (only country is stored)</li>
          <li>Any personally identifiable information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">Moderation</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Messages are filtered for spam, illegal content, and links. Admins can delete messages
          and ban abusive users. Reported messages are reviewed manually.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">Data Retention</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Messages are stored for up to 30 days, then purged. Presence data is deleted when you
          close the tab. Banned device IDs are retained indefinitely.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-white/80">Contact</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          For questions, contact us through the chatroom.
        </p>
      </section>
    </div>
  );
}
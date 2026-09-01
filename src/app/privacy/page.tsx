export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
        Privacy Policy
      </h1>
      
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        Last updated: September 1, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">What We Collect</h2>
        <ul className="text-sm text-white/60 list-disc pl-5 space-y-2">
          <li><strong>Country:</strong> Detected from your IP address to display a flag emoji next to your messages.</li>
          <li><strong>Messages:</strong> Stored temporarily in our database and visible to all users in the chatroom.</li>
          <li><strong>Session presence:</strong> Used to show how many people are currently online.</li>
          <li><strong>Device ID:</strong> A random anonymous ID stored in your browser to enforce bans if necessary.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">What We Do NOT Collect</h2>
        <ul className="text-sm text-white/60 list-disc pl-5 space-y-2">
          <li>Your real name, email, or phone number</li>
          <li>Your exact IP address (only the country is stored)</li>
          <li>Any personally identifiable information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">Moderation</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Messages are filtered for spam, illegal content, and links. Admins can delete messages 
          and ban abusive users. Reported messages are reviewed manually. We reserve the right to 
          remove any content that violates our rules.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-white/80">Data Retention</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Messages are stored for up to 30 days, then automatically purged. Presence data is 
          deleted when you close the tab. Banned device IDs are retained indefinitely to prevent 
          repeat abuse.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-white/80">Contact</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          For questions or data removal requests, contact us through the chatroom or reach out 
          on Twitter/X.
        </p>
      </section>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  onDisconnect,
  serverTimestamp,
  query,
  limitToLast,
  off,
} from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
const FLAG_API = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

const BLACKLIST = [
  "child porn", "cp", "xxx video", "kill yourself", "kys",
  "nazi hitler", "terrorist attack", "bomb instructions",
  "cocaine dealer", "heroin supplier", "meth lab",
  "escort service", "prostitution", "sex trafficking",
];

interface Message {
  id: string;
  text: string;
  username: string;
  color: string;
  country: string;
  countryName: string;
  timestamp: number;
}

interface Presence {
  [key: string]: { lastSeen: number; country: string };
}

async function checkToxicity(text: string): Promise<boolean> {
  return false;
}

export default function Lobby() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [country, setCountry] = useState("KE");
  const [countryName, setCountryName] = useState("Kenya");
  const [onlineCount, setOnlineCount] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [showRules, setShowRules] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const lastSendRef = useRef(0);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setCountry(d.country_code || "KE");
        setCountryName(d.country_name || "Kenya");
      })
      .catch(() => {});
    setUsername(`Guest_${Math.floor(Math.random() * 9999)}`);
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);

  useEffect(() => {
    const presenceRef = ref(db, `presence/${sessionId.current}`);
    set(presenceRef, { lastSeen: serverTimestamp(), country });
    onDisconnect(presenceRef).remove();

    const presenceQuery = ref(db, "presence");
    onValue(presenceQuery, (snap) => {
      const data = snap.val() as Presence | null;
      if (data) setOnlineCount(Object.keys(data).length);
    });

    return () => {
      off(presenceQuery);
    };
  }, [country]);

  useEffect(() => {
    const messagesRef = query(ref(db, "messages"), limitToLast(100));
    onValue(messagesRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const msgs = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      setMessages(msgs);
    });
    return () => off(messagesRef);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (cooldown > 0) return;
    if (input.length > 280) return alert("Max 280 characters");

    const lower = input.toLowerCase();
    if (BLACKLIST.some((w) => lower.includes(w))) {
      alert("Message blocked by filter.");
      return;
    }

    const isToxic = await checkToxicity(input);
    if (isToxic) {
      alert("Message flagged by moderation. Keep it friendly.");
      return;
    }

    const now = Date.now();
    if (now - lastSendRef.current < 5000) {
      setCooldown(Math.ceil((5000 - (now - lastSendRef.current)) / 1000));
      return;
    }

    const msgRef = push(ref(db, "messages"));
    await set(msgRef, {
      text: input.trim(),
      username: username || "Guest",
      color,
      country,
      countryName,
      timestamp: now,
    });

    setInput("");
    lastSendRef.current = now;
    setCooldown(5);
  }, [input, cooldown, username, color, country, countryName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight">THE LOBBY</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {onlineCount.toLocaleString()} online
            </span>
            <button onClick={() => setShowRules(!showRules)} className="hover:text-neutral-200 transition-colors">
              Rules
            </button>
          </div>
        </div>
      </header>

      {showRules && (
        <div className="bg-neutral-900 border-b border-neutral-800">
          <div className="max-w-3xl mx-auto px-4 py-2 text-xs text-neutral-400 flex justify-between items-center">
            <span>Be kind. No links. No spam. All languages welcome.</span>
            <button onClick={() => setShowRules(false)} className="hover:text-white text-lg leading-none">×</button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-neutral-600 py-20">
              <p className="text-lg mb-2">The room is empty...</p>
              <p className="text-sm">Be the first to say something to the world.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <img
                src={FLAG_API(msg.country)}
                alt={msg.countryName}
                className="w-6 h-4 rounded-sm mt-1 object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: msg.color }}>
                    {msg.username}
                  </span>
                  <span className="text-xs text-neutral-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-neutral-200 break-words leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-neutral-500"
            />
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-600 ml-auto">
              {cooldown > 0 ? `Wait ${cooldown}s` : `${input.length}/280`}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something to the world..."
              disabled={cooldown > 0}
              maxLength={280}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || cooldown > 0}
              className="bg-neutral-100 text-neutral-950 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
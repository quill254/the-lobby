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

async function checkToxicity(_text: string): Promise<boolean> {
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
      const msgs = Object.entries(data).map(([id, val]: [string, unknown]) => ({ id, ...(val as Record<string, unknown>) })) as Message[];
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
    const urlRegex = /(https?:\/\/|www\.)\S+/i;
    if (urlRegex.test(input)) {
      alert("Links are not allowed.");
      return;
    }

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
    setIsTyping(false);
  }, [input, cooldown, username, color, country, countryName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 flex flex-col font-sans relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-900/10 blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              THE LOBBY
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-white/70">{onlineCount.toLocaleString()} online</span>
            </span>
            <button 
              onClick={() => setShowRules(!showRules)} 
              className="text-white/40 hover:text-white/80 transition-colors text-xs uppercase tracking-wider"
            >
              Rules
            </button>
          </div>
        </div>
      </header>

      {/* Rules Toast */}
      {showRules && (
        <div className="relative z-10 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto px-4 pt-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex justify-between items-center backdrop-blur-sm">
              <span className="text-xs text-white/50">Be kind. No links. No spam. All languages welcome.</span>
              <button onClick={() => setShowRules(false)} className="text-white/30 hover:text-white/70 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-32 animate-in fade-in duration-700">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg text-white/30 font-medium mb-2">The room is empty...</p>
              <p className="text-sm text-white/20">Be the first to say something to the world.</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className="group flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative flex-shrink-0 mt-1">
                <img
                  src={FLAG_API(msg.country)}
                  alt={msg.countryName}
                  className="w-7 h-5 rounded-md object-cover shadow-lg"
                  loading="lazy"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0f]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-semibold text-sm" style={{ color: msg.color }}>
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">
                    {msg.countryName}
                  </span>
                  <span className="text-xs text-white/15">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] rounded-2xl rounded-tl-sm px-4 py-2.5 transition-all duration-200 group-hover:translate-x-0.5">
                  <p className="text-sm text-white/80 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Dock */}
      <footer className="relative z-10 border-t border-white/5 bg-black/30 backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-28 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all text-white/70 placeholder:text-white/20"
              />
            </div>
            
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all duration-200 ${color === c ? "ring-2 ring-white/50 scale-110" : "opacity-40 hover:opacity-70"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              {isTyping && (
                <span className="text-[10px] text-white/30 uppercase tracking-wider animate-in fade-in">
                  Typing...
                </span>
              )}
              <span className={`text-xs transition-colors ${input.length > 250 ? "text-amber-400/70" : "text-white/20"}`}>
                {cooldown > 0 ? `Wait ${cooldown}s` : `${input.length}/280`}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Say something to the world..."
              disabled={cooldown > 0}
              maxLength={280}
              className="w-full bg-white/[0.04] border border-white/10 hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06] rounded-2xl px-5 py-4 pr-16 text-sm focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/80 placeholder:text-white/20"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || cooldown > 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black font-semibold px-4 py-2 rounded-xl text-xs hover:bg-white/90 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  set,
  serverTimestamp,
  onDisconnect,
  remove,
} from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Flag, Shield } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  username: string;
  country: string;
  timestamp: number;
  deviceId: string;
}

const MAX_MESSAGES = 100;
const BANNED_WORDS = ["spam", "scam", "http://", "https://"];

function getDeviceId() {
  let id = localStorage.getItem("lobby_device_id");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("lobby_device_id", id);
  }
  return id;
}

function generateUsername() {
  const adjectives = ["Cool", "Dark", "Neon", "Cyber", "Retro", "Fast"];
  const nouns = ["Ghost", "Wolf", "Shadow", "Viper", "Nova", "Flux"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
    nouns[Math.floor(Math.random() * nouns.length)]
  }${Math.floor(Math.random() * 999)}`;
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("🌐");
  const [isBanned, setIsBanned] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const deviceId = useRef(getDeviceId());

  useEffect(() => {
    setUsername(generateUsername());
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => setCountry(data.country_code || "🌐"))
      .catch(() => setCountry("🌐"));
  }, []);

  useEffect(() => {
    const banRef = ref(db, `bans/${deviceId.current}`);
    onValue(banRef, (snap) => {
      setIsBanned(snap.exists());
    });
  }, []);

  useEffect(() => {
    const msgsRef = ref(db, "messages");
    onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const arr = Object.entries(data).map(([id, val]: [string, any]) => ({
        id,
        ...val,
      }));
      setMessages(arr.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, MAX_MESSAGES));
    });
  }, []);

  useEffect(() => {
    const presenceRef = ref(db, "presence/" + deviceId.current);
    set(presenceRef, serverTimestamp());
    onDisconnect(presenceRef).remove();

    const allPresenceRef = ref(db, "presence");
    onValue(allPresenceRef, (snap) => {
      setOnlineCount(Object.keys(snap.val() || {}).length);
    });

    return () => {
      remove(presenceRef);
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (!input.trim() || isBanned) return;
    if (BANNED_WORDS.some((w) => input.toLowerCase().includes(w))) {
      alert("Message contains blocked content.");
      return;
    }

    const msgsRef = ref(db, "messages");
    push(msgsRef, {
      text: input.trim(),
      username,
      country,
      timestamp: Date.now(),
      deviceId: deviceId.current,
    });
    setInput("");
  }, [input, username, country, isBanned]);

  const reportMessage = (msgId: string) => {
    const reason = prompt("Report reason?");
    if (!reason) return;
    push(ref(db, "reports"), {
      messageId: msgId,
      reason,
      timestamp: Date.now(),
    });
    alert("Reported. Thanks.");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isBanned) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400">You are banned</h2>
          <p className="text-neutral-400 mt-2">This device has been restricted from The Lobby.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Users className="w-4 h-4" />
          <span>{onlineCount} online</span>
        </div>
        <div className="text-xs text-neutral-500">
          You are <span className="text-indigo-400 font-semibold">{username}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-2 mb-4 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence>
          {[...messages].reverse().map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">{msg.country}</span>
                <span className="text-sm font-semibold text-indigo-300">
                  {msg.username}
                </span>
                <span className="text-xs text-neutral-600 ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed">{msg.text}</p>
              <button
                onClick={() => reportMessage(msg.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
              >
                <Flag className="w-3 h-3" /> Report
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Say something..."
          maxLength={500}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
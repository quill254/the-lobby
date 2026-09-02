"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, remove } from "firebase/database";
import { motion } from "framer-motion";
import { Shield, Trash2, Ban, AlertTriangle } from "lucide-react";

const ADMIN_PASSWORD = "lobby2026";

interface Message {
  id: string;
  text: string;
  username: string;
  country: string;
  timestamp: number;
  deviceId: string;
}

interface Report {
  id: string;
  messageId: string;
  reason: string;
  timestamp: number;
}

export default function GodMode() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"live" | "reports">("live");

  useEffect(() => {
    if (!authenticated) return;

    const msgsRef = ref(db, "messages");
    onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const arr = Object.entries(data).map(([id, val]: [string, any]) => ({
        id,
        ...val,
      }));
      setMessages(arr.sort((a: any, b: any) => b.timestamp - a.timestamp));
    });

    const reportsRef = ref(db, "reports");
    onValue(reportsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const arr = Object.entries(data).map(([id, val]: [string, any]) => ({
        id,
        ...val,
      }));
      setReports(arr.sort((a: any, b: any) => b.timestamp - a.timestamp));
    });

    return () => {
      off(msgsRef);
      off(reportsRef);
    };
  }, [authenticated]);

  const checkPassword = () => {
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else alert("Wrong password");
  };

  const deleteMessage = async (id: string) => {
    await remove(ref(db, `messages/${id}`));
  };

  const banDevice = async (deviceId: string) => {
    await set(ref(db, `bans/${deviceId}`), true);
    alert(`Banned ${deviceId.slice(0, 16)}...`);
  };

  const purgeAll = async () => {
    if (!confirm("DELETE ALL MESSAGES?")) return;
    await remove(ref(db, "messages"));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm backdrop-blur-md"
        >
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-6 text-center">GOD MODE</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkPassword()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 mb-4 text-white placeholder:text-neutral-600"
          />
          <button
            onClick={checkPassword}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            Enter
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-red-500 flex items-center gap-2">
          <Shield className="w-6 h-6" /> GOD MODE
        </h1>

        <div className="flex gap-4 mb-6">
          {(["live", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab} {tab === "reports" && reports.length > 0 && `(${reports.length})`}
            </button>
          ))}
          <button
            onClick={purgeAll}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> PURGE ALL
          </button>
        </div>

        {activeTab === "live" && (
          <div className="space-y-2">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-neutral-900/80 border border-white/5 p-3 rounded-lg flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-500">{msg.country}</span>
                    <span className="font-semibold text-sm text-indigo-300">{msg.username}</span>
                    <span className="text-xs text-neutral-600 font-mono">
                      {msg.deviceId?.slice(0, 12)}...
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">{msg.text}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => msg.deviceId && banDevice(msg.deviceId)}
                    className="px-3 py-1 bg-red-600/20 text-red-400 text-xs rounded hover:bg-red-600/30 flex items-center gap-1"
                  >
                    <Ban className="w-3 h-3" /> Ban
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="px-3 py-1 bg-neutral-700 text-xs rounded hover:bg-neutral-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-2">
            {reports.length === 0 && <p className="text-neutral-500">No reports yet.</p>}
            {reports.map((r) => (
              <div key={r.id} className="bg-neutral-900 p-3 rounded-lg border border-white/5">
                <p className="text-sm">
                  Report on message: <span className="font-mono text-xs text-neutral-500">{r.messageId}</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">Reason: {r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, remove, off } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig, "admin");
const db = getDatabase(app);

interface Message {
  id: string;
  text: string;
  username: string;
  country: string;
  timestamp: number;
}

export default function GodMode() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const msgsRef = ref(db, "messages");
    onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const arr = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      setMessages(arr.reverse());
    });
    return () => off(msgsRef);
  }, []);

  const deleteMessage = async (id: string) => {
    await remove(ref(db, `messages/${id}`));
  };

  const purgeAll = async () => {
    if (!confirm("DELETE ALL MESSAGES? This cannot be undone.")) return;
    await remove(ref(db, "messages"));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-red-500">🛡️ GOD MODE</h1>
        <button
          onClick={purgeAll}
          className="mb-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
        >
          ☢️ PURGE ALL
        </button>

        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-neutral-900 p-3 rounded-lg flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-neutral-500">{msg.country}</span>
                  <span className="font-semibold text-sm">{msg.username}</span>
                </div>
                <p className="text-sm text-neutral-300">{msg.text}</p>
              </div>
              <button
                onClick={() => deleteMessage(msg.id)}
                className="px-3 py-1 bg-neutral-700 text-xs rounded hover:bg-neutral-600 ml-4"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
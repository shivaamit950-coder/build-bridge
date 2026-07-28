"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/supabaseClient";

export default function ChatRoom({ conversationId, currentUserId, otherProfile, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const supabase = createClient();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => (prev.find((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage(body, attachment_url, attachment_type) {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUserId, body, attachment_url, attachment_type })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => (prev.find((m) => m.id === data.id) ? prev : [...prev, data]));
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await sendMessage(text, null, null);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${conversationId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file);
    if (!error) {
      const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);
      await sendMessage(file.name, pub.publicUrl, "file");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setUploading(true);
        const path = `${conversationId}/${Date.now()}-voice.webm`;
        const { error } = await supabase.storage.from("voice-notes").upload(path, blob);
        if (!error) {
          const { data: pub } = supabase.storage.from("voice-notes").getPublicUrl(path);
          await sendMessage("Voice note", pub.publicUrl, "voice");
        }
        setUploading(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert("Microphone access denied or unavailable.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function startVideoCall() {
    const meetLink = `https://meet.google.com/new`;
    await sendMessage(`📹 Video call started — join here: ${meetLink}`, meetLink, "video");
  }

  return (
    <main className="max-w-lg mx-auto flex flex-col h-screen">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Link href="/messages" className="text-slate-400 text-lg">←</Link>
          <div className="w-9 h-9 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold text-sm">
            {otherProfile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy dark:text-white truncate">{otherProfile.name}</p>
          </div>
          <button
            onClick={startVideoCall}
            aria-label="Start video call"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald/10 text-emerald text-sm"
          >
            📹
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={m.sender_id === currentUserId} />
        ))}
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-400 pt-10">
            Say hi to {otherProfile.name} — this is the start of your conversation.
          </p>
        )}
      </div>

      <form onSubmit={handleSend} className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-20 bg-white dark:bg-[#0B1120] space-y-2">
        {uploading && <p className="text-[11px] text-slate-400">Uploading…</p>}
        <div className="flex gap-2 items-center">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm shrink-0"
          >
            📎
          </button>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-label="Record voice note"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 ${
              recording ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {recording ? "■" : "🎙"}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message…"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] outline-none focus:border-royal text-sm text-navy dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-2xl bg-royal text-white text-sm font-medium shadow-soft shrink-0"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}

function MessageBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} fade-in`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isMine ? "bg-royal text-white rounded-br-md" : "card text-navy dark:text-slate-200 rounded-bl-md"
        }`}
      >
        {message.attachment_type === "voice" ? (
          <audio controls src={message.attachment_url} className="max-w-full" />
        ) : message.attachment_type === "file" ? (
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1">
            📎 {message.body}
          </a>
        ) : message.attachment_type === "video" ? (
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="underline">
            {message.body}
          </a>
        ) : (
          <span className="whitespace-pre-wrap">{message.body}</span>
        )}
      </div>
    </div>
  );
}

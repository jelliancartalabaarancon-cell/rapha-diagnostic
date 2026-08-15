"use client";

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage() {
  if (!message.trim() || loading) return;

  const userMessage = {
    role: "user" as const,
    content: message,
  };

  setMessages((prev) => [...prev, userMessage]);

setMessage("");

setLoading(true);

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.reply,
      },
    ]);

    

  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Sorry, something went wrong.",
      },
    ]);

  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  chatEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, loading]);

  return (
    <>
      {/* Floating Button */}
      <button
  onClick={() => setOpen(!open)}
  className="fixed bottom-5 right-5 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
>
  <img
    src="/robot.png"
    alt="Chatbot"
    className="w-8 h-8"
  />
</button>


      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-96 bg-white border shadow-xl rounded-xl p-4">

          <div className="flex justify-between mb-3">
            <h2 className="font-bold">
              RAPHA AI Assistant
            </h2>

            <button onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>


          <div className="h-64 overflow-y-auto border rounded p-2 mb-3">
            {messages.length === 0 && (
              <p className="text-gray-500">
                Hello! How can I help you today?
              </p>
            )}

            {messages.map((msg, index) => (
  <div
    key={index}
    className={`flex mb-2 ${
      msg.role === "user"
        ? "justify-end"
        : "justify-start"
    }`}
  >
    <div
      className={`max-w-[75%] px-3 py-2 rounded-lg ${
        msg.role === "user"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      <p className="text-xs font-bold mb-1">
        {msg.role === "user"
          ? "You"
          : "RAPHA DIAGNOSTIC LABORATORY"}
      </p>

      <Markdown>
  {msg.content}
</Markdown>
    </div>
  </div>
))}
            {loading && (
  <div className="flex mb-2 justify-start">
    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
      <p className="text-xs font-bold mb-1">
        RAPHA
      </p>

      <p className="italic">
        RAPHA AI is typing...
      </p>
    </div>
  </div>
)}

<div ref={chatEndRef} />
          </div>


          <div className="flex gap-2">
            <input
             disabled={loading}
              className="border rounded px-2 py-1 flex-1 disabled:bg-gray-100"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask RAPHA..."
              onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    sendMessage();
  }
}}
            />

            <button
  onClick={sendMessage}
  disabled={loading}
  className="bg-blue-600 text-white px-3 rounded disabled:opacity-50"
>
  {loading ? "Sending..." : "Send"}
</button>
          </div>

        </div>
      )}
    </>
  );
}

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
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 sm:bottom-5 sm:right-5"
      >
        <img
          src="/robot.png"
          alt="Chatbot"
          className="h-8 w-8"
        />
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="
            fixed
            bottom-20
            left-4
            right-4
            z-50
            flex
            max-h-[calc(100vh-6rem)]
            flex-col
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-3
            shadow-2xl

            sm:left-auto
            sm:right-5
            sm:w-[380px]
            sm:p-4

            md:w-96
          "
        >
          {/* Header */}
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-800">
                RAPHA AI Assistant
              </h2>

              <p className="text-xs text-slate-400">
                RAPHA Diagnostic Laboratory
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              rounded-lg
              border
              border-slate-200
              p-2
              sm:p-3
            "
          >
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                Hello! How can I help you today?
              </p>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%]
                    overflow-hidden
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    sm:max-w-[75%]
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }
                  `}
                >
                  <p className="mb-1 text-xs font-bold">
                    {msg.role === "user"
                      ? "You"
                      : "RAPHA DIAGNOSTIC LABORATORY"}
                  </p>

                  <div className="break-words">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-2 flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-gray-200 px-3 py-2 text-gray-800 sm:max-w-[75%]">
                  <p className="mb-1 text-xs font-bold">
                    RAPHA
                  </p>

                  <p className="text-sm italic">
                    RAPHA AI is typing...
                  </p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="mt-3 flex shrink-0 gap-2">
            <input
              type="text"
              disabled={loading}
              className="
                min-w-0
                flex-1
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
                disabled:bg-gray-100
              "
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask RAPHA..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  sendMessage();
                }
              }}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="
                shrink-0
                rounded-lg
                bg-blue-600
                px-3
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:px-4
              "
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}


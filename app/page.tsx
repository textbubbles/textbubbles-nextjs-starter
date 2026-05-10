"use client";

import { useState, type FormEvent } from "react";

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Home() {
  const [recipient, setRecipient] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<SendStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/textbubbles/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, text }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        setStatus({
          kind: "error",
          message: data?.detail || data?.error || `Request failed (${response.status})`,
        });
        return;
      }

      setStatus({ kind: "success" });
      setText("");
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Network error",
      });
    }
  }

  const isSending = status.kind === "sending";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">textbubbles starter</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Recipient</span>
            <input
              type="tel"
              required
              placeholder="+11231234567"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isSending}
              className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Message</span>
            <textarea
              required
              rows={4}
              placeholder="Type your message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSending}
              className="resize-y rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400"
            />
          </label>
          <button
            type="submit"
            disabled={isSending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isSending ? "Sending…" : "Send"}
          </button>
        </form>

        {status.kind === "success" && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">Sent</p>
        )}
        {status.kind === "error" && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{status.message}</p>
        )}
      </div>
    </main>
  );
}

import { listInboundMessages } from "@/lib/message-store";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const messages = listInboundMessages();
  const webhookUrl = process.env.TEXTBUBBLES_WEBHOOK_URL;

  return (
    <main className="flex flex-1 flex-col items-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Inbox</h1>

        {webhookUrl && (
          <p className="mb-4 break-all text-xs text-zinc-500">
            Webhook URL: <code>{webhookUrl}</code>
          </p>
        )}

        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No messages yet. Send one to your TextBubbles number to see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="mb-1 flex justify-between text-xs text-zinc-500">
                  <span>{m.from}</span>
                  <time>{new Date(m.receivedAt).toLocaleString()}</time>
                </div>
                <p className="whitespace-pre-wrap text-sm">{m.text || <em>(no text)</em>}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

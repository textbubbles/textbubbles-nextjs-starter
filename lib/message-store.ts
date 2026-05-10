export type InboundMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  receivedAt: string;
};

const MAX_MESSAGES = 100;

// Pin the store on globalThis so dev-mode hot reloads don't wipe history.
const globalForStore = globalThis as unknown as {
  __textbubblesInbox?: InboundMessage[];
};

const store: InboundMessage[] =
  globalForStore.__textbubblesInbox ?? (globalForStore.__textbubblesInbox = []);

export function addInboundMessage(message: InboundMessage) {
  store.unshift(message);
  if (store.length > MAX_MESSAGES) store.length = MAX_MESSAGES;
}

export function listInboundMessages(): InboundMessage[] {
  return [...store];
}

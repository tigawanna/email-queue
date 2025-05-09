import { kv } from "@/db/kv.ts";
import { KV_TELEGRAM, KV_MESSAGES } from "@/consts.ts";
import { TelegramPayload } from "@/models/telegram.ts";

// type TelegramPayload = {
//     clientName: string;
//     type: string;
//     data: string;
//     persist?: boolean | undefined;
// }
export interface SaveTelegramToKv extends TelegramPayload {
  sent: "success" | "failed";
  issue?: string;
  type: "telegram";
}

export async function saveTelegramToKV(payload: SaveTelegramToKv) {
  const timestamp = new Date().toISOString();
  const value = JSON.stringify(payload);
  await kv.set(
    [KV_MESSAGES, payload.clientName, KV_TELEGRAM, payload.sent, payload.type, timestamp],
    value
  );
}

interface ListKVTelegramProps extends Partial<TelegramPayload> {
  sent?: "success" | "failed";
    type?: "telegram";
}

export async function getTelegramFromKV({ clientName, type, sent }: ListKVTelegramProps) {
  // Define all possible key parts in order
  // Filter out any undefined or null values
  const keys: string[] = [KV_MESSAGES];
  if (clientName) {
    keys.push(clientName);
    keys.push(KV_TELEGRAM);
    if (sent) {
      keys.push(sent);
      if (type) {
        keys.push(type);
      }
    }
  }

  const iter = kv.list<string>({ prefix: keys });
  const telegrams = [];

  for await (const entry of iter) {
    const telegram = {
      key: entry.key,
      value:entry.value,
      versionstamp: entry.versionstamp,
    };
    telegrams.push(telegram);
  }

  return telegrams;
}

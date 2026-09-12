import { sha256Hex } from "./crypto";

export async function safetyNumber(myKey: string, theirKey: string): Promise<string> {
  const [a, b] = [myKey, theirKey].sort();
  const hex = await sha256Hex(`${a}:${b}`);
  const digits = hex
    .replace(/[a-f]/g, (ch) => String((ch.charCodeAt(0) - 87) % 10))
    .slice(0, 36);
  const parts: string[] = [];
  for (let i = 0; i < 36; i += 4) parts.push(digits.slice(i, i + 4));
  return parts.join(" ");
}

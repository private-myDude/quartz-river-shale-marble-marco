import { sealToKv, unsealFromKv } from "./sealed";

const KEY = "circle-names";

export async function rememberCircleName(id: string, name: string): Promise<void> {
  const map = (await unsealFromKv<Record<string, string>>(KEY)) ?? {};
  map[id] = name;
  await sealToKv(KEY, map);
}

export async function circleNameMap(): Promise<Record<string, string>> {
  return (await unsealFromKv<Record<string, string>>(KEY)) ?? {};
}

export function overlayCircleNames<T extends { id: string; name: string }>(
  circles: T[],
  names: Record<string, string>,
): T[] {
  return circles.map((c) => (names[c.id] ? { ...c, name: names[c.id]! } : c));
}

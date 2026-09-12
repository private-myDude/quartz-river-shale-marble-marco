/** Compact QR (byte mode, ECC L) for otpauth URLs. */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGf() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255]!;
})();

function gfMul(a: number, b: number): number {
  if (!a || !b) return 0;
  return GF_EXP[GF_LOG[a]! + GF_LOG[b]!]!;
}

function rsGenerator(ec: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ec; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= gfMul(poly[j]!, GF_EXP[i]!);
      next[j + 1] ^= poly[j]!;
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ec: number): Uint8Array {
  const gen = rsGenerator(ec);
  const res = new Uint8Array(data.length + ec);
  res.set(data);
  for (let i = 0; i < data.length; i += 1) {
    const coef = res[i]!;
    if (!coef) continue;
    for (let j = 0; j < gen.length; j += 1) res[i + j] ^= gfMul(gen[j]!, coef);
  }
  return res.slice(data.length);
}

const VERSIONS: { v: number; modules: number; data: number; ec: number }[] = [
  { v: 2, modules: 25, data: 32, ec: 10 },
  { v: 3, modules: 29, data: 44, ec: 15 },
  { v: 4, modules: 33, data: 64, ec: 20 },
  { v: 5, modules: 37, data: 86, ec: 26 },
  { v: 6, modules: 41, data: 108, ec: 18 },
  { v: 7, modules: 45, data: 124, ec: 20 },
];

function bitPush(bits: number[], val: number, len: number) {
  for (let i = len - 1; i >= 0; i -= 1) bits.push((val >>> i) & 1);
}

export function qrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const need = bytes.length + 3;
  const ver = VERSIONS.find((row) => row.data >= need) ?? VERSIONS[VERSIONS.length - 1]!;
  const bits: number[] = [];
  bitPush(bits, 0b0100, 4);
  bitPush(bits, bytes.length, 8);
  for (const b of bytes) bitPush(bits, b, 8);
  bitPush(bits, 0, 4);
  while (bits.length % 8) bits.push(0);
  const data = new Uint8Array(ver.data);
  for (let i = 0; i < ver.data; i += 1) {
    let v = 0;
    for (let b = 0; b < 8; b += 1) v = (v << 1) | (bits[i * 8 + b] ?? 0);
    data[i] = i < Math.floor(bits.length / 8) ? v : i % 2 === 0 ? 0xec : 0x11;
  }
  const ecc = rsEncode(data, ver.ec);
  const stream = [...data, ...ecc];
  const n = ver.modules;
  const grid: (boolean | null)[][] = Array.from({ length: n }, () => Array<boolean | null>(n).fill(null));

  function finder(x: number, y: number) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        const on = dx === -1 || dy === -1 || dx === 7 || dy === 7
          ? false
          : dx === 0 || dy === 0 || dx === 6 || dy === 6
            ? true
            : dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        grid[yy]![xx] = on;
      }
    }
  }
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  for (let i = 8; i < n - 8; i += 1) {
    grid[6]![i] = i % 2 === 0;
    grid[i]![6] = i % 2 === 0;
  }
  grid[n - 8]![8] = true;

  let bit = 0;
  const total = stream.length * 8;
  const getBit = () => {
    const b = stream[Math.floor(bit / 8)] ?? 0;
    const v = (b >>> (7 - (bit % 8))) & 1;
    bit += 1;
    return v;
  };
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (let t = 0; t < n; t += 1) {
      for (let k = 0; k < 2; k += 1) {
        const x = col - k;
        const up = Math.floor((n - 1 - col) / 2) % 2 === 0;
        const y = up ? n - 1 - t : t;
        if (grid[y]![x] != null) continue;
        let v = bit < total ? getBit() : 0;
        if (((y + x) % 2) === 0) v ^= 1;
        grid[y]![x] = Boolean(v);
      }
    }
  }
  return grid.map((row) => row.map((cell) => Boolean(cell)));
}

export function qrSvg(text: string, size = 192): string {
  const m = qrMatrix(text);
  const n = m.length;
  const quiet = 2;
  const dim = n + quiet * 2;
  let path = "";
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (m[y]![x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#f4f5f8"/><path fill="#07080c" d="${path}"/></svg>`;
}

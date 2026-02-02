export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString();
}

export function pkToBytes32(pk: Uint8Array): string {
  if (pk.length !== 32) throw new Error('pk must be 32 bytes');
  return Array.from(pk)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(0, 64);
}

export function bytes32ToPk(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length !== 64) throw new Error('bytes32 hex must be 64 chars');
  const arr = new Uint8Array(32);
  for (let i = 0; i < 32; i++) arr[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return arr;
}
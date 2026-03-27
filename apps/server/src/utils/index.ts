export function convertUUIDtoBinaryHex(rawUUID: string): Buffer {
  return Buffer.from(rawUUID.replace(/-/g, ''), 'hex');
}

export function convertBinaryHexToUUID(binary: Buffer): string {
  const hex = binary.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

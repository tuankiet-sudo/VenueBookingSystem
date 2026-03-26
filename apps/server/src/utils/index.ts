export function convertUUIDtoBinaryHex(rawUUID: string): Buffer {
  return Buffer.from(rawUUID.replace(/-/g, ''), 'hex');
}

export function convertBinaryHexToUUID(binary: Buffer): string {
  const { stringify: uuidStringify } = require('uuid');
  return uuidStringify(binary);
}

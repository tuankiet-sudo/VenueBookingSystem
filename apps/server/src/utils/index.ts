export function convertUUIDtoBinaryHex(rawUUID: string): Buffer {
  if (typeof rawUUID !== 'string') {
    throw new TypeError(`Expected string, got ${typeof rawUUID}`);
  }
  return Buffer.from(rawUUID.replace(/-/g, ''), 'hex');
}

export function convertBinaryHexToUUID(binary: Buffer): string {
  const { stringify: uuidStringify } = require('uuid');
  return uuidStringify(binary);
}

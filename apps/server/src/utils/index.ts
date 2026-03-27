export function convertUUIDtoBinaryHex(rawUUID: string): Buffer {
  console.log('Converting UUID to binary hex:', rawUUID);
  if (typeof rawUUID !== 'string') {
    throw new TypeError(`Expected string, got ${typeof rawUUID}: ${rawUUID}`);
  }
  return Buffer.from(rawUUID.replace(/-/g, ''), 'hex');
}

export function convertBinaryHexToUUID(binary: Buffer): string {
  const { stringify: uuidStringify } = require('uuid');
  return uuidStringify(binary);
}

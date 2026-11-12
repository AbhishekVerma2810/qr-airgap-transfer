const FORMAT = 'deflate-raw';

async function pipeThrough(bytes, transform) {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Compress bytes with deflate so fewer QR codes are needed.
 * @param {Uint8Array} bytes
 * @returns {Promise<Uint8Array>}
 */
export function compress(bytes) {
  return pipeThrough(bytes, new CompressionStream(FORMAT));
}

/**
 * Reverse of {@link compress}.
 * @param {Uint8Array} bytes
 * @returns {Promise<Uint8Array>}
 */
export function decompress(bytes) {
  return pipeThrough(bytes, new DecompressionStream(FORMAT));
}

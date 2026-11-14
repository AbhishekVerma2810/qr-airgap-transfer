import { BASE64_SLICE_SIZE } from '../config.js';

/**
 * Encode bytes as a base64 string (safe for very large inputs).
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += BASE64_SLICE_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_SLICE_SIZE));
  }
  return btoa(binary);
}

/**
 * Decode a base64 string back into bytes.
 * @param {string} text
 * @returns {Uint8Array}
 */
export function base64ToBytes(text) {
  const binary = atob(text);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

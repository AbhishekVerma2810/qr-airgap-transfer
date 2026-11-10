/**
 * Find a QR code in raw pixels.
 * @param {ImageData} imageData
 * @returns {string|null} QR text, or null when none is found
 */
export function readQrFromImageData(imageData) {
  const result = globalThis.jsQR(imageData.data, imageData.width, imageData.height);
  return result ? result.data : null;
}

function drawToImageData(source, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(source, 0, 0);
  return context.getImageData(0, 0, width, height);
}

/**
 * Read the QR code in an uploaded image file.
 * @param {File} file
 * @returns {Promise<string|null>}
 */
export async function readQrFromFile(file) {
  const bitmap = await createImageBitmap(file);
  const imageData = drawToImageData(bitmap, bitmap.width, bitmap.height);
  bitmap.close();
  return readQrFromImageData(imageData);
}

/**
 * Read the QR code in the current frame of a playing video.
 * @param {HTMLVideoElement} video
 * @returns {string|null}
 */
export function readQrFromVideo(video) {
  if (!video.videoWidth) return null;
  return readQrFromImageData(drawToImageData(video, video.videoWidth, video.videoHeight));
}

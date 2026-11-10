import { readQrFromVideo } from './reader.js';

/** Streams the camera into a video element and reports every QR text seen. */
export class CameraScanner {
  #stream = null;
  #running = false;

  /**
   * @param {HTMLVideoElement} video
   * @param {(text: string) => void} onText called for each QR read
   */
  async start(video, onText) {
    this.#stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    video.srcObject = this.#stream;
    await video.play();
    this.#running = true;
    this.#loop(video, onText);
  }

  stop() {
    this.#running = false;
    this.#stream?.getTracks().forEach((track) => track.stop());
    this.#stream = null;
  }

  #loop(video, onText) {
    if (!this.#running) return;
    const text = readQrFromVideo(video);
    if (text) onText(text);
    requestAnimationFrame(() => this.#loop(video, onText));
  }
}

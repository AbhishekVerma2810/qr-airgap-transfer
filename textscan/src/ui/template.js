/** HTML for the QR-to-text tab. Ids start with "txt-" so they never clash with other tabs. */
export const TEXTSCAN_HTML = `
  <h2>QR to Text</h2>
  <button id="txt-camera">Start camera</button>
  <label class="file-label">
    Or upload QR images
    <input type="file" id="txt-files" accept="image/*" multiple />
  </label>
  <button id="txt-reset">Reset</button>
  <video id="txt-video" playsinline muted hidden></video>
  <p id="txt-progress" role="status"></p>
  <textarea id="txt-output" rows="6" readonly placeholder="Decoded text appears here"></textarea>
  <button id="txt-copy" disabled>Copy text</button>
  <p id="txt-read-status" role="status"></p>
`;

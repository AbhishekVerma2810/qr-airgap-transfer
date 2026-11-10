/** HTML for the reader tab. */
export const READER_HTML = `
  <button id="camera-button">Start camera</button>
  <label class="file-label">
    Or upload QR images
    <input type="file" id="scan-files" accept="image/*" multiple />
  </label>
  <button id="scan-reset">Reset</button>
  <button id="restore-button" hidden>Save folder</button>
  <video id="scan-video" playsinline muted></video>
  <progress id="scan-progress" value="0" max="1"></progress>
  <p id="scan-summary"></p>
  <p id="scan-missing"></p>
  <p id="scan-status" role="status"></p>
`;

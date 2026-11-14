/** HTML for the QR-to-text tab. Ids start with "txt-" so they never clash with other tabs. */
export const TEXTSCAN_HTML = `
  <div class="card">
    <h2><span class="step">1</span> Scan the QR code</h2>
    <div class="actions">
      <button id="txt-camera" class="primary">Start camera</button>
      <label class="file-label">
        <input type="file" id="txt-files" accept="image/*" multiple />
      </label>
      <button id="txt-reset" class="ghost">Reset</button>
    </div>
    <p class="hint">Use the camera, or upload images of the QR codes. Several parts can be read in any order.</p>
    <video id="txt-video" playsinline muted hidden></video>
    <p id="txt-progress" class="hint" role="status"></p>
  </div>
  <div class="card">
    <h2><span class="step">2</span> Your text</h2>
    <textarea id="txt-output" rows="6" readonly placeholder="Decoded text appears here"></textarea>
    <div class="actions">
      <button id="txt-copy" class="primary" disabled>Copy text</button>
    </div>
    <p id="txt-read-status" role="status"></p>
  </div>
`;

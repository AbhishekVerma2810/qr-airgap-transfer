/** HTML for the reader tab. */
export const READER_HTML = `
  <div class="card">
    <h2><span class="step">1</span> Scan the QR codes</h2>
    <div class="actions">
      <button id="camera-button" class="primary">Start camera</button>
      <label class="file-label">
        <input type="file" id="scan-files" accept="image/*" multiple />
      </label>
      <button id="scan-reset" class="ghost">Reset</button>
    </div>
    <p class="hint">Use the camera, or upload screenshots and photos of the codes (select many at once).</p>
    <video id="scan-video" playsinline muted hidden></video>
  </div>
  <div class="card">
    <h2><span class="step">2</span> Progress</h2>
    <p id="scan-percent" class="percent" role="status"></p>
    <progress id="scan-progress" value="0" max="1"></progress>
    <p id="scan-summary"></p>
    <p id="scan-missing" class="hint"></p>
    <p id="scan-status" role="status"></p>
    <div class="actions">
      <button id="restore-button" class="primary" hidden>Save folder</button>
    </div>
  </div>
`;

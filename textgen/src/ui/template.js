/** HTML for the text-to-QR tab. Ids start with "txt-" so they never clash with other tabs. */
export const TEXTGEN_HTML = `
  <div class="card">
    <h2><span class="step">1</span> Enter your text</h2>
    <textarea id="txt-input" rows="6" placeholder="Type or paste text here"></textarea>
    <label class="field">
      Characters per QR: <output id="txt-chunk-label"></output>
      <input type="range" id="txt-chunk" />
    </label>
    <p class="hint">Short text becomes one ordinary QR code that any phone scanner can read.</p>
    <div class="actions">
      <button id="txt-make" class="primary">Create QR code</button>
    </div>
    <p id="txt-make-status" role="status"></p>
    <div id="txt-grid" class="qr-results"></div>
  </div>
`;

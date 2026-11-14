/** HTML for the text-to-QR tab. Ids start with "txt-" so they never clash with other tabs. */
export const TEXTGEN_HTML = `
  <h2>Text to QR</h2>
  <textarea id="txt-input" rows="6" placeholder="Type or paste text here"></textarea>
  <label>
    Characters per QR: <output id="txt-chunk-label"></output>
    <input type="range" id="txt-chunk" />
  </label>
  <p class="hint">Short text becomes one ordinary QR code that any phone scanner can read.</p>
  <button id="txt-make">Create QR code</button>
  <p id="txt-make-status" role="status"></p>
  <div id="txt-grid"></div>
`;

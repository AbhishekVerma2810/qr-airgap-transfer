/** HTML for the generator tab. */
export const GENERATOR_HTML = `
  <input type="file" id="gen-file" />
  <button id="folder-button">Choose folder</button>
  <button id="folder-compat-button">Choose folder (compatibility)</button>
  <input type="file" id="gen-folder" webkitdirectory hidden />
  <label class="inline">
    <input type="checkbox" id="skip-heavy" checked /> Skip node_modules and .git
  </label>
  <p class="hint">Tick the box above before choosing a folder.</p>
  <label>
    Characters per QR: <output id="chunk-size-label"></output>
    <input type="range" id="chunk-size" />
  </label>
  <p class="hint">Lower values make easier-to-scan codes but more of them.</p>
  <button id="gen-button">Create QR codes</button>
  <button id="download-all-button" hidden>Download all (ZIP)</button>
  <button id="slideshow-button">Slideshow</button>
  <div id="slideshow-controls" hidden>
    <button id="slide-prev" title="Previous (Left arrow)">&#9664;</button>
    <button id="slide-next" title="Next (Right arrow)">&#9654;</button>
    <label title="Milliseconds per slide">
      <input type="number" id="slide-speed" /> ms
    </label>
    <button id="slideshow-stop">Stop (Esc)</button>
  </div>
  <p id="gen-status" role="status"></p>
  <div id="qr-grid"></div>
`;

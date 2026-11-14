/** HTML for the generator tab. */
export const GENERATOR_HTML = `
  <div class="card">
    <h2><span class="step">1</span> Choose what to convert</h2>
    <div class="actions">
      <input type="file" id="gen-file" />
      <span class="or">or</span>
      <button id="folder-button">Choose folder</button>
      <button id="folder-compat-button" class="ghost">Choose folder (compatibility)</button>
    </div>
    <input type="file" id="gen-folder" webkitdirectory hidden />
    <label class="check">
      <input type="checkbox" id="skip-heavy" checked /> Skip node_modules and .git
    </label>
    <p class="hint">Tick the box before choosing a folder.</p>
    <div id="folder-tree-box" hidden>
      <p class="hint">Untick any file or folder you want to leave out.</p>
      <div class="actions">
        <button id="tree-all">Select all</button>
        <button id="tree-none">Select none</button>
      </div>
      <div id="folder-tree"></div>
    </div>
  </div>
  <div class="card">
    <h2><span class="step">2</span> Create the QR codes</h2>
    <label class="field">
      Characters per QR: <output id="chunk-size-label"></output>
      <input type="range" id="chunk-size" />
    </label>
    <p class="hint">Lower values make easier-to-scan codes but more of them.</p>
    <div class="actions">
      <button id="gen-button" class="primary">Create QR codes</button>
      <button id="slideshow-button">Slideshow</button>
      <button id="download-all-button" hidden>Download all (ZIP)</button>
    </div>
    <p id="gen-status" role="status"></p>
    <div id="qr-grid" class="qr-results"></div>
  </div>
  <div id="slideshow-controls" hidden>
    <span id="slide-info"></span>
    <label title="Jump to a part number">
      go to <input type="number" id="slide-jump" min="1" />
    </label>
    <button id="slide-prev" title="Previous (Left arrow)">&#9664;</button>
    <button id="slide-pause" title="Pause or resume">Pause</button>
    <button id="slide-next" title="Next (Right arrow)">&#9654;</button>
    <label title="Milliseconds per slide">
      <input type="number" id="slide-speed" /> ms
    </label>
    <button id="slideshow-stop">Stop (Esc)</button>
  </div>
  <div id="slide-stage" hidden></div>
`;

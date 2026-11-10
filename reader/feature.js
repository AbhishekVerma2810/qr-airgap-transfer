import { loadScript, loadStyle } from './src/shared/ui/assets.js';
import { READER_HTML } from './src/ui/template.js';
import { initScanView } from './src/ui/scanView.js';

/** Reader plug-in: QR codes -> original file or folder. Needs nothing from other folders. */
export const feature = {
  id: 'reader',
  label: 'Scan QR',
  async mount(container) {
    await Promise.all([
      loadStyle(new URL('./feature.css', import.meta.url)),
      loadScript(new URL('./lib/jsQR.js', import.meta.url)),
    ]);
    container.innerHTML = READER_HTML;
    initScanView();
  },
};

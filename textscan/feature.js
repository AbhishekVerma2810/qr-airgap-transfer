import { loadScript, loadStyle } from './src/shared/ui/assets.js';
import { TEXTSCAN_HTML } from './src/ui/template.js';
import { initScanView } from './src/ui/scanView.js';

/** QR-to-text plug-in. Needs nothing from other folders. */
export const feature = {
  id: 'textscan',
  label: 'QR to Text',
  async mount(container) {
    await Promise.all([
      loadStyle(new URL('./feature.css', import.meta.url)),
      loadScript(new URL('./lib/jsQR.js', import.meta.url)),
    ]);
    container.innerHTML = TEXTSCAN_HTML;
    initScanView();
  },
};

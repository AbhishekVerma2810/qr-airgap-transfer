import { loadScript, loadStyle } from './src/shared/ui/assets.js';
import { GENERATOR_HTML } from './src/ui/template.js';
import { initGenerateView } from './src/ui/generateView.js';

/** Generator plug-in: file or folder -> QR codes. Needs nothing from other folders. */
export const feature = {
  id: 'generator',
  label: 'Generate QR',
  async mount(container) {
    await Promise.all([
      loadStyle(new URL('./feature.css', import.meta.url)),
      loadScript(new URL('./lib/qrcode.js', import.meta.url)),
    ]);
    container.innerHTML = GENERATOR_HTML;
    initGenerateView();
  },
};

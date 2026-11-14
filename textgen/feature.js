import { loadScript, loadStyle } from './src/shared/ui/assets.js';
import { TEXTGEN_HTML } from './src/ui/template.js';
import { initGenerateView } from './src/ui/generateView.js';

/** Text-to-QR plug-in. Needs nothing from other folders. */
export const feature = {
  id: 'textgen',
  label: 'Text to QR',
  async mount(container) {
    await Promise.all([
      loadStyle(new URL('./feature.css', import.meta.url)),
      loadScript(new URL('./lib/qrcode.js', import.meta.url)),
    ]);
    container.innerHTML = TEXTGEN_HTML;
    initGenerateView();
  },
};

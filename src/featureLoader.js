/** Folder names the shell tries to plug in. Add a name here to support a new feature. */
export const FEATURE_NAMES = ['generator', 'reader'];

/**
 * @typedef {object} Feature
 * @property {string} id
 * @property {string} label
 * @property {(container: HTMLElement) => Promise<void>} mount
 */

function noteMissing(name, error) {
  console.info(`Feature "${name}" not available: ${error.message}`);
}

/**
 * Load every feature whose folder exists. Missing folders are skipped quietly.
 * @param {string[]} names
 * @param {(name: string) => Promise<{feature: Feature}>} importer
 * @returns {Promise<Feature[]>}
 */
export async function loadFeatures(names, importer) {
  const attempts = names.map((name) =>
    importer(name).then(
      (module) => module.feature,
      (error) => noteMissing(name, error),
    ),
  );
  return (await Promise.all(attempts)).filter(Boolean);
}

function addOnce(tag, attributes) {
  return new Promise((resolve, reject) => {
    const element = Object.assign(document.createElement(tag), attributes);
    element.onload = resolve;
    element.onerror = () =>
      reject(new Error(`Could not load ${attributes.src ?? attributes.href}`));
    document.head.append(element);
  });
}

/**
 * Load a classic <script> (used for the vendored QR libraries).
 * @param {URL|string} url
 * @returns {Promise<void>}
 */
export function loadScript(url) {
  return addOnce('script', { src: String(url) });
}

/**
 * Load a stylesheet.
 * @param {URL|string} url
 * @returns {Promise<void>}
 */
export function loadStyle(url) {
  return addOnce('link', { rel: 'stylesheet', href: String(url) });
}

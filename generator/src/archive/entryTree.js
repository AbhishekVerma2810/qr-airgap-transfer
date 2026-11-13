/**
 * @typedef {object} TreeNode
 * @property {string} name   last path segment
 * @property {string} path   full path inside the folder
 * @property {boolean} isDir
 * @property {number} size   bytes (for folders: everything inside)
 * @property {TreeNode[]} children
 */

function makeNode(name, path, isDir) {
  return { name, path, isDir, size: 0, children: [], lookup: new Map() };
}

function childFor(parent, name, isDir) {
  const known = parent.lookup.get(name);
  if (known) return known;
  const path = parent.path ? `${parent.path}/${name}` : name;
  const node = makeNode(name, path, isDir);
  parent.lookup.set(name, node);
  parent.children.push(node);
  return node;
}

function insert(root, entry) {
  const size = entry.isDir ? 0 : entry.bytes.length;
  const segments = entry.path.split('/');
  let node = root;
  root.size += size;
  segments.forEach((name, i) => {
    node = childFor(node, name, i < segments.length - 1 || entry.isDir);
    node.size += size;
  });
}

/**
 * Arrange flat folder entries into a tree (DOM-free, so it is easy to test).
 * @param {import('./zipWriter.js').ArchiveEntry[]} entries
 * @returns {TreeNode} a root node with an empty name
 */
export function buildTree(entries) {
  const root = makeNode('', '', true);
  entries.forEach((entry) => insert(root, entry));
  return root;
}

function addWithAncestors(path, keep) {
  const parts = path.split('/');
  parts.forEach((_, i) => keep.add(parts.slice(0, i + 1).join('/')));
}

/**
 * Keep the entries for the chosen leaves (files and empty folders) plus the
 * folders that contain them. Anything not chosen is left out.
 * @param {import('./zipWriter.js').ArchiveEntry[]} entries
 * @param {Iterable<string>} selectedLeaves paths of the chosen files/empty folders
 * @returns {import('./zipWriter.js').ArchiveEntry[]}
 */
export function pickEntries(entries, selectedLeaves) {
  const keep = new Set();
  for (const path of selectedLeaves) addWithAncestors(path, keep);
  return entries.filter((entry) => keep.has(entry.path));
}

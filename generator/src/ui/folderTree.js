import { buildTree, pickEntries } from '../archive/entryTree.js';
import { packFolder } from '../archive/packFolder.js';
import { byId } from '../shared/ui/dom.js';
import { formatSize } from './format.js';

function element(tag, props = {}) {
  return Object.assign(document.createElement(tag), props);
}

function nodeLabel(node) {
  const box = element('input', { type: 'checkbox', checked: true });
  box.dataset.path = node.path;
  if (!node.children.length) box.dataset.leaf = '1';
  const suffix = node.isDir ? '/' : '';
  const text = element('span', {
    textContent: ` ${node.name}${suffix} (${formatSize(node.size)})`,
  });
  const label = element('label');
  label.append(box, text);
  return label;
}

function nodeItem(node) {
  const item = element('li');
  if (!node.children.length) {
    item.append(nodeLabel(node));
    return item;
  }
  const summary = element('summary');
  summary.append(nodeLabel(node));
  const list = element('ul');
  list.append(...node.children.map(nodeItem));
  const details = element('details');
  details.append(summary, list);
  item.append(details);
  return item;
}

/** The checkbox that belongs to this list item itself (it comes first inside the item). */
function ownBox(item) {
  return item.querySelector('input');
}

function updateParentBox(item) {
  const boxes = [...item.querySelectorAll(':scope > details > ul > li')].map(ownBox);
  const checked = boxes.filter((box) => box.checked).length;
  const own = ownBox(item);
  own.checked = checked === boxes.length;
  own.indeterminate = boxes.some((box) => box.indeterminate) || (checked > 0 && !own.checked);
}

function refreshAncestors(item) {
  for (let up = item.parentElement.closest('li'); up; up = up.parentElement.closest('li')) {
    updateParentBox(up);
  }
}

function setBranch(item, checked) {
  item.querySelectorAll('input').forEach((box) => {
    box.checked = checked;
    box.indeterminate = false;
  });
}

function selectedLeafPaths(container) {
  const boxes = container.querySelectorAll('input[data-leaf]:checked');
  return [...boxes].map((box) => box.dataset.path);
}

function describeSelection(name, entries, leaves) {
  const chosen = pickEntries(entries, leaves);
  const files = chosen.filter((entry) => !entry.isDir);
  const size = files.reduce((sum, entry) => sum + entry.bytes.length, 0);
  const total = entries.filter((entry) => !entry.isDir).length;
  return {
    label: name,
    size,
    fileCount: files.length,
    load: async () => packFolder(name, chosen),
    summary: `Folder "${name}": ${files.length} of ${total} file(s) selected, ${formatSize(size)}.`,
  };
}

function setEverything(checked) {
  byId('folder-tree')
    .querySelectorAll('input')
    .forEach((box) => {
      box.checked = checked;
      box.indeterminate = false;
    });
}

/**
 * Show the folder as a tree of checkboxes. Every change reports the new selection.
 * @param {{name: string, entries: import('../archive/zipWriter.js').ArchiveEntry[]}} folder
 * @param {(selection: object) => void} onChange gets `{label,size,fileCount,load,summary}`
 */
export function showFolderTree({ name, entries }, onChange) {
  const container = byId('folder-tree');
  const report = () => onChange(describeSelection(name, entries, selectedLeafPaths(container)));
  const root = element('ul');
  root.append(...buildTree(entries).children.map(nodeItem));
  container.replaceChildren(root);
  container.onchange = (event) => {
    const item = event.target.closest('li');
    setBranch(item, event.target.checked);
    refreshAncestors(item);
    report();
  };
  byId('tree-all').onclick = () => (setEverything(true), report());
  byId('tree-none').onclick = () => (setEverything(false), report());
  byId('folder-tree-box').hidden = false;
  report();
}

/** Hide the tree (used when a single file is chosen instead). */
export function hideFolderTree() {
  byId('folder-tree-box').hidden = true;
  byId('folder-tree').replaceChildren();
}

import { FEATURE_NAMES, loadFeatures } from './featureLoader.js';

const byId = (id) => document.getElementById(id);

function addTab(feature) {
  const button = document.createElement('button');
  button.textContent = feature.label;
  button.dataset.feature = feature.id;
  button.setAttribute('role', 'tab');
  byId('tabs').append(button);
  const section = document.createElement('section');
  section.id = `tab-${feature.id}`;
  byId('app').append(section);
  return section;
}

function showTab(id) {
  for (const section of byId('app').children) section.hidden = section.id !== `tab-${id}`;
  for (const button of byId('tabs').children) {
    const active = button.dataset.feature === id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  }
}

function onTabClick(event) {
  if (event.target.dataset.feature) showTab(event.target.dataset.feature);
}

async function start() {
  const features = await loadFeatures(FEATURE_NAMES, (name) => import(`../${name}/feature.js`));
  byId('empty-message').hidden = features.length > 0;
  await Promise.all(features.map((feature) => feature.mount(addTab(feature))));
  byId('tabs').addEventListener('click', onTabClick);
  if (features.length) showTab(features[0].id);
}

start();

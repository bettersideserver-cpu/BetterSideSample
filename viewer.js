(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const status = byId('status');
  const povSlider = byId('pov-slider');
  const povValue = byId('pov-value');
  const controls = [...document.querySelectorAll('.tools button'), byId('pov-slider')];
  const entries = (Array.isArray(window.PANORAMAS) ? window.PANORAMAS : [])
    .filter(item => item && typeof item.src === 'string' && item.src.trim());
  const number = value => String(value).padStart(2, '0');
  let viewer;
  let rotating = false;
  let active = 0;
  function message(text) { status.textContent = text; status.hidden = false; }
  function enable(enabled) { controls.forEach(button => { button.disabled = !enabled; }); }
  enable(false);
  byId('image-count').textContent = `${entries.length} panorama${entries.length === 1 ? '' : 's'}`;
  if (!entries.length) { message('No panoramas yet. Add images to the images folder and update panoramas.js.'); return; }
  if (!window.pannellum) { message('The panorama viewer could not load. Check that the vendor folder was uploaded, then refresh.'); return; }
  const scenes = {};
  const buttons = entries.map((entry, index) => {
    const title = entry.title || entry.src.split('/').pop().replace(/\.[^.]+$/, '');
    scenes[String(index)] = { type: 'equirectangular', panorama: entry.src.split('/').map(encodeURIComponent).join('/') };
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'scene';
    button.setAttribute('aria-label', `Panorama ${index + 1}: ${title}`);
    const badge = document.createElement('span'); badge.className = 'scene-number'; badge.textContent = number(index + 1);
    const label = document.createElement('span'); label.className = 'scene-label'; label.textContent = title;
    button.append(badge, label);
    button.addEventListener('click', () => {
      if (active === index && viewer.isLoaded()) return;
      rotating = false; byId('rotate').setAttribute('aria-pressed', 'false');
      viewer.stopAutoRotate(); enable(false); message('Loading panorama…');
      viewer.loadScene(String(index));
    });
    byId('scene-list').append(button);
    return { button, title };
  });
  function select(index) {
    active = index;
    buttons.forEach(({ button }, i) => button.setAttribute('aria-current', String(i === index)));
    byId('scene-name').textContent = buttons[index].title;
    byId('position').textContent = `${number(index + 1)} / ${number(entries.length)}`;
    buttons[index].button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  select(0);
  try {
    viewer = pannellum.viewer('panorama', {
      default: { firstScene: '0', autoLoad: true, showControls: false, hfov: 110, minHfov: 40, maxHfov: 160, mouseZoom: false, touchZoom: false, sceneFadeDuration: 250 }, scenes
    });
    viewer.on('scenechange', id => select(Number(id)));
    viewer.on('load', () => { status.hidden = true; enable(true); syncPov(viewer.getHfov()); });
    viewer.on('zoomchange', hfov => syncPov(hfov));
    viewer.on('error', () => { enable(false); message('Unable to display this panorama. Check the image path and use a 360° equirectangular image, or choose another image below.'); });
  } catch (error) { message('This browser could not start the 360° viewer. Try a browser with WebGL enabled.'); return; }
  function syncPov(hfov) {
    const value = Math.round(hfov);
    povSlider.value = String(value);
    povValue.value = `${value}°`;
    povValue.textContent = `${value}°`;
  }
  povSlider.addEventListener('input', () => {
    const hfov = Number(povSlider.value);
    povValue.value = `${hfov}°`;
    povValue.textContent = `${hfov}°`;
    viewer.setHfov(hfov, false);
  });
  const povControl = document.querySelector('.pov-control');
  function togglePov() {
    povControl.hidden = !povControl.hidden;
    if (povControl.hidden) viewer.setHfov(110, false);
    syncPov(viewer.getHfov());
  }
  // Discreet shortcut: no visible toggle is added to the visitor's controls.
  document.addEventListener('keydown', event => {
    if (event.repeat || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.code === 'KeyF') {
      event.preventDefault();
      togglePov();
    }
  });
  let badgeTaps = 0;
  let lastBadgeTap = 0;
  document.querySelector('.heading .badge').addEventListener('click', () => {
    const now = Date.now();
    badgeTaps = now - lastBadgeTap < 600 ? badgeTaps + 1 : 1;
    lastBadgeTap = now;
    if (badgeTaps === 3) { badgeTaps = 0; togglePov(); }
  });
  // Arrow keys on the slider should not also pan the scene.
  povSlider.addEventListener('keydown', event => {
    if (event.shiftKey && event.code === 'KeyF' && !event.repeat) {
      event.preventDefault();
      togglePov();
      byId('panorama').focus();
    }
    event.stopPropagation();
  });
  povSlider.addEventListener('keyup', event => event.stopPropagation());
  byId('zoom-in').addEventListener('click', () => viewer.setHfov(viewer.getHfov() - 10));
  byId('zoom-out').addEventListener('click', () => viewer.setHfov(viewer.getHfov() + 10));
  byId('rotate').addEventListener('click', () => {
    rotating = !rotating;
    if (rotating) viewer.startAutoRotate(-2); else viewer.stopAutoRotate();
    byId('rotate').setAttribute('aria-pressed', String(rotating));
  });
  const fullscreen = byId('fullscreen');
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await byId('app').requestFullscreen();
    } catch (error) { fullscreen.hidden = true; }
  });
  new ResizeObserver(() => viewer.resize()).observe(byId('panorama'));
})();

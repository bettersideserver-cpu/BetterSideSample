(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const status = byId('status');
  const controls = [...document.querySelectorAll('.tools button')];
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
      default: { firstScene: '0', autoLoad: true, showControls: false, hfov: 100, minHfov: 40, maxHfov: 120, sceneFadeDuration: 250 }, scenes
    });
    viewer.on('scenechange', id => select(Number(id)));
    viewer.on('load', () => { status.hidden = true; enable(true); });
    viewer.on('error', () => { enable(false); message('Unable to display this panorama. Check the image path and use a 360° equirectangular image, or choose another image below.'); });
  } catch (error) { message('This browser could not start the 360° viewer. Try a browser with WebGL enabled.'); return; }
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

// The portfolio remains readable when scripting is disabled.
const inspect = document.querySelector('#inspect');
const specimen = document.querySelector('#specimen');
const caption = document.querySelector('#specimen-caption');
inspect.hidden = false;

inspect.addEventListener('click', () => {
  const enlarged = specimen.classList.toggle('zoomed');
  inspect.setAttribute('aria-pressed', String(enlarged));
  inspect.querySelector('.inspect-label').textContent = enlarged ? 'Whole specimen' : 'Wing detail';
  caption.textContent = enlarged ? 'Wing venation · enlarged illustration' : 'Dragonfly · illustrative plate';
});

const windows = [...document.querySelectorAll('.work-window')];
const tray = document.querySelector('#tray');
const compact = matchMedia('(max-width:760px)');
const order = [];
const launchers = new Map();
let playback = 0;
const panel = name => document.getElementById('panel-' + name);
const nameOf = win => win.id.slice(6);
function front() {
  return [...order].reverse().find(win => win.dataset.state === 'open');
}
function renderWindows() {
  const top = front();
  const active = windows.some(win => win.dataset.state !== 'closed');
  document.body.classList.toggle('windows-open', active);
  for (const win of windows) {
    win.hidden = win.dataset.state !== 'open' || (compact.matches && win !== top);
    win.classList.toggle('on-top', win === top);
    win.style.zIndex = String(30 + order.indexOf(win));
    const button = tray.querySelector('[data-open="' + nameOf(win) + '"]');
    button.dataset.active = String(win === top);
    button.dataset.paused = String(win.dataset.state === 'minimized');
    button.setAttribute('aria-expanded', String(!win.hidden));
  }
  for (const node of document.querySelectorAll('header,footer,main > section,.skip')) node.inert = compact.matches && Boolean(top);
  if (panel('lab').hidden) stopStroke();
}
function raise(win) {
  const oldIndex = order.indexOf(win);
  if (oldIndex >= 0) order.splice(oldIndex, 1);
  order.push(win);
  renderWindows();
}
function constrain(win, x, y) {
  if (compact.matches || win.classList.contains('expanded')) return;
  const rect = win.getBoundingClientRect();
  win.style.setProperty('--wx', Math.min(Math.max(x, 4), Math.max(4, innerWidth - rect.width - 4)) + 'px');
  win.style.setProperty('--wy', Math.min(Math.max(y, 4), Math.max(4, innerHeight - rect.height - 70)) + 'px');
}
function openWindow(name, trigger) {
  const win = panel(name);
  const fresh = win.dataset.state === 'closed';
  if (fresh) launchers.set(name, trigger);
  win.dataset.state = 'open';
  raise(win);
  if (fresh) {
    const layers = windows.filter(other => other !== win && !other.hidden).length;
    const x = layers % 2 ? innerWidth - win.offsetWidth - 35 : innerWidth * .075;
    constrain(win, x, 32 + (layers % 4) * 33);
  }
  win.classList.add('revealed');
  win.focus({preventScroll:true});
  const preset = trigger?.dataset.mode || trigger?.dataset.preset;
  if (name === 'log' && (trigger?.dataset.entry || trigger?.closest('.desk-links'))) {
    document.querySelector('#project-search').value = trigger.dataset.entry || '';
    selectGroup('[data-field]', 'field', 'All');
    filterLog();
    const selected = win.querySelector('.record:not([hidden])');
    if (selected && trigger.dataset.entry) selected.open = true;
  }
  if (name === 'lab' && preset) setExperiment(preset);
  if (name === 'library' && preset) {
    document.querySelector('#paper-search').value = preset;
    selectGroup('[data-type]', 'type', 'all');
    filterLibrary();
  }
}
function hideWindow(win, state) {
  win.dataset.state = state;
  win.classList.remove('revealed');
  if (state === 'closed') win.classList.remove('expanded');
  setMaxLabel(win);
  renderWindows();
  const next = front();
  const prior = launchers.get(nameOf(win));
  const fallback = tray.querySelector('[data-open="' + nameOf(win) + '"]');
  (next || (prior?.getClientRects().length ? prior : fallback)).focus({preventScroll:true});
}
function setMaxLabel(win) {
  const max = win.classList.contains('expanded');
  const button = win.querySelector('[data-win="max"]');
  const title = (max ? 'Restore' : 'Maximize') + ' ' + win.querySelector('.window-bar strong').textContent;
  button.setAttribute('aria-pressed', String(max));
  button.setAttribute('aria-label', title);
  button.title = title;
}
function maximize(win) {
  if (compact.matches) return;
  win.classList.toggle('expanded');
  setMaxLabel(win);
  if (!win.classList.contains('expanded')) {
    const rect = win.getBoundingClientRect();
    constrain(win, rect.x, rect.y);
  }
}
for (const win of windows) {
  const bar = win.querySelector('.window-bar');
  win.addEventListener('focusin', () => { if (front() !== win) raise(win); });
  win.addEventListener('pointerdown', () => { if (front() !== win) raise(win); }, true);
  win.querySelector('[data-win="min"]').addEventListener('click', () => hideWindow(win, 'minimized'));
  win.querySelector('[data-win="close"]').addEventListener('click', () => hideWindow(win, 'closed'));
  win.querySelector('[data-win="max"]').addEventListener('click', () => maximize(win));
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) maximize(win); });
  let drag = null;
  bar.addEventListener('pointerdown', e => {
    if (e.button !== 0 || compact.matches || win.classList.contains('expanded') || e.target.closest('button')) return;
    const rect = win.getBoundingClientRect();
    drag = {x:e.clientX - rect.x, y:e.clientY - rect.y};
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (drag) constrain(win, e.clientX - drag.x, e.clientY - drag.y);
  });
  bar.addEventListener('lostpointercapture', () => { drag = null; });
}
document.querySelectorAll('[data-open]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => openWindow(button.dataset.open, button));
});
tray.hidden = false;
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && front()) hideWindow(front(), 'closed');
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openWindow('log', document.activeElement);
    document.querySelector('#project-search').focus();
  }
});
window.addEventListener('resize', () => {
  renderWindows();
  for (const win of windows.filter(win => !win.hidden)) {
    const rect = win.getBoundingClientRect();
    constrain(win, rect.x, rect.y);
  }
});
function selectGroup(selector, key, value) {
  document.querySelectorAll(selector).forEach(button => button.setAttribute('aria-pressed', String(button.dataset[key] === value)));
}
function wireGroup(key, update) {
  const selector = '[data-' + key + ']';
  for (const button of document.querySelectorAll(selector)) {
    button.addEventListener('click', () => {
      const value = button.dataset[key];
      selectGroup(selector, key, value);
      update(value);
    });
  }
}
wireGroup('model', model => {
  for (const figure of document.querySelectorAll('[data-plane]')) figure.hidden = model !== 'both' && figure.dataset.plane !== model;
});
wireGroup('angle', angle => {
  for (const img of document.querySelectorAll('[data-angle-image]')) img.hidden = img.dataset.angleImage !== angle;
});

// A schematic sweep about the wing root, with identical geometry in both directions.
const canvas = document.querySelector('#stroke-canvas');
const ctx = canvas.getContext('2d');
const phase = document.querySelector('#phase');
function traceWing(a, opacity, veins) {
  ctx.save();
  ctx.translate(360, 250);
  ctx.rotate(a);
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-27,-49,-31,-142,-5,-208);
  ctx.bezierCurveTo(11,-232,49,-157,39,-105);
  ctx.bezierCurveTo(33,-72,17,-22,0,0);
  ctx.fillStyle = veins ? '#405f64' : '#213e44';
  ctx.fill();
  ctx.strokeStyle = veins ? '#f0b47d' : '#7fafa8';
  ctx.lineWidth = veins ? 2 : 1;
  ctx.stroke();
  if (veins) {
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-6,-126,-5,-206);
    for (let i=1;i<8;i++) {
      const y=-i*23;
      ctx.moveTo(-4,y); ctx.lineTo(Math.sin(i/8*Math.PI)*31+4,y-23);
      ctx.moveTo(-4,y); ctx.lineTo(-Math.sin(i/8*Math.PI)*18-3,y-15);
    }
    ctx.lineWidth=1; ctx.stroke();
  }
  ctx.restore();
}
function drawStroke() {
  const percent = Number(phase.value);
  const stage = percent === 0 || percent === 100 ? 'First reversal' : percent === 50 ? 'Second reversal' : percent < 50 ? 'Outward sweep' : 'Return sweep';
  document.querySelector('#phase-out').value = percent + '% · ' + stage;
  phase.setAttribute('aria-valuetext', percent + ' percent, ' + stage);
  if (!ctx) return;
  ctx.fillStyle='#10282e'; ctx.fillRect(0,0,720,310);
  ctx.strokeStyle='#244249'; ctx.lineWidth=1; ctx.beginPath();
  for(let x=0;x<720;x+=30){ctx.moveTo(x,0);ctx.lineTo(x,310);}
  for(let y=0;y<310;y+=30){ctx.moveTo(0,y);ctx.lineTo(720,y);}
  ctx.stroke();
  for (const angle of [-1,-.66,-.33,0,.33,.66,1]) traceWing(angle,.58,false);
  traceWing(-Math.cos(percent*Math.PI/50),1,true);
  ctx.fillStyle='#f4c497'; ctx.beginPath(); ctx.arc(360,250,5,0,Math.PI*2); ctx.fill();
  ctx.font='17px monospace'; ctx.textAlign='center'; ctx.fillText('Wing root',360,285);
}
phase.addEventListener('input', () => { stopStroke(); drawStroke(); });
const play = document.querySelector('#play');
function stopStroke() {
  cancelAnimationFrame(playback);
  playback = 0;
  play.textContent = 'Play stroke';
  play.setAttribute('aria-pressed','false');
}
play.addEventListener('click', () => {
  if (playback) { stopStroke(); return; }
  play.textContent='Pause stroke';
  play.setAttribute('aria-pressed','true');
  const start=performance.now()-Number(phase.value)*40;
  function tick(time) {
    phase.value=String(Math.round(((time-start)%4000)/40));
    drawStroke();
    playback=requestAnimationFrame(tick);
  }
  playback=requestAnimationFrame(tick);
});
function setExperiment(name) {
  selectGroup('[data-lab]', 'lab', name);
  for (const node of document.querySelectorAll('[data-experiment]')) node.hidden = node.dataset.experiment !== name;
  if (name !== 'wing') stopStroke();
  else drawStroke();
}
wireGroup('lab', setExperiment);
drawStroke();
document.addEventListener('visibilitychange', () => { if (document.hidden) stopStroke(); });
const offset = document.querySelector('#offset');
offset.setAttribute('aria-valuetext','Centre');
offset.addEventListener('input', () => {
  const step = Number(offset.value);
  const label = ['Low','Below centre','Centre','Above centre','High'][step+2];
  document.querySelector('#source-disc').style.setProperty('--dy',(-step*1.4)+'rem');
  document.querySelector('#heat-out').value=label;
  offset.setAttribute('aria-valuetext',label);
  document.querySelector('.apparatus').setAttribute('aria-label','Heated cylinder inside a tilted square enclosure. Position: '+label);
});

const shelf = document.querySelector('#shelf');
for (const record of document.querySelectorAll('.paper-list li')) {
  const item = document.createElement('li');
  item.dataset.kind = record.querySelector('.kind').textContent.includes('Conference') ? 'conference' : 'journal';
  const title = record.querySelector('h3 a').cloneNode(true);
  const author = document.createElement('small');
  author.textContent = record.querySelector('p').textContent;
  const citation = document.createElement('small');
  citation.textContent = record.querySelector('.year').textContent + ' · ' + record.querySelector('p:last-child').textContent;
  item.append(title,author,citation);
  shelf.append(item);
}
function filterRecords(input, selector, tagKey, selected, allToken, output, singular, plural) {
  const terms = input.value.toLowerCase().trim().split(/\s+/);
  let count=0;
  for (const item of document.querySelectorAll(selector)) {
    const validType = selected === allToken || item.dataset[tagKey] === selected;
    const text = item.textContent.toLowerCase();
    item.hidden = !validType || !terms.every(term => text.includes(term));
    if (!item.hidden) count++;
  }
  output.textContent = count ? count+' '+(count===1?singular:plural) : 'No matches. Try another search or filter.';
}
function filterLibrary() {
  filterRecords(document.querySelector('#paper-search'),'#shelf li','kind',document.querySelector('[data-type][aria-pressed="true"]').dataset.type,'all',document.querySelector('#paper-total'),'paper','papers');
}
function filterLog() {
  filterRecords(document.querySelector('#project-search'),'.record','discipline',document.querySelector('[data-field][aria-pressed="true"]').dataset.field,'All',document.querySelector('#project-total'),'entry','entries');
}
wireGroup('type', filterLibrary);
wireGroup('field', filterLog);
document.querySelector('#paper-search').addEventListener('input',filterLibrary);
document.querySelector('#project-search').addEventListener('input',filterLog);
filterLog();
filterLibrary();

// The first sheet is readable even without JavaScript.
document.querySelector('.notebook-tabs').hidden = false;
wireGroup('pick', name => {
  for (const sheet of document.querySelectorAll('[data-sheet]')) {
    sheet.hidden = sheet.dataset.sheet !== name;
  }
});

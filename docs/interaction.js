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
  if (name === 'log' && (trigger?.dataset.entry || trigger?.closest('.flight-intro'))) {
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

// Project a tapered wing and illustrative flow traces onto a small 2D canvas.
function mountFlowIllustration() {
  const field = document.querySelector('#wind-field');
  const drawing = field.getContext('2d');
  if (!drawing) return;
  const stage = field.parentElement;
  const slider = document.querySelector('#wing-pitch');
  const output = document.querySelector('#pitch-output');
  const toggle = document.querySelector('#wind-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const radians = Math.PI / 180;
  let moving = !reduced.matches;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let clock = 0;
  let yaw = -0.5, desiredYaw = yaw;
  let pitch = Number(slider.value), desiredPitch = pitch;
  let width = 1, height = 1;

  function surface(s, u, side) {
    const chord = .73 - .31 * s;
    const thickness = .85 * (.2969*Math.sqrt(u) - .126*u - .3516*u*u + .2843*u**3 - .1036*u**4);
    return [(u-.48)*chord + .19*(s-.5), (s-.5)*1.03, chord*(.028*Math.sin(Math.PI*u) + side*thickness) + .07*s];
  }
  const ribs = Array.from({length:27}, (_, i) => {
    const s = i / 26;
    const top = Array.from({length:41}, (_, j) => surface(s,j/40,1));
    const bottom = Array.from({length:41}, (_, j) => surface(s,1-j/40,-1));
    return [...top,...bottom];
  });
  const spars = [0,.025,.08,.16,.26,.39,.54,.70,.85,1].map(u =>
    Array.from({length:27}, (_, i) => surface(i/26,u,1))
  );

  function render() {
    drawing.clearRect(0,0,width,height);
    const scale=Math.min(width*.73,height*1.27);
    const cy=Math.cos(yaw), sy=Math.sin(yaw);
    const cp=Math.cos(pitch*radians), sp=Math.sin(pitch*radians);
    function project(point) {
      const [x,s,z]=point;
      const along=x*cp+z*sp, up=z*cp-x*sp;
      return [width*.49+(along*cy-s*sy)*scale, height*.51-((along*sy+s*cy)*.51+up*.86)*scale];
    }
    function path(points) {
      drawing.beginPath();
      points.forEach(([x,y],index) => index ? drawing.lineTo(x,y) : drawing.moveTo(x,y));
    }
    // The traces indicate flow direction. Their curvature is artistic, not CFD output.
    for (let lane=0;lane<19;lane++) {
      const row=(lane+.5)/19;
      function trace(t) {
        const spread=row-.5;
        const lift=Math.exp(-((t-.51)**2)/.051)*(.028+.075*Math.exp(-spread*spread/.10));
        const bend=(spread<0?-1:1)*lift + (pitch/18)*.048*Math.sin(Math.PI*t);
        return [t*width, (row*.89+.055+bend+.02*Math.sin(t*6+row*3))*height];
      }
      const points=Array.from({length:65},(_,j)=>trace(j/64));
      path(points); drawing.strokeStyle='rgba(101,177,173,.22)'; drawing.lineWidth=.85; drawing.stroke();
      for (let i=0;i<2;i++) {
        const t=(clock*.085 + lane*.137+i*.5)%1;
        const [x,y]=trace(t); const [tx,ty]=trace(Math.max(0,t-.023));
        drawing.beginPath(); drawing.moveTo(tx,ty); drawing.lineTo(x,y);
        drawing.strokeStyle='rgba(153,226,213,.8)'; drawing.lineWidth=1.35; drawing.stroke();
      }
    }
    // Fill each spanwise strip in depth order so the front edge masks the far surface.
    for(let i=ribs.length-1;i>=0;i--) {
      const rib=ribs[i].map(project);
      if(i>0){
        const near=ribs[i-1].slice(0,41).map(project);
        path([...rib.slice(0,41),...near.reverse()]);
        drawing.closePath(); drawing.fillStyle='rgba(25,64,69,.94)'; drawing.fill();
      }
      path(rib); drawing.closePath();
      if(i===0){ drawing.fillStyle='#18383f'; drawing.fill(); }
      drawing.lineWidth=i===0||i===26?2:1;
      drawing.strokeStyle=i===0||i===26?'#f5ba83':'rgba(225,183,139,.73)'; drawing.stroke();
    }
    spars.forEach((line,i)=>{
      path(line.map(project)); drawing.lineWidth=i===0||i===spars.length-1?1.8:.8;
      drawing.strokeStyle=i===0||i===spars.length-1?'#f8c694':'rgba(174,218,203,.66)';drawing.stroke();
    });
  }

  function schedule() {
    if (!frame && visible && !document.hidden) frame=requestAnimationFrame(animate);
  }
  function animate(now) {
    frame=0;
    const delta=lastTime ? Math.min((now-lastTime)/1000,.06) : 1/60;
    lastTime=now;
    const blend=reduced.matches?1:1-Math.exp(-14*delta);
    yaw+=(desiredYaw-yaw)*blend; pitch+=(desiredPitch-pitch)*blend;
    if(moving) clock+=delta;
    render();
    if(moving || Math.abs(yaw-desiredYaw)>.0005 || Math.abs(pitch-desiredPitch)>.015) schedule();
  }
  function resize() {
    const bounds=stage.getBoundingClientRect();
    width=Math.max(1,bounds.width); height=Math.max(1,bounds.height);
    const ratio=Math.min(devicePixelRatio||1,2);
    field.width=Math.round(width*ratio); field.height=Math.round(height*ratio);
    drawing.setTransform(ratio,0,0,ratio,0,0);
    render();
  }
  function changePitch(value) {
    desiredPitch=Math.round(value);
    slider.value=String(desiredPitch);
    output.value=desiredPitch+'°';
    slider.setAttribute('aria-valuetext',desiredPitch+' degrees');
    schedule();
  }
  function steer(event) {
    if (event.pointerType==='touch' && event.type==='pointermove' && !event.buttons) return;
    if (reduced.matches && event.type==='pointermove' && !event.buttons) return;
    const rect=stage.getBoundingClientRect();
    const bound=value=>Math.min(1,Math.max(0,value));
    desiredYaw=-.5+(bound((event.clientX-rect.left)/rect.width)-.5)*1.04;
    changePitch((.5-bound((event.clientY-rect.top)/rect.height))*36);
  }
  function syncToggle() { toggle.textContent=moving?'Pause flow':'Play flow'; }
  slider.addEventListener('input',()=>changePitch(Number(slider.value)));
  // Moving on the introduction or on the model steers the same illustration.
  const cover=field.closest('.flight-cover');
  cover.addEventListener('pointermove',event=>{
    if (event.target.closest('input,button,a,figcaption,.pitch-control')) return;
    if (event.pointerType==='touch' && !stage.contains(event.target)) return;
    steer(event);
  });
  stage.addEventListener('pointerdown',steer);
  toggle.addEventListener('click',()=>{moving=!moving;syncToggle();lastTime=0;schedule();});
  reduced.addEventListener('change',()=>{moving=!reduced.matches;syncToggle();schedule();});
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)schedule();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){lastTime=0;schedule();}else{cancelAnimationFrame(frame);frame=0;} }).observe(stage);
  field.hidden=false;
  document.querySelector('#wing-fallback').hidden=true;
  document.querySelector('.pitch-control').hidden=false;
  toggle.hidden=false;
  new ResizeObserver(resize).observe(stage);
  resize();syncToggle();schedule();
}
mountFlowIllustration();

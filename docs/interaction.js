let playback = 0;
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


const paperSearch = document.querySelector('#paper-search');
paperSearch.parentElement.hidden = false;
const papers = [...document.querySelectorAll('.paper-list li')];
paperSearch.addEventListener('input', () => {
  const terms = paperSearch.value.trim().toLowerCase().split(/\s+/);
  const matches = papers.filter(paper => {
    const body = paper.textContent.toLowerCase();
    paper.hidden = !terms.every(term => body.includes(term));
    return !paper.hidden;
  });
  document.querySelector('#paper-total').textContent = matches.length === 1 ? '1 publication' : matches.length + ' publications';
});
document.querySelector('#phase').closest('details').addEventListener('toggle',event=>{
  if (!event.currentTarget.open) stopStroke();
});

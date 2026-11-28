// Upper-surface taps from Schmitt & Charpin, AGARD AR-138, case 2308.
// Each pair gives chordwise position x/c and pressure coefficient at one span station.
// NASA Glenn ONERA M6 archive and TMBWG case_2308.dat. Values rounded for display.
(() => {
  const stations = [.20, .44, .65, .80, .90, .95, .99];
  const measured = [
    [[0.0003,0.801],[0.0022,0.444],[0.0087,-0.168],[0.0204,-0.707],[0.0352,-1.069],[0.0604,-0.629],[0.0996,-0.465],[0.1504,-0.442],[0.2004,-0.455],[0.2504,-0.459],[0.3005,-0.462],[0.3505,-0.48],[0.4005,-0.505],[0.4503,-0.547],[0.5004,-0.576],[0.5503,-0.58],[0.6003,-0.398],[0.6503,-0.307],[0.7103,-0.238],[0.7803,-0.16],[0.8502,-0.058],[0.9203,0.059],[0.9852,0.176]],
    [[0.0003,0.781],[0.0011,0.388],[0.0079,-0.256],[0.0191,-0.842],[0.034,-1.127],[0.0591,-1.092],[0.0991,-0.889],[0.1493,-0.488],[0.1991,-0.538],[0.2508,-0.561],[0.2993,-0.559],[0.3493,-0.58],[0.3993,-0.614],[0.449,-0.647],[0.4993,-0.701],[0.5493,-0.374],[0.5993,-0.263],[0.6492,-0.213],[0.709,-0.151],[0.7791,-0.081],[0.849,0.01],[0.9193,0.109],[0.9839,0.211]],
    [[0.0004,0.752],[0.0022,0.325],[0.0091,-0.324],[0.0204,-0.918],[0.0351,-1.181],[0.0602,-1.14],[0.1003,-1.032],[0.1503,-0.941],[0.2003,-0.544],[0.2502,-0.594],[0.3001,-0.632],[0.3502,-0.664],[0.4004,-0.692],[0.4501,-0.725],[0.5002,-0.301],[0.5504,-0.236],[0.6007,-0.205],[0.6503,-0.164],[0.7103,-0.121],[0.7801,-0.052],[0.85,0.032],[0.9201,0.123],[0.9861,0.227]],
    [[0.0021,0.304],[0.0089,-0.324],[0.0201,-0.976],[0.0353,-1.206],[0.0601,-1.161],[0.1002,-1.058],[0.1502,-0.996],[0.2002,-0.954],[0.2502,-0.618],[0.3002,-0.628],[0.3502,-0.677],[0.3998,-0.303],[0.4501,-0.245],[0.5002,-0.244],[0.5503,-0.222],[0.6002,-0.181],[0.6502,-0.139],[0.7098,-0.097],[0.7801,-0.031],[0.8501,0.043],[0.9201,0.132],[0.985,0.225]],
    [[0.0006,0.726],[0.0018,-0.182],[0.0063,-0.181],[0.0123,-0.576],[0.0201,-0.985],[0.0299,-1.187],[0.0497,-1.194],[0.0745,-1.14],[0.0999,-1.093],[0.1399,-1.048],[0.1798,-1.002],[0.22,-0.999],[0.2596,-0.981],[0.2999,-0.341],[0.3398,-0.195],[0.3799,-0.18],[0.4196,-0.208],[0.4597,-0.238],[0.4996,-0.22],[0.5396,-0.2],[0.5796,-0.162],[0.6199,-0.138],[0.6597,-0.107],[0.6997,-0.085],[0.7394,-0.057],[0.7796,-0.021],[0.8194,0.021],[0.8596,0.059],[0.8994,0.099],[0.9473,0.157],[0.9851,0.211]],
    [[0.0007,0.69],[0.0019,0.229],[0.0062,-0.152],[0.0121,-0.598],[0.0198,-0.983],[0.0299,-1.196],[0.0497,-1.227],[0.0749,-1.177],[0.0999,-1.133],[0.1398,-1.127],[0.18,-1.136],[0.2201,-0.559],[0.26,-0.282],[0.2999,-0.159],[0.3401,-0.179],[0.3799,-0.218],[0.4199,-0.238],[0.4598,-0.242],[0.4999,-0.216],[0.5399,-0.197],[0.5799,-0.152],[0.6197,-0.126],[0.6598,-0.104],[0.6998,-0.074],[0.7397,-0.056],[0.7796,-0.027],[0.8196,0.009],[0.8598,0.04],[0.8998,0.072],[0.9486,0.122],[0.9846,0.178]],
    [[0.0005,0.636],[0.0019,0.21],[0.0063,-0.254],[0.0126,-0.651],[0.0201,-1.018],[0.03,-1.244],[0.05,-1.291],[0.0748,-1.275],[0.0999,-1.209],[0.1398,-0.918],[0.1799,-0.785],[0.2199,-0.245],[0.2598,-0.207],[0.2999,-0.219],[0.3398,-0.234],[0.3798,-0.246],[0.4199,-0.272],[0.4597,-0.245],[0.4999,-0.233],[0.5397,-0.213],[0.5798,-0.192],[0.6198,-0.182],[0.6597,-0.176],[0.6998,-0.175],[0.7398,-0.182],[0.7794,-0.195],[0.8198,-0.218],[0.8594,-0.238],[0.8996,-0.256],[0.9496,-0.28],[0.9846,-0.218]]
  ];
  const sectionShape = [[0.0,0.0],[1.65e-05,0.0006914],[6.96e-05,0.0014416],[0.0001675,0.0022554],[0.0003232,0.0031382],[0.0005508,0.0040959],[0.0008657,0.0051343],[0.0012868,0.0062598],[0.0018364,0.0074784],[0.0025441,0.0087958],[0.0034428,0.0102163],[0.0045704,0.0117419],[0.0059751,0.0133708],[0.0077112,0.0150951],[0.0098413,0.0168984],[0.0124479,0.0187537],[0.0156171,0.020622],[0.0194609,0.0224545],[0.0241067,0.0242004],[0.0297008,0.0258245],[0.0364261,0.0273317],[0.0444852,0.0287912],[0.0541248,0.0303278],[0.0656303,0.0320138],[0.0793366,0.0338372],[0.0956354,0.0357742],[0.1149796,0.0377923],[0.1378963,0.0398522],[0.1649976,0.0419089],[0.1919327,0.0436214],[0.2187096,0.0450507],[0.245331,0.0462358],[0.2717978,0.0471987],[0.2981113,0.0479494],[0.3242726,0.0484902],[0.350283,0.0488183],[0.3761446,0.0489296],[0.4018567,0.0488202],[0.4274223,0.0484833],[0.4528441,0.0479351],[0.4781197,0.0471661],[0.5032514,0.0461903],[0.5282426,0.0450209],[0.5530937,0.0436741],[0.5778043,0.0421684],[0.6023757,0.0405241],[0.6268104,0.0387613],[0.6511093,0.036899],[0.6752726,0.0349542],[0.6993027,0.0329402],[0.7231995,0.0308662],[0.7469658,0.0287365],[0.7705998,0.0265505],[0.7941055,0.0243027],[0.8174828,0.0219842],[0.8407324,0.0195838],[0.8638564,0.0170915],[0.8868235,0.0145051],[0.9061905,0.0122389],[0.9225336,0.0102727],[0.9363346,0.0085827],[0.9479946,0.0071423],[0.9578511,0.0059224],[0.966186,0.0048907],[0.9732361,0.004018],[0.979202,0.0032796],[0.9842508,0.0026547],[0.9885252,0.0021257],[0.9921438,0.0016778],[0.995208,0.0012985],[0.997803,0.0009773],[1.0,0.0007052]];
  const canvas = document.getElementById('aero-field');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const figure = canvas.closest('figure');
  const stage = canvas.parentElement;
  const machInput = figure.querySelector('#aero-mach');
  const angleInput = figure.querySelector('#aero-alpha');
  const motion = figure.querySelector('#aero-motion');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wingLayer = document.createElement('canvas');
  const layer = wingLayer.getContext('2d');
  const texture = document.createElement('canvas');
  texture.width = 256;
  texture.height = 96;
  const paint = texture.getContext('2d');
  const clamp = (x, low, high) => Math.max(low, Math.min(x, high));
  const between = (a, b, t) => a + (b - a) * t;
  const palette = [[75,70,157],[55,109,174],[51,172,174],[166,219,197],[236,219,162],[237,152,111]];
  let mach = 0.84, angle = 3, pressureDirty = true, viewDirty = true;
  let yaw = .67, elevation = .83, targetYaw = yaw, targetElevation = elevation;
  let width = 1, height = 1, ratio = 1, scale = 1, centerX = 0, centerY = 0;
  let running = !reducedMotion.matches, onScreen = true, phase = 0, frame = 0, lastTime = 0;

  function sample(curve, position) {
    if (position <= curve[0][0]) return curve[0][1];
    let lo = 0, hi = curve.length - 1;
    if (position >= curve[hi][0]) return curve[hi][1];
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (curve[mid][0] < position) lo = mid;
      else hi = mid;
    }
    return between(curve[lo][1], curve[hi][1], (position-curve[lo][0])/(curve[hi][0]-curve[lo][0]));
  }
  const critical = () => .74 - (angle - 3) * .008;
  function pressure(x, span) {
    let upper = stations.findIndex(value => value >= span);
    if (upper < 0) upper = stations.length-1;
    const lower = Math.max(0, upper-1);
    const factor = upper === lower ? 0 : clamp((span-stations[lower])/(stations[upper]-stations[lower]),0,1);
    // Move the recovery aft as freestream Mach grows. The map is the identity at M=.84.
    const shift = clamp((mach-.84)*2.7, -.24, .44);
    const refX = x / (1 + shift*3*(1-x));
    const reference = between(sample(measured[lower],refX), sample(measured[upper],refX), factor);
    const lowSpeed = .14*x - (.57+.16*span)*(1-x)**.9 - .3*Math.exp(-(((x-.075)/.07)**2))
                   + 1.55*Math.exp(-x/.021);
    const transonic = clamp((mach-critical()) / (.84-critical()),0,1);
    const strength = 1 + Math.max(0,mach-.84)*1.85;
    return between(lowSpeed, reference < 0 ? reference*strength : reference, transonic)
         - .07*(angle-3)*(1-x)*(1-Math.exp(-x/.027));
  }
  function color(cp) {
    const pos = clamp((cp+1.5)*2, 0, 5);
    const idx = Math.min(4, Math.floor(pos));
    const a = palette[idx], b = palette[idx+1];
    return a.map((v,i) => between(v,b[i],pos-idx));
  }
  function updateTexture() {
    const pixels = paint.createImageData(texture.width,texture.height);
    for (let j=0; j<texture.height; j++) {
      let previous = null;
      for (let i=0; i<texture.width; i++) {
        const x=i/(texture.width-1), s=j/(texture.height-1);
        const cp=mach===0 ? null : pressure(x,s);
        const rgb=cp===null ? [88,116,121] : color(cp);
        // Thin isobars at fixed Cp increments give shape to the smooth color field.
        const isobar=previous!==null && Math.floor(cp*5)!==Math.floor(previous*5);
        const shade=(isobar?.82:1)*(.95+.05*Math.sin(Math.PI*x));
        const k=4*(j*texture.width+i);
        for (let c=0;c<3;c++) pixels.data[k+c]=rgb[c]*shade;
        pixels.data[k+3]=255;
        previous=cp;
      }
    }
    paint.putImageData(pixels,0,0);
    pressureDirty=false;
  }
  const thickness = Array.from({length:257}, (_,i) => sample(sectionShape,i/256));
  function wingPoint(x,s,side=1) {
    const chord=1-.438*s;
    const h=thickness[Math.round(x*256)]*chord*side;
    const pitch=angle*Math.PI/180;
    return [(x-.25)*chord*Math.cos(pitch)+h*Math.sin(pitch)+.25*chord+.9*s,
      s*1.55, h*Math.cos(pitch)-(x-.25)*chord*Math.sin(pitch)];
  }
  function camera([x,s,z]) {
    const depth = s*Math.cos(yaw)-x*Math.sin(yaw);
    return [s*Math.sin(yaw)+x*Math.cos(yaw), -depth*Math.sin(elevation)-z*Math.cos(elevation)];
  }
  function screen(point) {
    const [x,y] = camera(point);
    return [centerX+x*scale, centerY+y*scale];
  }
  function placeCamera() {
    const bounds = [0,1].flatMap(s=>[0,.2,.5,1].flatMap(x=>[-1,1].map(side=>camera(wingPoint(x,s,side)))));
    const bx=bounds.map(p=>p[0]), by=bounds.map(p=>p[1]);
    const left=Math.min(...bx), right=Math.max(...bx), top=Math.min(...by), bottom=Math.max(...by);
    scale=Math.min(width*.77/(right-left),height*.7/(bottom-top));
    centerX=width*.49-(left+right)*scale/2;
    centerY=height*.52-(top+bottom)*scale/2;
  }
  function line(ctx,points) {
    ctx.beginPath(); ctx.moveTo(...points[0]);
    for(let i=1;i<points.length;i++) ctx.lineTo(...points[i]);
  }
  // Map a pressure texture onto a tessellated surface. Each triangle starts at its
  // right-angle corner, with edges pointing along chord and span respectively.
  function triangle(a,b,c,u,v,du,dv) {
    const mid=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3];
    const padded=[a,b,c].map(([x,y])=>{
      const d=Math.max(1,Math.hypot(x-mid[0],y-mid[1]));
      return [x+.65*(x-mid[0])/d,y+.65*(y-mid[1])/d];
    });
    layer.save();
    line(layer,padded); layer.closePath(); layer.clip();
    const xx=(b[0]-a[0])/du, xy=(b[1]-a[1])/du;
    const yx=(c[0]-a[0])/dv, yy=(c[1]-a[1])/dv;
    layer.transform(xx,xy,yx,yy,a[0]-xx*u-yx*v,a[1]-xy*u-yy*v);
    layer.drawImage(texture,0,0); layer.restore();
  }
  function drawWing() {
    if (pressureDirty) updateTexture();
    placeCamera();
    layer.clearRect(0,0,width,height);
    const xs=[0,.012,.035,.075,.15,.275,.45,.65,.85,1], spans=[0,.32,.65,.84,1];
    const point=(x,s,side=1)=>screen(wingPoint(x,s,side));
    const root=[...xs.map(x=>point(x,0)),...xs.slice().reverse().map(x=>point(x,0,-1))];
    line(layer,root); layer.closePath(); layer.fillStyle='#305158'; layer.fill();
    for(let j=0;j<spans.length-1;j++) for(let i=0;i<xs.length-1;i++) {
      const x=xs[i], y=spans[j], x2=xs[i+1], y2=spans[j+1];
      const a=point(x,y), b=point(x2,y), c=point(x,y2), d=point(x2,y2);
      const du=(x2-x)*texture.width, dv=(y2-y)*texture.height;
      triangle(a,b,c,x*texture.width,y*texture.height,du,dv);
      triangle(d,c,b,x2*texture.width,y2*texture.height,-du,-dv);
    }
    layer.strokeStyle='rgba(211,235,218,.52)'; layer.lineWidth=1;
    line(layer,root);layer.closePath();layer.stroke();
    if (mach===0) {
      layer.strokeStyle='rgba(216,235,225,.31)';
      for(let j=0;j<=12;j++) {line(layer,xs.map(x=>point(x,j/12)));layer.stroke();}
    }
    if (mach >= critical()+.035) {
      // Find the aft pressure rise at 65% semispan; the marker follows the actual map.
      let shockX=.3, maxRise=-Infinity;
      for(let x=.29;x<.93;x+=.004) {
        const rise=pressure(x+.012,.65)-pressure(x-.012,.65);
        if (rise>maxRise) {maxRise=rise;shockX=x;}
      }
      const [x,y]=point(shockX,.65);
      const end=[clamp(x+width*.10,30,width-48),clamp(y-height*.20,13,height-16)];
      layer.strokeStyle='#eae1bb';layer.fillStyle='#f4e5bc';layer.lineWidth=1;
      line(layer,[[x,y],end,[end[0]+9,end[1]]]);layer.stroke();
      layer.beginPath();layer.arc(x,y,2.3,0,Math.PI*2);layer.fill();
      layer.font='12px system-ui,sans-serif';layer.textBaseline='middle';
      layer.lineWidth=3;layer.strokeStyle='#10272e';layer.lineJoin='round';
      layer.strokeText('Shock',end[0]+12,end[1]);layer.fillText('Shock',end[0]+12,end[1]);
    }
    viewDirty=false;
  }
  function draw() {
    if (viewDirty||pressureDirty) drawWing();
    context.clearRect(0,0,width,height);
    if(mach>0) {
      context.lineWidth=.8;
      for(let lane=0;lane<16;lane++) {
        const s=-.55+lane*.177;
        const trajectory=t=>screen([-2+t*5.5,s,.01+.038*Math.exp(-(((t-.46)/.17)**2))]);
        const path=Array.from({length:15},(_,i)=>trajectory(i/14));
        context.strokeStyle='rgba(115,172,168,.18)';line(context,path);context.stroke();
        context.strokeStyle='rgba(176,224,214,.62)';
        for(let k=0;k<3;k++) {
          const t=(phase+k/3+lane*.117)%1;
          line(context,[trajectory(Math.max(0,t-.016)),trajectory(t)]);context.stroke();
        }
      }
    }
    context.drawImage(wingLayer,0,0,width,height);
  }
  function queue() {
    if(!frame && onScreen && !document.hidden) frame=requestAnimationFrame(update);
  }
  function update(now) {
    frame=0;
    const dt=lastTime ? Math.min(.05,(now-lastTime)/1000) : 1/60;
    lastTime=now;
    const turning=Math.abs(yaw-targetYaw)+Math.abs(elevation-targetElevation)>.0001;
    if(turning) {
      const gain=reducedMotion.matches?1:1-Math.exp(-dt*13);
      yaw=between(yaw,targetYaw,gain);elevation=between(elevation,targetElevation,gain);viewDirty=true;
    }
    if(running && mach>0) phase=(phase+dt*mach*.13)%1;
    draw();
    if(turning || (running && mach>0)) queue();
  }
  function setMotionLabel() {
    motion.textContent=mach===0?'Still air':running?'Pause traces':'Play traces';
    motion.disabled=mach===0;
  }
  function controlsChanged() {
    mach=Number(machInput.value);angle=Number(angleInput.value);
    figure.querySelector('#aero-mach-out').value=mach.toFixed(2);
    figure.querySelector('#aero-alpha-out').value=angle.toFixed(1)+'°';
    angleInput.setAttribute('aria-valuetext',angle.toFixed(1)+' degrees');
    figure.querySelector('#aero-regime').textContent=mach===0?'Still air · Cp undefined':mach<critical()?'Subsonic flow':mach===1?'Sonic freestream':'Transonic flow';
    pressureDirty=true;setMotionLabel();queue();
  }
  machInput.addEventListener('input',controlsChanged);
  angleInput.addEventListener('input',controlsChanged);
  motion.addEventListener('click',()=>{running=!running;setMotionLabel();queue();});
  reducedMotion.addEventListener('change',()=>{running=!reducedMotion.matches;setMotionLabel();queue();});
  let pointer=null;
  function remember(e){pointer={id:e.pointerId,x:e.clientX,y:e.clientY};}
  canvas.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')remember(e);});
  canvas.addEventListener('pointerdown',e=>{
    if(!e.isPrimary)return;
    remember(e);canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!e.isPrimary || (reducedMotion.matches && !e.buttons))return;
    if(!pointer || pointer.id!==e.pointerId){if(e.pointerType==='mouse')remember(e);return;}
    const dx=(e.clientX-pointer.x)/width, dy=(e.clientY-pointer.y)/height;
    remember(e);
    targetYaw=clamp(targetYaw+dx*1.12,.15,1.14);
    targetElevation=clamp(targetElevation-dy*.85,.39,1.28);
    queue();
  });
  for(const event of ['pointerleave','pointercancel','lostpointercapture']) {
    canvas.addEventListener(event,e=>{if(!canvas.hasPointerCapture(e.pointerId))pointer=null;});
  }
  canvas.addEventListener('keydown',e=>{
    const controls={ArrowLeft:[-.10,0],ArrowRight:[.10,0],ArrowUp:[0,.10],ArrowDown:[0,-.10]};
    if(e.key==='Home'){targetYaw=.67;targetElevation=.83;}
    else if(controls[e.key]){
      targetYaw=clamp(targetYaw+controls[e.key][0],.15,1.14);
      targetElevation=clamp(targetElevation+controls[e.key][1],.39,1.28);
    } else return;
    e.preventDefault();queue();
  });
  function resize() {
    const rect=stage.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);ratio=Math.min(devicePixelRatio||1,2);
    for(const item of [canvas,wingLayer]) {item.width=Math.round(width*ratio);item.height=Math.round(height*ratio);}
    context.setTransform(ratio,0,0,ratio,0,0);layer.setTransform(ratio,0,0,ratio,0,0);
    viewDirty=true;draw();
  }
  canvas.hidden=false;
  figure.querySelector('#aero-fallback').hidden=true;
  figure.querySelector('.aero-interactive').hidden=false;
  controlsChanged();resize();
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([entry])=>{
    onScreen=entry.isIntersecting;
    if(onScreen){lastTime=0;queue();} else {cancelAnimationFrame(frame);frame=0;}
  }).observe(stage);
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)queue();});
})();

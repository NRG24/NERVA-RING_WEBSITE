// Renders NERVA Instagram / ad stills from HTML at exact pixel sizes, with
// the site's own font and almond palette. Needs nerva-site's node_modules
// (npm ci there) and Playwright. The videos are ffmpeg recipes in ../ads.md.
const { chromium } = require('playwright');
const path = require('path');
const SITE = path.resolve(__dirname, '../../nerva-site'); // run: node launch/creative/build.cjs <outdir> [name-prefix]
const OUT = process.argv[2];
const A = (p) => 'file://' + path.join(SITE, p);
const FONT = A('node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2');

const C = { bg: '#f0dcca', sage: '#cdc6a5', mid: '#8d9f87', accent: '#6f9283', band: '#3e4250', ink: '#2a2c34', led: '#30d158', forest: '#06251a' };

const base = (w, h, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: H; src: url(${FONT}) format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${w}px; height: ${h}px; overflow: hidden; }
body { font-family: H, sans-serif; color: ${C.ink}; background: ${C.bg}; position: relative; -webkit-font-smoothing: antialiased; }
h1 { font-weight: 600; letter-spacing: -0.035em; line-height: 1.02; }
.b { font-weight: 750; }
.tag { position: absolute; font-size: 22px; font-weight: 500; letter-spacing: 0; color: rgba(42,44,52,.62); }
.tag--light { color: rgba(255,255,255,.78); }
.brand { position: absolute; display: flex; align-items: center; gap: 12px; font-weight: 650; font-size: 30px; letter-spacing: -0.01em; }
.brand img { width: 34px; height: 34px; }
.cta { position: absolute; display: inline-block; padding: 22px 38px; border-radius: 999px; background: ${C.band}; color: ${C.bg}; font-weight: 600; font-size: 30px; }
${extra}</style></head><body>${body}</body></html>`;

// skin conductance response, the shape the site's science page draws:
// flat, a fast rise a beat after the event, a slow decay
function scr(w, h, t0 = 0.34) {
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const x = i / 240, t = (x - t0) * 22;
    let y = 0.02 * Math.sin(i * 0.31) * 0.4;
    if (t > 0) y += (1 - Math.exp(-t / 0.9)) * Math.exp(-t / 6.5) * 1.15;
    pts.push(`${(x * w).toFixed(1)},${(h * 0.86 - y * h * 0.7).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

const brand = (x, y, light) => `<div class="brand" style="left:${x}px;top:${y}px;color:${light ? '#fff' : C.ink}"><img src="${A('public/favicon.png')}">NERVA Ring</div>`;

const shots = {
  // 1. the prototype, photographed
  'feed-prototype': [1080, 1350, base(1080, 1350, `
    <img src="${A('src/assets/proto-bench.webp')}" style="position:absolute;left:0;top:0;width:1080px;height:1000px;object-fit:cover;object-position:50% 58%">
    <div class="tag tag--light" style="left:56px;top:932px">Bench prototype. A photo, not a render.</div>
    <h1 style="position:absolute;left:56px;top:1046px;width:960px;font-size:66px">A smart ring that reads stress <span class="b">through your skin.</span></h1>
    <div style="position:absolute;left:56px;bottom:52px;font-size:28px;color:${C.band}">Kickstarter, early 2027. Join the waitlist.</div>
    ${brand(800, 1270)}`)],

  // 2. why skin: the physiology, drawn
  'feed-skin': [1080, 1350, base(1080, 1350, `
    <h1 style="position:absolute;left:64px;top:84px;width:950px;font-size:76px">Your heart isn’t the only thing that <span class="b">reacts to stress.</span></h1>
    <div style="position:absolute;left:300px;top:390px;width:620px;height:620px;border-radius:50%;background:${C.sage}"></div>
    <img src="${A('public/nerva-levitate-ceramic-still.webp')}" style="position:absolute;left:230px;top:330px;width:760px;height:760px;object-fit:contain">
    <svg style="position:absolute;left:64px;top:1000px" width="952" height="190" viewBox="0 0 952 190">
      <line x1="0" y1="164" x2="952" y2="164" stroke="rgba(42,44,52,.18)" stroke-width="2"/>
      <path d="${scr(952, 190)}" fill="none" stroke="${C.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="324" y1="20" x2="324" y2="164" stroke="${C.ink}" stroke-width="2" stroke-dasharray="4 7"/>
      <text x="336" y="34" font-family="H" font-size="24" fill="${C.ink}">a sudden noise</text>
    </svg>
    <div class="tag" style="left:64px;top:1206px">Skin conductance after a startle. Illustration. Ring is a render.</div>
    <div style="position:absolute;left:64px;bottom:58px;width:640px;font-size:28px;line-height:1.3;color:${C.band}">NERVA reads this skin signal alongside heart rate.</div>
    ${brand(800, 1270)}`)],

  // 3. the finishes, a vote
  'feed-finishes': [1080, 1350, base(1080, 1350, `
    <h1 style="position:absolute;left:64px;top:76px;font-size:80px">Which one would <span class="b" style="white-space:nowrap">you wear?</span></h1>
    ${['blue', 'ceramic-black', 'coffee', 'pink'].map((n, i) => `<figure style="position:absolute;left:${64 + (i % 2) * 484}px;top:${250 + Math.floor(i / 2) * 484}px;width:468px;height:468px;border-radius:28px;overflow:hidden;margin:0">
      <img src="${A('src/assets/ring-' + n + '.webp')}" style="width:100%;height:100%;object-fit:cover"></figure>
      <div style="position:absolute;left:${92 + (i % 2) * 484}px;top:${672 + Math.floor(i / 2) * 484}px;font-size:28px;font-weight:600;color:#fff">${['Blue', 'Black', 'Coffee', 'Pink'][i]}</div>`).join('')}
    <div class="tag" style="left:64px;top:1236px">Renders. The working prototype is black ceramic.</div>
    ${brand(800, 1270)}`)],

  // 4. Story: prototype photo, room left for the link sticker
  'story-prototype': [1080, 1920, base(1080, 1920, `
    <img src="${A('src/assets/proto-hand.webp')}" style="position:absolute;left:0;top:0;width:1080px;height:1440px;object-fit:cover;object-position:50% 50%">
    <div class="tag tag--light" style="left:64px;top:1370px">Bench prototype. A photo, not a render.</div>
    <h1 style="position:absolute;left:64px;top:1490px;width:950px;font-size:70px">The first NERVA Ring <span class="b">that works.</span></h1>
    <div style="position:absolute;left:64px;top:1672px;font-size:30px;color:${C.band}">Kickstarter, early 2027. Link below to join the waitlist.</div>`)],

  // overlays for the videos (transparent PNGs, composited by ffmpeg)
  'ov-levitate': [1080, 1920, base(1080, 1920, `
    <h1 style="position:absolute;left:64px;top:170px;width:950px;font-size:92px">See stress building <span class="b">before it’s burnout.</span></h1>
    <div class="tag" style="left:64px;top:1290px">Render</div>
    <div style="position:absolute;left:64px;top:1440px;width:900px;font-size:36px;line-height:1.3;color:${C.band}">A smart ring that reads your skin’s response to stress alongside heart rate.</div>
    <div class="cta" style="left:64px;top:1600px">Join the waitlist</div>
    <div style="position:absolute;left:64px;top:1720px;font-size:28px;color:${C.band}">Kickstarter, early 2027</div>`, 'body{background:transparent}')],
  'ov-finishes': [1080, 1920, base(1080, 1920, `
    <h1 style="position:absolute;left:64px;top:170px;width:980px;font-size:84px">Which one would <span class="b" style="white-space:nowrap">you wear?</span></h1>
    <div class="tag" style="left:64px;top:1480px">Renders. The working prototype is black ceramic.</div>
    <div style="position:absolute;left:64px;top:1560px;font-size:36px;color:${C.band}">Vote in the comments. Waitlist in bio.</div>`, 'body{background:transparent}')],
};


for (const [i, n] of ['blue', 'ceramic-black', 'coffee', 'pink'].entries()) {
  shots['reel-finish-' + i] = [1080, 1920, base(1080, 1920, `
    <h1 style="position:absolute;left:64px;top:170px;width:980px;font-size:84px">Which one would <span class="b" style="white-space:nowrap">you wear?</span></h1>
    <figure style="position:absolute;left:64px;top:440px;width:952px;height:952px;border-radius:28px;overflow:hidden;margin:0">
      <img src="${A('src/assets/ring-' + n + '.webp')}" style="width:100%;height:100%;object-fit:cover"></figure>
    <div style="position:absolute;left:104px;top:1316px;font-size:44px;font-weight:600;color:#fff">${['Blue', 'Black', 'Coffee', 'Pink'][i]}</div>
    <div style="position:absolute;left:64px;top:1440px;display:flex;gap:14px">${[0,1,2,3].map(k => `<span style="width:${k === i ? 56 : 14}px;height:14px;border-radius:999px;background:${k === i ? C.band : 'rgba(62,66,80,.25)'}"></span>`).join('')}</div>
    <div class="tag" style="left:64px;top:1500px">Renders. The working prototype is black ceramic.</div>
    <div style="position:absolute;left:64px;top:1560px;font-size:36px;color:${C.band}">Vote in the comments. Waitlist in bio.</div>`)];
}
shots['disc'] = [1080, 1920, base(1080, 1920, `<div style="position:absolute;left:105px;top:395px;width:870px;height:870px;border-radius:50%;background:${C.sage}"></div>`, 'body{background:transparent}')];

(async () => {
  const b = await chromium.launch();
  for (const [name, [w, h, html]] of Object.entries(shots)) {
    if (process.argv[3] && !name.startsWith(process.argv[3])) continue;
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const f = path.join(OUT, '_' + name + '.html'); require('fs').writeFileSync(f, html); await p.goto('file://' + f, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: name.startsWith('ov-') || name === 'disc' });
    await p.close();
    console.log('wrote', name);
  }
  await b.close();
})();

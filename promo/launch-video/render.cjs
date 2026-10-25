const { chromium } = require('playwright');
const FPS = 30, TOTAL = 60 * FPS;
const [w, nw] = process.argv.slice(2).map(Number);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/launch.html');
  await p.evaluate(() => window.ready);
  for (let f = w; f < TOTAL; f += nw) {
    await p.evaluate(t => window.renderAt(t), f / FPS);
    await p.screenshot({ path: `${__dirname}/frames/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95 });
  }
  await b.close();
  console.log('worker', w, 'done');
})();

// Screenshots the real WattWise UI (dark theme, 2x) for the launch video.
// Needs the dev server on http://localhost:5173. The sizing API is stubbed with
// the "family home" case from src/sample/frontend_samples.json so no network is used.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE = 'http://localhost:5173'
const OUT = path.join(__dirname, 'shots') + '/'
const samples = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/sample/frontend_samples.json'), 'utf8'),
)
const fam = samples.cases.find((c) => c.case === '2 family home' && c.version === 'v2')

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  })
  await ctx.addInitScript((draft) => {
    localStorage.setItem('wattwise-theme', 'dark')
    sessionStorage.setItem('wattwise-draft-v2', JSON.stringify(draft))
  }, fam.request)
  await ctx.route('**/power_calculator/appliances/**', (r) => r.fulfill({ json: samples.appliances }))
  await ctx.route('**/power_calculator/calculate/**', (r) => r.fulfill({ json: fam.response }))
  const page = await ctx.newPage()

  // Landing page: hero, then scroll through so every in-view animation has run.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: OUT + 'hero.png' })
  for (let y = 0; y < 7000; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(150)
  }
  for (const [name, sel] of [
    ['flow', 'div.isolate.rounded-2xl.bg-surface'],
    ['modecards', 'div.mt-14.grid.md\\:grid-cols-2'],
  ]) {
    const loc = page.locator(sel).first()
    await loc.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)
    await loc.screenshot({ path: OUT + name + '.png' })
  }

  // Custom sizing wizard, prefilled from the draft.
  await page.goto(BASE + '/v2/system', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: OUT + 'system.png' })
  await page.getByRole('button', { name: /Continue/ }).first().click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: OUT + 'loads_full.png', fullPage: true })
  await page.getByRole('button', { name: /Review/ }).first().click()
  await page.waitForTimeout(3500)
  await page.screenshot({ path: OUT + 'spec_full.png', fullPage: true })

  await browser.close()
})()

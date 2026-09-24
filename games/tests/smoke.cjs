/* Browser checks for the actual offline game, not a parallel implementation. */
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:1000}});
  const errors = [], remote = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/^https?:/.test(r.url())) remote.push(r.url()); });
  const url = pathToFileURL(path.resolve(__dirname,'../lesson-01/index.html')).href;
  await page.goto(url);
  assert(await page.locator('#check').isDisabled());
  await page.locator('[data-value="question"]').click();
  assert(await page.locator('#check').isDisabled(), 'An option alone cannot reveal feedback');
  await page.locator('#spoken').check();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(), /take another look/);
  await page.locator('[data-value="claim"]').click();
  await page.locator('#check').click();
  assert(await page.locator('#check').isDisabled(), 'Correct cards cannot be counted repeatedly');
  await page.locator('#next').click();
  // The supporting weather sentence is also a claim.
  await page.locator('[data-value="claim"]').click();
  await page.locator('#reason').fill('We could check the weather.');
  await page.locator('#level').selectOption('builder');
  assert.match(await page.locator('.reason-label').innerText(), /other answer/);
  assert.equal(await page.locator('#reason').inputValue(),'We could check the weather.');
  await page.locator('[data-game="match"]').click();
  await page.locator('[data-game="sort"]').click();
  assert.equal(await page.locator('#reason').inputValue(),'We could check the weather.');
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/also a claim/);
  await page.locator('#next').click();
  for (const value of ['question','claim','reason','question']) {
    await page.locator(`[data-value="${value}"]`).click();
    await page.locator('#spoken').check();
    await page.locator('#check').click();
    await page.locator('#next').click();
  }
  assert(await page.locator('[data-game="sort"] .done').isVisible());
  await page.locator('#next-game').click();
  await page.locator('[data-value="0"]').click();
  await page.locator('#spoken').check();
  await page.locator('#check').click();
  assert.match(await page.locator('#feedback').innerText(),/take another look/);
  for (const value of ['1','0','2']) {
    await page.locator(`[data-value="${value}"]`).click();
    await page.locator('#spoken').check();
    await page.locator('#check').click();
    await page.locator('#next').click();
  }
  assert(await page.locator('[data-game="match"] .done').isVisible());
  await page.locator('#next-game').click();
  await page.locator('[data-value="drawing"]').click();
  await page.locator('#reason').fill('Ten minutes fits before dinner.');
  await page.locator('#check').click();
  assert.match(await page.locator('.new-info').innerText(),/save the board game halfway/);
  assert(await page.locator('#check').isDisabled(), 'Reconsideration requires a fresh choice and reason');
  await page.locator('[data-value="board"]').click();
  const raw = '<img src=x onerror=alert(1)> We can pause it.';
  await page.locator('#reason').fill(raw);
  await page.locator('#check').click();
  assert.match(await page.locator('#decision-summary').innerText(),/First choice: Drawing game/);
  assert.match(await page.locator('#decision-summary').innerText(),/After the new clue: Board game/);
  assert((await page.locator('#decision-summary').innerText()).includes(raw));
  assert.equal(await page.locator('#decision-summary img').count(),0,'Learner input must remain plain text');
  // Replay and keep the original choice: both paths are valid.
  await page.locator('#replay').click();
  for (let i=0;i<2;i++) {
    await page.locator('[data-value="drawing"]').click();
    await page.locator('#spoken').check();
    await page.locator('#check').click();
  }
  assert.match(await page.locator('#decision-summary').innerText(),/After the new clue: Drawing game/);
  await page.locator('.parent summary').click();
  await page.locator('#reset').click();
  assert.equal(await page.locator('.done:visible').count(),0);
  assert.equal(await page.locator('#level').inputValue(),'explorer');
  assert.equal(await page.locator('#reason').inputValue(),'');
  // Keyboard-only selection, explanation confirmation, and feedback.
  await page.locator('[data-value="claim"]').focus();
  await page.keyboard.press('Enter');
  await page.locator('#spoken').focus();
  await page.keyboard.press('Space');
  await page.locator('#check').focus();
  await page.keyboard.press('Enter');
  assert.match(await page.locator('#feedback').innerText(),/That answer fits/);
  await page.reload();
  assert.equal(await page.locator('#reason').inputValue(),'');
  assert(await page.locator('#check').isDisabled());
  await page.screenshot({path:'/tmp/logickids-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for (const game of ['sort','match','decision']) {
    await page.locator(`[data-game="${game}"]`).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), `${game} overflows mobile viewport`);
  }
  await page.screenshot({path:'/tmp/logickids-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  assert.deepEqual(remote,[], 'Offline game must not request remote services');
  await browser.close();
  console.log('PASS: 3 missions, retries, dual claim/reason roles, reasoning gates, decision revision and retention, safe text, session restoration, reset, reload, keyboard, mobile, offline.');
})().catch(e=>{console.error(e);process.exit(1)});

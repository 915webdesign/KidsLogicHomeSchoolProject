// DOM-level checks. These do not verify real-browser layout or keyboard behavior.
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '../lesson-01');
const dom = new JSDOM(fs.readFileSync(path.join(base,'index.html'),'utf8'), {runScripts:'outside-only'});
const {window:w} = dom;
for (const file of ['content.js','app.js']) w.eval(fs.readFileSync(path.join(base,file),'utf8'));
const $ = s => {const el=w.document.querySelector(s);assert(el,`Missing ${s}`);return el};
const click = s => $(s).click();
const text = s => $(s).textContent;
const fill = (s,value) => {$(s).value=value;$(s).dispatchEvent(new w.Event('input',{bubbles:true}))};
const speak = () => {if (!$('#spoken').checked) click('#spoken')};
const choose = value => click(`[data-value="${value}"]`);
assert($('#check').disabled);
choose('question'); assert($('#check').disabled);
fill('#reason','   '); assert($('#check').disabled);
speak(); click('#check'); assert.match(text('#feedback'), /take another look/);
choose('claim'); click('#check'); assert.match(text('#feedback'), /That answer fits/);
assert($('#check').disabled); assert($('[data-value="question"]').disabled);
click('#next');
choose('claim'); fill('#reason','We can check whether the weather is dry.');
$('#level').value='builder'; $('#level').dispatchEvent(new w.Event('change'));
assert.match(text('.reason-label'),/other answer/);
click('[data-game="match"]');click('[data-game="sort"]');
assert.equal($('#reason').value,'We can check whether the weather is dry.');
assert.equal($('[data-value="claim"]').getAttribute('aria-pressed'),'true');
click('#check'); assert.match(text('#feedback'),/also a claim/);click('#next');
for (const value of ['question','claim','reason','question']) {choose(value);speak();click('#check');click('#next')}
assert.equal($('[data-game="sort"] .done').hidden,false);
click('#next-game');
choose('0');speak();click('#check');assert.match(text('#feedback'),/take another look/);
for(const value of ['1','0','2']) {choose(value);speak();click('#check');click('#next')}
assert.equal($('[data-game="match"] .done').hidden,false);
click('#next-game');
choose('drawing'); fill('#reason','It fits before dinner.');click('#check');
assert.match(text('.new-info'),/save the board game halfway/);assert($('#check').disabled);
choose('board');fill('#reason','<img src=x onerror=alert(1)> We can pause it.');click('#check');
assert.match(text('#decision-summary'),/First choice: Drawing game/);
assert.match(text('#decision-summary'),/After the new clue: Board game/);
assert.match(text('#decision-summary'),/<img/);assert.equal(w.document.querySelector('#decision-summary img'),null);
assert.equal($('[data-game="decision"] .done').hidden,false);
click('#replay');
for(let i=0;i<2;i++){choose('drawing');speak();click('#check')}
assert.match(text('#decision-summary'),/After the new clue: Drawing game/);
// An initial long-game choice is also allowed: discussion, not automatic grading.
click('#replay');
for(let i=0;i<2;i++){choose('board');speak();click('#check')}
assert.match(text('#decision-summary'),/First choice: Board game/);
assert.match(text('#decision-summary'),/After the new clue: Board game/);
click('#reset');
assert([...w.document.querySelectorAll('.done')].every(el=>el.hidden));
assert.equal($('#level').value,'explorer');assert.equal($('#reason').value,'');assert($('#check').disabled);
// Alternate valid classifications of the supporting statements.
for(const value of ['claim','reason','question','claim','claim','question']){choose(value);speak();click('#check');click('#next')}
assert.match(text('#activity'),/Mission explored/);
dom.window.close();
console.log('PASS: all three games; both accepted roles for supporting statements; wrong-answer retries; reasoning gate; session and level changes; decision change/keep/both options; safe input rendering; replay; reset.');

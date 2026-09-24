'use strict';
(() => {
  const data = window.LogicKidsContent;
  const activity = document.querySelector('#activity');
  const level = document.querySelector('#level');
  const completed = new Set();
  let game = 'sort';
  let state;
  const titles = { sort: 'Statement Sorter', match: 'Reason Detective', decision: 'Dinner Countdown' };
  const fresh = () => ({ index: 0, selected: null, reason: '', spoken: false, checked: false, correct: false, finished: false, first: null });
  const sessions = { sort: fresh(), match: fresh(), decision: fresh() };
  const optionName = value => value === 'board' ? 'Board game' : 'Drawing game';
  const explanationPrompt = () => level.value === 'builder'
    ? (game === 'decision' ? 'Give two reasons. What might someone disagree with, and how would you reply?' : 'Why does your answer fit? What other answer might someone give, or what could you check?')
    : 'Why do you think so? Say it aloud or write a little.';
  function form() {
    return `<label class="reason-label" for="reason">${explanationPrompt()}</label><textarea id="reason" maxlength="800" placeholder="I think… because…"></textarea><label class="spoken"><input type="checkbox" id="spoken"> I explained my thinking aloud.</label><div class="actions"><button id="check" class="primary" disabled>${game === 'decision' ? (state.index === 0 ? 'Reveal a new clue' : 'Finish my decision') : 'Check my thinking'}</button></div><div id="feedback" role="status" aria-live="polite"></div>`;
  }
  function markComplete() {
    completed.add(game);
    document.querySelector(`[data-game="${game}"] .done`).hidden = false;
  }
  function render(focus = false) {
    state = sessions[game];
    const count = game === 'decision' ? 2 : data[game].length;
    activity.innerHTML = `<div class="progress-line"><span>MISSION ${['sort','match','decision'].indexOf(game)+1} / 3</span><span>${state.finished ? 'EXPLORED' : `${state.index+1} OF ${count}`}</span></div><div class="progress" aria-hidden="true"><span style="width:${state.finished ? 100 : state.index/count*100}%"></span></div><h2 id="game-title" tabindex="-1">${titles[game]}</h2>`;
    if (state.finished) {
      renderFinished();
    } else if (game === 'decision') {
      renderDecision();
      wireForm();
    } else {
      const item = data[game][state.index];
      const labels = {claim:['Claim','What I think'],reason:['Reason','Why I think so'],question:['Question','What I want to know']};
      activity.insertAdjacentHTML('beforeend', `<p class="lead">${game === 'sort' ? 'What job does this statement do in the conversation?' : 'Which reason gives the strongest support for this claim?'}</p><div class="clue">${game === 'sort' ? `<small>${item.context}</small>` : '<small>THE CLAIM</small>'}<p class="statement">${item.text || item.claim}</p></div><div class="choices ${game === 'match' ? 'stacked' : ''}">${game === 'sort' ? Object.entries(labels).map(([key,label]) => `<button class="choice" data-value="${key}" aria-pressed="false"><strong>${label[0]}</strong><small>${label[1]}</small></button>`).join('') : item.options.map((text,i) => `<button class="choice" data-value="${i}" aria-pressed="false">${text}</button>`).join('')}</div>${form()}`);
      wireForm();
      if (state.checked) showFeedback();
    }
    if (focus) document.querySelector('#game-title').focus();
  }
  function renderDecision() {
    activity.insertAdjacentHTML('beforeend', `<p class="lead">You have 20 minutes before dinner. Which game would you choose?</p>${state.index === 1 ? `<div class="new-info"><strong>NEW CLUE</strong>You can save the board game halfway and finish it later.</div><p>You first chose <strong>${optionName(state.first.selected).toLowerCase()}</strong>. Keep your choice or change it. Explain why.</p>` : ''}<div class="choices stacked"><button class="choice" data-value="board" aria-pressed="false"><strong>Board game</strong><small>30 minutes for a full game</small></button><button class="choice" data-value="drawing" aria-pressed="false"><strong>Drawing game</strong><small>10 minutes for a full game</small></button></div>${form()}`);
  }
  function wireForm() {
    const reason = document.querySelector('#reason');
    const spoken = document.querySelector('#spoken');
    reason.value = state.reason;
    spoken.checked = state.spoken;
    document.querySelectorAll('.choice').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.value === state.selected));
      button.addEventListener('click', () => {
        state.selected = button.dataset.value;
        state.checked = false;
        document.querySelectorAll('.choice').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        document.querySelector('#feedback').replaceChildren();
        document.querySelector('#feedback').className = '';
        updateCheck();
      });
    });
    reason.addEventListener('input', () => { state.reason = reason.value; updateCheck(); });
    spoken.addEventListener('change', () => { state.spoken = spoken.checked; updateCheck(); });
    document.querySelector('#check').addEventListener('click', check);
    updateCheck();
  }
  function updateCheck() {
    const checkButton = document.querySelector('#check');
    if (checkButton) checkButton.disabled = state.selected === null || (!state.reason.trim() && !state.spoken) || (state.checked && state.correct);
  }
  function check() {
    if (state.selected === null || (!state.reason.trim() && !state.spoken)) return;
    if (game === 'decision') {
      if (state.index === 0) {
        state.first = {selected:state.selected, reason:state.reason, spoken:state.spoken};
        state.index = 1; state.selected = null; state.reason = ''; state.spoken = false;
      } else {
        state.finished = true;
        markComplete();
      }
      render(true);
      return;
    }
    const item = data[game][state.index];
    state.correct = game === 'sort' ? item.accepted.includes(state.selected) : Number(state.selected) === item.answer;
    state.checked = true;
    showFeedback();
  }
  function showFeedback() {
    const item = data[game][state.index];
    const el = document.querySelector('#feedback');
    el.className = `feedback${state.correct ? '' : ' hint'}`;
    // Feedback evaluates the selected option only. Written reasoning is for discussion with an adult.
    el.innerHTML = state.correct
      ? `<strong>That answer fits.</strong><p>${item.explanation}</p>${item.question ? `<p>One more question: ${item.question}</p>` : ''}<p>Compare this explanation with your own reason.</p><button class="primary" id="next">${state.index === data[game].length-1 ? 'Finish this mission' : 'Next challenge'}</button>`
      : `<strong>Let’s take another look.</strong><p>${game === 'sort' ? 'A claim says what we think. A reason supports a claim. A question asks for information. Read the conversation clue, then try another answer.' : 'Does that detail tell us about this particular claim? Some details are true or interesting without giving strong support. Try another clue.'}</p>`;
    if (state.correct) {
      document.querySelectorAll('.choice, #reason, #spoken').forEach(el => { el.disabled = true; });
      document.querySelector('#next').addEventListener('click', () => {
        if (state.index === data[game].length-1) { state.finished = true; markComplete(); }
        else { state.index++; state.selected = null; state.reason = ''; state.spoken = false; state.checked = false; state.correct = false; }
        render(true);
      });
    }
    updateCheck();
  }
  function renderFinished() {
    activity.insertAdjacentHTML('beforeend', `<div class="celebrate" aria-hidden="true">✦</div><h3>${game === 'decision' ? 'You considered a new clue.' : 'Mission explored!'}</h3><p class="lead">${game === 'decision' ? 'A careful thinker can keep a choice or change it. Talk about whether your reasons support your decision.' : 'You practiced explaining your thinking. Now try a new example with your grown-up.'}</p>`);
    if (game === 'decision') {
      activity.insertAdjacentHTML('beforeend','<div class="summary-card" id="decision-summary"></div>');
      const summary = document.querySelector('#decision-summary');
      for (const text of [`First choice: ${optionName(state.first.selected)}`, `First reason: ${state.first.reason.trim() || 'Explained aloud.'}`, `After the new clue: ${optionName(state.selected)}`, `My reason now: ${state.reason.trim() || 'Explained aloud.'}`]) {
        const p = document.createElement('p'); p.textContent = text; summary.append(p);
      }
      activity.insertAdjacentHTML('beforeend', '<p><strong>Exit question:</strong> What else would you want to know before deciding? Could setup, cleanup, or saving the game affect your choice?</p>');
    } else {
      activity.insertAdjacentHTML('beforeend', `<div class="summary-card">${game === 'sort' ? 'Say one claim, one reason that supports it, and one question that could help you check it.' : 'Make up a claim. Can your partner invent one helpful reason and one unrelated detail?'}</div>`);
    }
    activity.insertAdjacentHTML('beforeend', `<div class="actions"><button class="primary" id="replay">Play this mission again</button>${game !== 'decision' ? '<button class="secondary" id="next-game">Try the next mission</button>' : ''}</div>`);
    document.querySelector('#replay').addEventListener('click', () => { sessions[game] = fresh(); completed.delete(game); document.querySelector(`[data-game="${game}"] .done`).hidden = true; render(true); });
    document.querySelector('#next-game')?.addEventListener('click', () => chooseGame(game === 'sort' ? 'match' : 'decision'));
  }
  function chooseGame(next) {
    game = next;
    document.querySelectorAll('[data-game]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.game === game)));
    render(true);
  }
  document.querySelectorAll('[data-game]').forEach(b => b.addEventListener('click', () => chooseGame(b.dataset.game)));
  level.addEventListener('change', () => {
    const label = document.querySelector('.reason-label');
    if (label) label.textContent = explanationPrompt();
  });
  document.querySelector('#reset').addEventListener('click', () => {
    Object.keys(sessions).forEach(key => { sessions[key] = fresh(); });
    completed.clear(); document.querySelectorAll('.done').forEach(el => { el.hidden = true; });
    level.value = 'explorer'; chooseGame('sort');
  });
  render();
})();

# LogicKids games

Short browser activities tied to the lessons. Start with [Lesson 1: Logic Lab](lesson-01/index.html).

## Play on your computer

1. On the repository page, choose **Code → Download ZIP** and unzip it.
2. Open `games/lesson-01/index.html` in a browser. Double-clicking works; there is no installation or build step.
3. Choose Explorer or Builder, then play together. An adult can read aloud.

GitHub's file preview shows source code; it does not run the game. These files are ready to run locally or serve from a static host, but this change does not publish a hosted site.

Developers can also run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000/games/lesson-01/`.

## Lesson 1 activities

| Game | Skill | How it connects |
| --- | --- | --- |
| Statement Sorter | Identify claims, reasons, questions in context | Uses the lesson's six sorting cards; accepts that a supporting reason is also a claim |
| Reason Detective | Find a reason relevant to a particular claim | Compare a missing piece, available time, and measured cup capacity |
| Dinner Countdown | Explain and revisit a choice | Uses the 20-minute scenario, then reveals that the board game can be saved |

Learners must select an option and either write their thinking or confirm they explained it aloud before feedback appears. A completion mark records participation, not understanding. The app checks selected options in the first two games; it does not evaluate written explanations. The adult discusses those. Both dinner choices are allowed.

Answers exist only in memory. Switching missions keeps the current session; reset or reload clears it. No accounts, analytics, external assets, AI calls, storage, or backend. No typed answer is added to the repository.

## Build your own challenge together

1. Play an existing example and explain what it teaches.
2. On paper, invent a new claim and three possible reasons. Explain why one is strongest and how the others differ.
3. With an adult, duplicate an entry in `lesson-01/content.js` and change its example, options, explanation, and checking question. `answer` is the correct option's position starting at **0**. For sorter cards, `accepted` can contain both `claim` and `reason` when the context supports both.
4. Reload the page and test every choice. Ask a partner to find a confusing example, then revise it.
5. Have an adult review a branch and pull request. Commit invented examples only, never private learner answers or identifiers.

Explorer can dictate one new example. Builder can write an example and explain a counterexample or ambiguity. Changing the examples is a first project; a new lesson game should introduce a new mechanic only when it helps teach that lesson.

## Next game ideas (not implemented yet)

Follow [the curriculum](../docs/curriculum.md): a meaning-matching game for week 2, a true/false/unknown mystery for week 3, an if–then rule tester for week 4, and an AND/OR/NOT treasure hunt for week 5.

## Verify changes

For DOM-level interaction checks (Node.js and jsdom):

```sh
node games/tests/interactions.cjs
```

For a real-browser check (Node.js, Playwright, and its Chromium browser):

```sh
node games/tests/smoke.cjs
```

Install test tools outside the repository, for example:

```sh
npm install --prefix /tmp/logickids-tools jsdom playwright
export NODE_PATH=/tmp/logickids-tools/node_modules
node /tmp/logickids-tools/node_modules/playwright/cli.js install chromium
```

The interaction test uses jsdom and does not verify browser layout or keyboard behavior. The app itself has no dependency on Playwright. The test covers wrong-answer retries, both roles for supporting statements, all three missions, changing a decision, keyboard use, reset, session preservation, and mobile overflow. It opens the app via `file://` to verify offline use.

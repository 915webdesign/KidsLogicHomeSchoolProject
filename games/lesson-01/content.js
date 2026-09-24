/* Change these examples with an adult, then test the game together. */
(function (root) {
  const content = {
    sort: [
      { text: 'We should play outside.', context: 'Someone suggests a plan.', accepted: ['claim'], explanation: 'This is a claim about what to do. Now we need a reason that supports it.' },
      { text: 'The weather is dry.', context: 'Someone says this to support playing outside.', accepted: ['reason', 'claim'], explanation: 'Its job here is to give a reason for playing outside. It is also a claim we can check! Dry weather does not tell us whether there is enough time.' },
      { text: 'What time is it?', context: 'Someone wants more information.', accepted: ['question'], explanation: 'This asks for information. The answer might help us decide whether we have time to play.' },
      { text: 'This puzzle has a missing piece.', context: 'Someone tells us what they think is true.', accepted: ['claim'], explanation: 'This is a claim. Counting the pieces could help us check it.' },
      { text: 'I counted only 19 pieces, but the box says 20.', context: 'Someone says this to support the missing-piece claim.', accepted: ['reason', 'claim'], explanation: 'This is a reason for thinking a piece is missing. It is also a claim about a count. We could count again to check.' },
      { text: 'Which game can we finish before dinner?', context: 'Someone is trying to make a choice.', accepted: ['question'], explanation: 'This is a question. It helps us find information for a decision.' }
    ],
    match: [
      { claim: 'This puzzle might have a missing piece.', options: ['The box has a colorful picture.', 'I counted 19 pieces; the box says 20.', 'Puzzles are fun.'], answer: 1, explanation: 'The count supports the missing-piece claim. The picture and whether puzzles are fun do not tell us how many pieces there are.', question: 'Could we have counted incorrectly?' },
      { claim: 'The drawing game will fit in our 20 minutes.', options: ['It takes 10 minutes.', 'The pencils are yellow.', 'I like drawing.'], answer: 0, explanation: 'Ten minutes fits inside twenty minutes. Liking a game may be a reason to choose it, but does not tell us how long it takes.', question: 'Do we need extra time to set up or clean up?' },
      { claim: 'The blue cup holds more water than the red cup.', options: ['Blue is my favorite color.', 'The blue cup looks taller.', 'We measured: blue holds two equal scoops; red holds one.'], answer: 2, explanation: 'Measuring with equal scoops gives stronger support than judging by height. A tall cup could also be very narrow.', question: 'Did we fill both cups the same way?' }
    ]
  };
  root.LogicKidsContent = content;
  if (typeof module !== 'undefined') module.exports = content;
})(typeof window !== 'undefined' ? window : globalThis);

export const motionBlocks = [
  { type: "move", template: "Move ____ steps", args: [10] },
  { type: "turn", template: "Turn ____ degrees", args: [15] },
  { type: "goto", template: "Go to x: ____ y: ____", args: [100, 100] },
  { type: "repeat", template: "Repeat ____ times", args: [5] },
];

export const looksBlocks = [
  { type: "say", template: "Say ____ for ____ seconds", args: ["Hello!", 2] },
  { type: "think", template: "Think ____ for ____ seconds", args: ["Hmm...", 2] },
];

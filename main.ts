// Ridiculous at First Glance, Real by the Second — make.fun entry (program/v1).
//
// One sentence, at most 200 characters, pitching a bizarre startup idea
// that sounds like a joke yet makes sense as a real business. A judge
// model compares entries two at a time, weighing (in brief order):
//   1. the idea is genuinely bizarre, not a familiar business with a
//      strange adjective bolted on;
//   2. the business logic holds — the sentence itself says who pays
//      and why;
//   3. the sentence lands as a pitch: one sentence with a turn from
//      laughing to nodding;
//   4. concrete and vivid, naming the thing sold and who buys it.
// Tie-breaks favour smaller text, so the winner is kept short and tight.
//
// This program scores a shortlist of candidate pitches against the
// brief, in the brief's own order, and writes the winner — one
// sentence, no trailing newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  bizarre: number; // 1-5: genuinely strange, not heard before
  logic: number; // 1-5: payer + reason to pay are clear in the sentence
  pitch: number; // 1-5: the turn from laugh to nod lands in one sentence
};

// The shortlist, brainstormed against the judge's brief. Every entry is
// one sentence: the odd thing sold + who pays + why it holds together.
// Why the winner wins, in the brief's order:
//   - Bizarre: renting someone else's grandmother to cook for you is
//     an idea no reader has heard before — a marketplace for borrowed
//     grandmothers, not a familiar business with a weird adjective.
//   - Logic: the payer (homesick expats) and the reason ($60 for a
//     meal that tastes like childhood) are both inside the sentence;
//     nostalgia is a real, proven market.
//   - Pitch: the turn lands in one breath — laugh at "rent out
//     grandmothers", nod at "tastes like childhood".
//   - Concrete: grandmothers, Sunday lunch, expats, $60 — no abstractions.
//   - Short: 132 characters, well inside the 200 cap, which also helps
//     the smaller-text tie-break (fewer bytes, then earlier receipt).
// Runners-up lose on the first differing criterion: applause actors and
// professional criers are less novel (hired crowds exist); the racehorse
// therapist's payer logic is softer; plant insurance is a known joke;
// the apology letters and the grain of sand sell a feeling with a
// thinner reason to pay every month.
const CANDIDATES: Candidate[] = [
  {
    text: "We rent out other people's grandmothers to cook Sunday lunch, because homesick expats pay $60 for a meal that tastes like childhood.",
    bizarre: 5,
    logic: 5,
    pitch: 5,
  },
  {
    text: "We hire actors to applaud at your product launch, because founders pay $150 for a crowd that makes investors think the room is full.",
    bizarre: 4,
    logic: 5,
    pitch: 4,
  },
  {
    text: "We rent retired racehorses as office therapists, because burned-out teams pay $200 an hour to brush a horse that never judges their sprint.",
    bizarre: 5,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We sell insurance against your houseplants dying, because plant parents pay $4 a month for a payout when their monstera gives up.",
    bizarre: 3,
    logic: 5,
    pitch: 4,
  },
  {
    text: "We mail you a handwritten apology from a stranger every week, because lonely people pay $10 to feel forgiven by someone they never met.",
    bizarre: 5,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We rent professional criers to weep at strangers' funerals, because families pay $200 an hour for a crowd that proves the deceased was loved.",
    bizarre: 4,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We mail you one grain of sand from a different beach every month, because collectors pay $7 to own the whole world one beach at a time.",
    bizarre: 5,
    logic: 3,
    pitch: 4,
  },
  {
    text: "We hire actors to play your fake ex at family dinners, because singles pay $80 to stop their grandmother asking when they will marry.",
    bizarre: 4,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We write your eulogy while you are still alive, because people pay $99 to make sure the speech at their funeral is funny instead of sad.",
    bizarre: 3,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We sell naming rights to potholes, because local businesses pay $50 a month for the sign that reads 'This crater was brought to you by Joe's Pizza.'",
    bizarre: 4,
    logic: 4,
    pitch: 4,
  },
  {
    text: "We lease office plants to startups and bill per leaf, because founders pay $40 a month for greenery that makes their pitch deck look funded.",
    bizarre: 4,
    logic: 3,
    pitch: 4,
  },
  {
    text: "We write your breakup texts for you, because daters pay $15 to end it kindly without ever picking up the phone.",
    bizarre: 2,
    logic: 4,
    pitch: 3,
  },
];

// Score in the brief's own order: bizarre, then logic, then pitch.
// Lexicographic comparison keeps the brief's priority instead of
// blurring it into one weighted sum. Exact tie: keep the earlier
// candidate (stable order); shorter text wins ties downstream.
function score(c: Candidate): [number, number, number] {
  return [c.bizarre, c.logic, c.pitch];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return a.text.length < b.text.length;
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const entry = best.text;

// Gate self-check: one sentence, 1-200 characters, not whitespace-only,
// exactly one sentence terminator (the final period).
if (entry.length < 1 || entry.length > 200) {
  throw new Error(`entry length ${entry.length} outside gate 1-200`);
}
if (entry.trim().length === 0) {
  throw new Error("entry is whitespace-only");
}
if ((entry.match(/\./g) ?? []).length !== 1 || !entry.endsWith(".")) {
  throw new Error(`entry must be exactly one sentence: ${JSON.stringify(entry)}`);
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// No trailing newline: the gate counts characters, and a newline would
// add a character and break the read-back equality check.
writeFileSync(`${outDir}/entry.txt`, entry, "utf8");

// Read it back and re-check: the file the grader gates must be the
// entry exactly, nothing else.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== entry) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(entry)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry (${entry.length} chars): ${entry}`);

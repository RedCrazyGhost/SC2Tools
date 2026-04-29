import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const xpFile = path.join(root, "assets/js/xp-data.js");
const source = fs.readFileSync(xpFile, "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const xp = sandbox.window.SC2XPData;

if (!xp) {
  console.error("cannot load SC2XPData");
  process.exit(1);
}

function assertEqual(actual, expected, name) {
  if (actual !== expected) {
    console.error(`${name} failed: expected ${expected}, got ${actual}`);
    process.exit(1);
  }
}

function perGame(difficulty, randomMapBonus = false) {
  const base = xp.baseXp + xp.objectiveXp;
  const diffBonus = xp.difficultyBonus[difficulty] || 0;
  const randomBonus = randomMapBonus ? xp.randomMapBonus : 0;
  return Math.round(base * (1 + diffBonus + randomBonus));
}

function mutationCumulative(difficulty) {
  const order = ["casual", "normal", "hard", "savage"];
  const idx = order.indexOf(difficulty);
  let total = 0;
  for (let i = 0; i <= idx; i += 1) {
    total += xp.mutationReward[order[i]];
  }
  return total;
}

assertEqual(perGame("casual", false), 22000, "casual per-game xp");
assertEqual(perGame("brutal", false), 44000, "brutal per-game xp");
assertEqual(perGame("brutal", true), 49500, "brutal random-map per-game xp");
assertEqual(mutationCumulative("casual"), 25000, "casual mutation reward");
assertEqual(mutationCumulative("savage"), 185000, "savage cumulative mutation reward");
assertEqual(xp.commanderLevels.cumulativeAtLevel[15], 1045000, "commander max cumulative");
assertEqual(xp.mastery.ascensionPerLevelXp, 200000, "mastery ascension step");

console.log("xp regression check passed");

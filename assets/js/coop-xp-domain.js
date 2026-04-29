(function (global) {
  "use strict";

  function parseDateInput(value) {
    const parts = String(value || "").split("-");
    if (parts.length !== 3) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const date = new Date(year, month, day);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function dateToInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function clampViewDate(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function mapDifficultyToMutationDifficulty(difficulty) {
    if (difficulty === "casual") return "casual";
    if (difficulty === "normal") return "normal";
    if (difficulty === "hard") return "hard";
    return "savage";
  }

  function calculateXp(input, mutationReward, xpConfig) {
    const base = xpConfig.baseXp + xpConfig.objectiveXp;
    const diffBonus = xpConfig.difficultyBonus[input.difficulty] || 0;
    const randomBonus = input.randomMapBonus ? xpConfig.randomMapBonus : 0;
    const firstWin = input.firstWinBonus ? xpConfig.firstWinFlatBonus : 0;
    const core = base * (1 + diffBonus + randomBonus);
    const mutationBonus = input.taskType === "mutation" ? mutationReward : 0;
    const total = Math.round(core + firstWin + mutationBonus);
    return {
      total,
      taskType: input.taskType,
      breakdown: {
        baseXp: xpConfig.baseXp,
        objectiveXp: xpConfig.objectiveXp,
        subtotal: base,
        diffBonus,
        randomBonus,
        firstWin,
        mutationBonus
      }
    };
  }

  function calculatePerGameXpByConfig(difficulty, randomMapBonus, xpConfig) {
    const base = xpConfig.baseXp + xpConfig.objectiveXp;
    const diffBonus = xpConfig.difficultyBonus[difficulty] || 0;
    const randomBonus = randomMapBonus ? xpConfig.randomMapBonus : 0;
    return Math.round(base * (1 + diffBonus + randomBonus));
  }

  function calculateMutationReward(difficulty, xpConfig) {
    return xpConfig.mutationReward[difficulty] || 0;
  }

  global.SC2CoopXpDomain = Object.freeze({
    parseDateInput,
    dateToInput,
    addDays,
    getMonthKey,
    clampViewDate,
    mapDifficultyToMutationDifficulty,
    calculateXp,
    calculatePerGameXpByConfig,
    calculateMutationReward
  });
})(window);

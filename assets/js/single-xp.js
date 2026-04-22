(function () {
  "use strict";

  const XP_CONFIG = {
    baseXp: 20000,
    objectiveXp: 2000,
    difficultyBonus: {
      casual: 0,
      normal: 0.2,
      hard: 0.5,
      brutal: 1.0,
      brutal1: 1.75,
      brutal2: 2.0,
      brutal3: 2.25,
      brutal4: 2.5,
      brutal5: 2.75,
      brutal6: 3.0
    },
    randomMapBonus: 0.25,
    firstWinFlatBonus: 10000,
    mutationReward: {
      casual: 25000,
      normal: 35000,
      hard: 50000,
      savage: 75000
    }
  };

  function toPercentText(value) {
    return `${Math.round(value * 100)}%`;
  }

  function formatXp(value) {
    return `${Math.round(Number(value) || 0).toLocaleString()} xp`;
  }

  function mapDifficultyToMutationDifficulty(difficulty) {
    if (difficulty === "casual") return "casual";
    if (difficulty === "normal") return "normal";
    if (difficulty === "hard") return "hard";
    return "savage";
  }

  function getMutationAccumulatedReward(selectedDifficulty) {
    const order = ["casual", "normal", "hard", "savage"];
    const idx = order.indexOf(selectedDifficulty);
    if (idx < 0) return 0;
    let total = 0;
    for (let i = 0; i <= idx; i += 1) {
      total += XP_CONFIG.mutationReward[order[i]] || 0;
    }
    return total;
  }

  function calculateXp(input, mutationReward) {
    const base = XP_CONFIG.baseXp + XP_CONFIG.objectiveXp;
    const diffBonus = XP_CONFIG.difficultyBonus[input.difficulty] || 0;
    const randomBonus = input.randomMapBonus ? XP_CONFIG.randomMapBonus : 0;
    const firstWin = input.firstWinBonus ? XP_CONFIG.firstWinFlatBonus : 0;
    const core = base * (1 + diffBonus + randomBonus);
    const mutationBonus = input.taskType === "mutation" ? mutationReward : 0;
    const total = Math.round(core + firstWin + mutationBonus);
    return {
      total,
      taskType: input.taskType,
      breakdown: {
        baseXp: XP_CONFIG.baseXp,
        objectiveXp: XP_CONFIG.objectiveXp,
        subtotal: base,
        diffBonus,
        randomBonus,
        firstWin,
        mutationBonus
      }
    };
  }

  function renderResult(target, result) {
    const firstWinText = result.taskType === "mutation" ? "每周首胜经验" : "每日首胜经验";
    target.innerHTML = [
      `<p><strong>每局经验：</strong>${formatXp(result.total)}</p>`,
      "<ul>",
      `<li>基础经验：${formatXp(result.breakdown.baseXp)}</li>`,
      `<li>奖励目标经验：${formatXp(result.breakdown.objectiveXp)}</li>`,
      `<li>基础合计：${formatXp(result.breakdown.subtotal)}</li>`,
      `<li>难度加成：${toPercentText(result.breakdown.diffBonus)}</li>`,
      `<li>随机地图加成：${toPercentText(result.breakdown.randomBonus)}</li>`,
      `<li>${firstWinText}：${formatXp(result.breakdown.firstWin)}</li>`,
      `<li>突变奖励：${formatXp(result.breakdown.mutationBonus)}</li>`,
      "</ul>"
    ].join("");
  }

  const form = document.getElementById("xp-form");
  const resultEl = document.getElementById("xp-result");
  const firstWinBonusLabel = document.getElementById("first-win-bonus-label");
  if (!form || !resultEl || !firstWinBonusLabel) {
    return;
  }

  function syncFirstWinBonusLabel() {
    const taskTypeSelect = form.querySelector('select[name="taskType"]');
    if (!taskTypeSelect) return;
    firstWinBonusLabel.textContent = taskTypeSelect.value === "mutation" ? "每周首胜" : "每日首胜";
  }

  function readInput() {
    const data = new FormData(form);
    return {
      difficulty: String(data.get("difficulty") || "casual"),
      randomMapBonus: data.get("randomMapBonus") === "on",
      firstWinBonus: data.get("firstWinBonus") === "on",
      taskType: String(data.get("taskType") || "normal")
    };
  }

  function refresh() {
    syncFirstWinBonusLabel();
    const input = readInput();
    const mutationDifficulty = mapDifficultyToMutationDifficulty(input.difficulty);
    const mutationReward = getMutationAccumulatedReward(mutationDifficulty);
    const result = calculateXp(input, mutationReward);
    renderResult(resultEl, result);
  }

  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  refresh();
})();

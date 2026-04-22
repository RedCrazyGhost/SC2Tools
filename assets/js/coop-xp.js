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
    },
    commanderLevels: {
      cumulativeAtLevel: {
        1: 0,
        2: 20000,
        3: 60000,
        4: 105000,
        5: 155000,
        6: 210000,
        7: 270000,
        8: 337500,
        9: 412500,
        10: 495000,
        11: 585000,
        12: 685000,
        13: 795000,
        14: 915000,
        15: 1045000
      },
      xpToNextLevel: {
        1: 20000,
        2: 40000,
        3: 45000,
        4: 50000,
        5: 55000,
        6: 60000,
        7: 67500,
        8: 75000,
        9: 82500,
        10: 90000,
        11: 100000,
        12: 110000,
        13: 120000,
        14: 130000,
        15: 0
      }
    },
    mastery: {
      xpToNextLevel: {
        0: 5000,
        1: 20000,
        2: 20500,
        3: 21000,
        4: 21500,
        5: 22000,
        6: 22500,
        7: 23000,
        8: 24000,
        9: 25000,
        10: 26000,
        11: 27000,
        12: 28000,
        13: 30000,
        14: 32000,
        15: 34000,
        16: 36000,
        17: 38000,
        18: 41000,
        19: 44000,
        20: 47000,
        21: 50000,
        22: 54000,
        23: 58000,
        24: 62000,
        25: 66000,
        26: 71000,
        27: 76000,
        28: 81000,
        29: 86000,
        30: 89000,
        31: 92000,
        32: 95000,
        33: 99000,
        34: 103000,
        35: 107000,
        36: 111000,
        37: 115000,
        38: 119000,
        39: 123000,
        40: 127000,
        41: 131000,
        42: 135000,
        43: 139000,
        44: 143000,
        45: 147000,
        46: 151000,
        47: 155000,
        48: 160000,
        49: 165000,
        50: 170000,
        51: 175000,
        52: 180000,
        53: 185000,
        54: 191000,
        55: 197000,
        56: 203000,
        57: 209000,
        58: 215000,
        59: 222000,
        60: 229000,
        61: 236000,
        62: 243000,
        63: 250000,
        64: 258000,
        65: 266000,
        66: 274000,
        67: 282000,
        68: 290000,
        69: 299000,
        70: 308000,
        71: 317000,
        72: 326000,
        73: 335000,
        74: 345000,
        75: 355000,
        76: 365000,
        77: 375000,
        78: 385000,
        79: 395000,
        80: 415000,
        81: 445000,
        82: 485000,
        83: 535000,
        84: 595000,
        85: 665000,
        86: 745000,
        87: 835000,
        88: 935000,
        89: 1035000
      },
      ascensionPerLevelXp: 200000
    }
  };

  function toPercentText(value) {
    return `${Math.round(value * 100)}%`;
  }

  function calculateXp(input) {
    const base = XP_CONFIG.baseXp + XP_CONFIG.objectiveXp;
    const diffBonus = XP_CONFIG.difficultyBonus[input.difficulty] || 0;
    const randomBonus = input.randomMapBonus ? XP_CONFIG.randomMapBonus : 0;
    const firstWin = input.firstWinBonus ? XP_CONFIG.firstWinFlatBonus : 0;

    const core = base * (1 + diffBonus + randomBonus);
    const total = Math.round(core + firstWin);

    return {
      total,
      breakdown: {
        baseXp: XP_CONFIG.baseXp,
        objectiveXp: XP_CONFIG.objectiveXp,
        subtotal: base,
        diffBonus,
        randomBonus,
        firstWin
      }
    };
  }

  function calculateMutationReward(difficulty) {
    return XP_CONFIG.mutationReward[difficulty] || 0;
  }

  function renderResult(target, result) {
    target.innerHTML = [
      `<p><strong>每局经验：</strong>${result.total.toLocaleString()}</p>`,
      "<ul>",
      `<li>基础经验：${result.breakdown.baseXp.toLocaleString()}</li>`,
      `<li>奖励目标经验：${result.breakdown.objectiveXp.toLocaleString()}</li>`,
      `<li>基础合计：${result.breakdown.subtotal.toLocaleString()}</li>`,
      `<li>难度加成：${toPercentText(result.breakdown.diffBonus)}</li>`,
      `<li>随机地图加成：${toPercentText(result.breakdown.randomBonus)}</li>`,
      `<li>首胜经验：${result.breakdown.firstWin.toLocaleString()}</li>`,
      "</ul>"
    ].join("");
  }

  function renderMutationResult(target, reward) {
    target.innerHTML = `<p><strong>每周突变奖励：</strong>${reward.toLocaleString()}</p>`;
  }

  function getDifficultyLabel(value) {
    const map = {
      casual: "休闲",
      normal: "普通",
      hard: "困难",
      brutal: "残酷",
      brutal1: "残酷+1",
      brutal2: "残酷+2",
      brutal3: "残酷+3",
      brutal4: "残酷+4",
      brutal5: "残酷+5",
      brutal6: "残酷+6"
    };
    return map[value] || value;
  }

  function getMutationLabel(value) {
    const map = {
      casual: "休闲",
      normal: "普通",
      hard: "困难",
      savage: "野蛮"
    };
    return map[value] || value;
  }

  function summarize(input, result) {
    return [
      "SC2合作模式经验计算结果",
      `难度: ${getDifficultyLabel(input.difficulty)}`,
      `随机地图: ${input.randomMapBonus ? "是" : "否"}`,
      `每日首胜: ${input.firstWinBonus ? "是" : "否"}`,
      `每局经验: ${result.total}`
    ].join("\n");
  }

  const form = document.getElementById("xp-form");
  const resultEl = document.getElementById("xp-result");
  const modeCommanderBtn = document.getElementById("mode-commander-btn");
  const modeMasteryBtn = document.getElementById("mode-mastery-btn");
  const modeSections = document.querySelectorAll("[data-mode-section]");
  const mutationForm = document.getElementById("mutation-form");
  const mutationResultEl = document.getElementById("mutation-result");
  const levelingForm = document.getElementById("leveling-form");
  const levelingResultEl = document.getElementById("leveling-result");
  const masteryForm = document.getElementById("mastery-form");
  const masteryResultEl = document.getElementById("mastery-result");
  if (
    !form ||
    !resultEl ||
    !modeCommanderBtn ||
    !modeMasteryBtn ||
    !mutationForm ||
    !mutationResultEl ||
    !levelingForm ||
    !levelingResultEl ||
    !masteryForm ||
    !masteryResultEl
  ) {
    return;
  }

  function readInput() {
    const data = new FormData(form);
    return {
      difficulty: String(data.get("difficulty") || "casual"),
      randomMapBonus: data.get("randomMapBonus") === "on",
      firstWinBonus: data.get("firstWinBonus") === "on"
    };
  }

  function readMutationInput() {
    const data = new FormData(mutationForm);
    return {
      mutationDifficulty: String(data.get("mutationDifficulty") || "casual")
    };
  }

  function readLevelingInput() {
    const data = new FormData(levelingForm);
    return {
      startLevel: Number(data.get("startLevel") || 1),
      startLevelXp: Number(data.get("startLevelXp") || 0),
      targetLevel: Number(data.get("targetLevel") || 15),
      targetLevelXp: Number(data.get("targetLevelXp") || 0)
    };
  }

  function readMasteryInput() {
    const data = new FormData(masteryForm);
    return {
      startLevel: Number(data.get("startMasteryLevel") || 0),
      startLevelXp: Number(data.get("startMasteryXp") || 0),
      targetLevel: Number(data.get("targetMasteryLevel") || 90),
      targetLevelXp: Number(data.get("targetMasteryXp") || 0)
    };
  }

  function getLevelCap(level) {
    return XP_CONFIG.commanderLevels.xpToNextLevel[level] || 0;
  }

  function clampLevel(value) {
    return Math.max(1, Math.min(15, Number(value) || 1));
  }

  function toTotalCommanderXp(level, levelXp) {
    const normalizedLevel = clampLevel(level);
    const levelBase = XP_CONFIG.commanderLevels.cumulativeAtLevel[normalizedLevel] || 0;
    const cap = getLevelCap(normalizedLevel);
    const clampedLevelXp = normalizedLevel >= 15 ? 0 : Math.max(0, Math.min(cap, Number(levelXp) || 0));
    return levelBase + clampedLevelXp;
  }

  function calculateLeveling(levelingInput, perGameXp) {
    const startTotal = toTotalCommanderXp(levelingInput.startLevel, levelingInput.startLevelXp);
    const targetTotal = toTotalCommanderXp(levelingInput.targetLevel, levelingInput.targetLevelXp);
    const neededXp = targetTotal - startTotal;

    if (neededXp <= 0) {
      return {
        neededXp: 0,
        neededGames: 0,
        message: "目标经验不高于当前经验，无需额外对局。"
      };
    }

    const games = Math.ceil(neededXp / Math.max(1, perGameXp));
    return {
      neededXp,
      neededGames: games,
      message: ""
    };
  }

  function renderLevelingResult(target, levelingResult, perGameXp) {
    if (levelingResult.message) {
      target.innerHTML = `<p>${levelingResult.message}</p>`;
      return;
    }
    target.innerHTML = [
      `<p><strong>每局经验（当前设置）：</strong>${perGameXp.toLocaleString()}</p>`,
      `<p><strong>还需经验：</strong>${levelingResult.neededXp.toLocaleString()}</p>`,
      `<p><strong>预计还需对局：</strong>${levelingResult.neededGames.toLocaleString()} 局</p>`
    ].join("");
  }

  function buildFullSummary(
    mode,
    baseInput,
    baseCalc,
    mutationInput,
    mutationReward,
    levelingInput,
    levelingResult,
    masteryInput,
    masteryResult
  ) {
    const rows = [
      summarize(baseInput, baseCalc),
      "",
      `当前模式: ${mode === "mastery" ? "精通经验计算" : "指挥官经验计算"}`
    ];

    if (mode === "mastery") {
      rows.push(
        "",
        "精通/晋升等级对局数估算",
        `起始: ${masteryInput.startLevel}级 + ${masteryInput.startLevelXp}经验`,
        `目标: ${masteryInput.targetLevel}级 + ${masteryInput.targetLevelXp}经验`,
        `还需经验: ${masteryResult.neededXp}`,
        `预计对局: ${masteryResult.neededGames}`
      );
      if (masteryResult.message) {
        rows.push(`说明: ${masteryResult.message}`);
      }
    } else {
      rows.push(
        "",
        "每周突变奖励",
        `难度: ${getMutationLabel(mutationInput.mutationDifficulty)}`,
        `奖励经验: ${mutationReward}`,
        "",
        "指挥官升级对局数估算",
        `起始: ${levelingInput.startLevel}级 + ${levelingInput.startLevelXp}经验`,
        `目标: ${levelingInput.targetLevel}级 + ${levelingInput.targetLevelXp}经验`,
        `还需经验: ${levelingResult.neededXp}`,
        `预计对局: ${levelingResult.neededGames}`
      );
      if (levelingResult.message) {
        rows.push(`说明: ${levelingResult.message}`);
      }
    }
    return rows.join("\n");
  }

  function getMasteryXpToNext(level) {
    if (level >= 90) {
      return XP_CONFIG.mastery.ascensionPerLevelXp;
    }
    return XP_CONFIG.mastery.xpToNextLevel[level] || 0;
  }

  function getMasteryCumulativeAtLevel(level) {
    const lv = Math.max(0, Math.floor(Number(level) || 0));
    let total = 0;
    let current = 0;
    while (current < lv) {
      total += getMasteryXpToNext(current);
      current += 1;
    }
    return total;
  }

  function toTotalMasteryXp(level, levelXp) {
    const lv = Math.max(0, Math.floor(Number(level) || 0));
    const levelBase = getMasteryCumulativeAtLevel(lv);
    const cap = getMasteryXpToNext(lv);
    const clampedXp = Math.max(0, Math.min(cap, Number(levelXp) || 0));
    return levelBase + clampedXp;
  }

  function calculateMasteryLeveling(input, perGameXp) {
    const startTotal = toTotalMasteryXp(input.startLevel, input.startLevelXp);
    const targetTotal = toTotalMasteryXp(input.targetLevel, input.targetLevelXp);
    const neededXp = targetTotal - startTotal;
    if (neededXp <= 0) {
      return {
        neededXp: 0,
        neededGames: 0,
        message: "目标精通/晋升经验不高于当前经验，无需额外对局。"
      };
    }
    return {
      neededXp,
      neededGames: Math.ceil(neededXp / Math.max(1, perGameXp)),
      message: ""
    };
  }

  function onValidationWarning(message) {
    window.alert(message);
  }

  function validateInputs(mode, levelingInput, masteryInput) {
    if (mode === "mastery") {
      const masteryStartCap = getMasteryXpToNext(Math.max(0, Math.floor(masteryInput.startLevel)));
      if (masteryInput.startLevelXp > masteryStartCap) {
        onValidationWarning(`精通/晋升起始等级当前经验不能超过该等级上限（${masteryStartCap.toLocaleString()}）。`);
        return false;
      }
      const masteryTargetCap = getMasteryXpToNext(Math.max(0, Math.floor(masteryInput.targetLevel)));
      if (masteryInput.targetLevelXp > masteryTargetCap) {
        onValidationWarning(`精通/晋升目标等级当前经验不能超过该等级上限（${masteryTargetCap.toLocaleString()}）。`);
        return false;
      }
    } else {
      const levelCap = getLevelCap(clampLevel(levelingInput.startLevel));
      if (clampLevel(levelingInput.startLevel) < 15 && levelingInput.startLevelXp > levelCap) {
        onValidationWarning(`指挥官起始等级当前经验不能超过该等级上限（${levelCap.toLocaleString()}）。`);
        return false;
      }
      const levelTargetCap = getLevelCap(clampLevel(levelingInput.targetLevel));
      if (clampLevel(levelingInput.targetLevel) < 15 && levelingInput.targetLevelXp > levelTargetCap) {
        onValidationWarning(`指挥官目标等级当前经验不能超过该等级上限（${levelTargetCap.toLocaleString()}）。`);
        return false;
      }
    }
    return true;
  }

  function renderMasteryResult(target, masteryResult, perGameXp) {
    if (masteryResult.message) {
      target.innerHTML = `<p>${masteryResult.message}</p>`;
      return;
    }
    target.innerHTML = [
      `<p><strong>每局经验（当前设置）：</strong>${perGameXp.toLocaleString()}</p>`,
      `<p><strong>还需精通/晋升经验：</strong>${masteryResult.neededXp.toLocaleString()}</p>`,
      `<p><strong>预计还需对局：</strong>${masteryResult.neededGames.toLocaleString()} 局</p>`
    ].join("");
  }

  let currentMode = "commander";

  function applyMode(mode) {
    currentMode = mode;
    modeCommanderBtn.setAttribute("aria-pressed", mode === "commander" ? "true" : "false");
    modeMasteryBtn.setAttribute("aria-pressed", mode === "mastery" ? "true" : "false");
    modeSections.forEach(function (section) {
      const sectionMode = section.getAttribute("data-mode-section");
      section.hidden = sectionMode !== mode;
    });
  }

  function refreshAll() {
    const input = readInput();
    const calc = calculateXp(input);

    const mutationInput = readMutationInput();
    const mutationReward = calculateMutationReward(mutationInput.mutationDifficulty);

    const levelingInput = readLevelingInput();
    const masteryInput = readMasteryInput();
    if (!validateInputs(currentMode, levelingInput, masteryInput)) {
      return;
    }

    renderResult(resultEl, calc);
    renderMutationResult(mutationResultEl, mutationReward);

    const levelingResult = calculateLeveling(levelingInput, calc.total);
    const masteryResult = calculateMasteryLeveling(masteryInput, calc.total);
    if (currentMode === "mastery") {
      renderMasteryResult(masteryResultEl, masteryResult, calc.total);
    } else {
      renderLevelingResult(levelingResultEl, levelingResult, calc.total);
    }

  }

  form.addEventListener("input", refreshAll);
  form.addEventListener("change", refreshAll);
  mutationForm.addEventListener("input", refreshAll);
  mutationForm.addEventListener("change", refreshAll);
  levelingForm.addEventListener("input", refreshAll);
  levelingForm.addEventListener("change", refreshAll);
  masteryForm.addEventListener("input", refreshAll);
  masteryForm.addEventListener("change", refreshAll);
  modeCommanderBtn.addEventListener("click", function () {
    applyMode("commander");
    refreshAll();
  });
  modeMasteryBtn.addEventListener("click", function () {
    applyMode("mastery");
    refreshAll();
  });
  applyMode("commander");
  refreshAll();
})();

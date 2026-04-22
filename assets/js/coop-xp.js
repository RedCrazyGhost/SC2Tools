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

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h <= 0) {
      return `${m}分钟`;
    }
    return `${h}小时${m}分钟`;
  }

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

  function getMonthLabel(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }

  function clampViewDate(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
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

  function calculatePerGameXpByConfig(difficulty, randomMapBonus) {
    const base = XP_CONFIG.baseXp + XP_CONFIG.objectiveXp;
    const diffBonus = XP_CONFIG.difficultyBonus[difficulty] || 0;
    const randomBonus = randomMapBonus ? XP_CONFIG.randomMapBonus : 0;
    return Math.round(base * (1 + diffBonus + randomBonus));
  }

  function calculateMutationReward(difficulty) {
    return XP_CONFIG.mutationReward[difficulty] || 0;
  }

  function mapDifficultyToMutationDifficulty(difficulty) {
    if (difficulty === "casual") return "casual";
    if (difficulty === "normal") return "normal";
    if (difficulty === "hard") return "hard";
    return "savage";
  }

  function renderResult(target, result) {
    const firstWinText = result.taskType === "mutation" ? "每周首胜经验" : "每日首胜经验";
    target.innerHTML = [
      `<p><strong>每局经验：</strong>${result.total.toLocaleString()}</p>`,
      "<ul>",
      `<li>基础经验：${result.breakdown.baseXp.toLocaleString()}</li>`,
      `<li>奖励目标经验：${result.breakdown.objectiveXp.toLocaleString()}</li>`,
      `<li>基础合计：${result.breakdown.subtotal.toLocaleString()}</li>`,
      `<li>难度加成：${toPercentText(result.breakdown.diffBonus)}</li>`,
      `<li>随机地图加成：${toPercentText(result.breakdown.randomBonus)}</li>`,
      `<li>${firstWinText}：${result.breakdown.firstWin.toLocaleString()}</li>`,
      `<li>突变奖励：${result.breakdown.mutationBonus.toLocaleString()}</li>`,
      "</ul>"
    ].join("");
  }

  const form = document.getElementById("xp-form");
  const resultEl = document.getElementById("xp-result");
  const firstWinBonusLabel = document.getElementById("first-win-bonus-label");
  const modeCommanderBtn = document.getElementById("mode-commander-btn");
  const modeMasteryBtn = document.getElementById("mode-mastery-btn");
  const modeSections = document.querySelectorAll("[data-mode-section]");
  const levelingForm = document.getElementById("leveling-form");
  const levelingResultEl = document.getElementById("leveling-result");
  const masteryForm = document.getElementById("mastery-form");
  const masteryResultEl = document.getElementById("mastery-result");
  const scheduleForm = document.getElementById("schedule-form");
  const generateScheduleBtn = document.getElementById("generate-schedule-btn");
  const scheduleSummaryEl = document.getElementById("schedule-summary");
  const scheduleListEl = document.getElementById("schedule-list");
  const calendarEditorModal = document.getElementById("calendar-editor-modal");
  const calendarEditorForm = document.getElementById("calendar-editor-form");
  const calendarEditorSaveBtn = document.getElementById("calendar-editor-save-btn");
  const calendarEditorDeleteBtn = document.getElementById("calendar-editor-delete-btn");
  const calendarEditorCancelBtn = document.getElementById("calendar-editor-cancel-btn");
  const calendarBulkModal = document.getElementById("calendar-bulk-modal");
  const calendarBulkForm = document.getElementById("calendar-bulk-form");
  const calendarBulkSaveBtn = document.getElementById("calendar-bulk-save-btn");
  const calendarBulkCancelBtn = document.getElementById("calendar-bulk-cancel-btn");
  const calendarBulkAddBtn = document.getElementById("calendar-bulk-add-btn");
  const calendarClearBtn = document.getElementById("calendar-clear-btn");
  const calendarPrevMonthBtn = document.getElementById("calendar-prev-month-btn");
  const calendarNextMonthBtn = document.getElementById("calendar-next-month-btn");
  const calendarTodayBtn = document.getElementById("calendar-today-btn");
  const calendarToolbarNav = document.querySelector(".calendar-toolbar-nav");

  if (
    !form ||
    !resultEl ||
    !firstWinBonusLabel ||
    !modeCommanderBtn ||
    !modeMasteryBtn ||
    !levelingForm ||
    !levelingResultEl ||
    !masteryForm ||
    !masteryResultEl ||
    !scheduleForm ||
    !generateScheduleBtn ||
    !scheduleSummaryEl ||
    !scheduleListEl ||
    !calendarEditorModal ||
    !calendarEditorForm ||
    !calendarEditorSaveBtn ||
    !calendarEditorDeleteBtn ||
    !calendarEditorCancelBtn ||
    !calendarBulkModal ||
    !calendarBulkForm ||
    !calendarBulkSaveBtn ||
    !calendarBulkCancelBtn ||
    !calendarBulkAddBtn ||
    !calendarClearBtn ||
    !calendarPrevMonthBtn ||
    !calendarNextMonthBtn ||
    !calendarTodayBtn ||
    !calendarToolbarNav
  ) {
    return;
  }

  const scheduleState = {
    generated: false,
    tasks: [],
    targetGames: 0,
    targetMode: "commander",
    mutationRewardPerWeek: 0,
    selectedTaskId: null,
    viewDate: new Date(),
    editorMode: "create",
    editorTaskId: null,
    editorDate: null,
    taskCreationOrder: 0
  };

  const DEFAULT_STAGE_RATIO = {
    open: 20,
    mid: 30,
    finish: 30,
    settle: 20
  };

  const DIFFICULTY_LABELS = {
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

  function syncFirstWinBonusLabel() {
    const taskTypeSelect = form.querySelector('select[name="taskType"]');
    if (!taskTypeSelect) return;
    firstWinBonusLabel.textContent = taskTypeSelect.value === "mutation"
      ? "每周首胜"
      : "每日首胜";
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

  function readMutationInput() {
    const input = readInput();
    return {
      mutationDifficulty: mapDifficultyToMutationDifficulty(input.difficulty)
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

  function readScheduleInput() {
    const data = new FormData(scheduleForm);
    return {
      startDate: String(data.get("startDate") || ""),
      dailyGamesTarget: Math.max(1, Number(data.get("dailyGamesTarget") || 1)),
      includeWeeklyMutation: data.get("includeWeeklyMutation") === "on"
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
      return { neededXp: 0, neededGames: 0, message: "目标经验不高于当前经验，无需额外对局。" };
    }
    return {
      neededXp,
      neededGames: Math.ceil(neededXp / Math.max(1, perGameXp)),
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

  function getMasteryXpToNext(level) {
    if (level >= 90) return XP_CONFIG.mastery.ascensionPerLevelXp;
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
      return { neededXp: 0, neededGames: 0, message: "目标精通/晋升经验不高于当前经验，无需额外对局。" };
    }
    return {
      neededXp,
      neededGames: Math.ceil(neededXp / Math.max(1, perGameXp)),
      message: ""
    };
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

  function onValidationWarning(message) {
    window.alert(message);
  }

  function getWeekStartMonday(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekKey(date) {
    const monday = getWeekStartMonday(date);
    return dateToInput(monday);
  }

  function getMutationAccumulatedReward(selectedDifficulty) {
    const order = ["casual", "normal", "hard", "savage"];
    const idx = order.indexOf(selectedDifficulty);
    if (idx < 0) return 0;
    let total = 0;
    for (let i = 0; i <= idx; i += 1) {
      total += calculateMutationReward(order[i]);
    }
    return total;
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

  function computeTargetData(perGameXp, levelingResult, masteryResult) {
    if (currentMode === "mastery") {
      return {
        mode: "mastery",
        neededXp: masteryResult.neededXp,
        baseNeededGames: masteryResult.neededGames,
        message: masteryResult.message,
        perGameXp
      };
    }
    return {
      mode: "commander",
      neededXp: levelingResult.neededXp,
      baseNeededGames: levelingResult.neededGames,
      message: levelingResult.message,
      perGameXp
    };
  }
  function estimateTaskCount(totalGames, dailyTarget) {
    return Math.max(1, Math.ceil(totalGames / dailyTarget));
  }

  function createTask(date, games, taskType, difficulty, randomMapBonus) {
    scheduleState.taskCreationOrder += 1;
    const normalizedRandomMapBonus = taskType === "mutation" ? false : !!randomMapBonus;
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date,
      games,
      taskType,
      difficulty,
      randomMapBonus: normalizedRandomMapBonus,
      firstWinXp: 0,
      baseXp: 0,
      mutationBonusXp: 0,
      totalXp: 0,
      estimatedMinutes: games * 25,
      creationOrder: scheduleState.taskCreationOrder
    };
  }

  function getSelectedTask() {
    if (!scheduleState.selectedTaskId) return null;
    return scheduleState.tasks.find(function (task) {
      return task.id === scheduleState.selectedTaskId;
    }) || null;
  }

  function fillEditorForm(task) {
    const dateInput = calendarEditorForm.querySelector('input[name="editDate"]');
    const gamesInput = calendarEditorForm.querySelector('input[name="editGames"]');
    const typeSelect = calendarEditorForm.querySelector('select[name="editTaskType"]');
    const difficultySelect = calendarEditorForm.querySelector('select[name="editDifficulty"]');
    const randomCheckbox = calendarEditorForm.querySelector('input[name="editRandomMapBonus"]');
    if (dateInput) dateInput.value = task.date;
    if (gamesInput) gamesInput.value = String(task.games);
    if (typeSelect) typeSelect.value = task.taskType;
    if (difficultySelect) difficultySelect.value = task.difficulty;
    if (randomCheckbox) randomCheckbox.checked = !!task.randomMapBonus;
    syncEditorTaskTypeUi();
  }

  function readEditorFormValue() {
    const data = new FormData(calendarEditorForm);
    const taskType = String(data.get("editTaskType") || "normal");
    return {
      date: parseDateInput(String(data.get("editDate") || "")),
      games: Number(data.get("editGames") || 0),
      taskType,
      difficulty: String(data.get("editDifficulty") || "casual"),
      randomMapBonus: taskType === "mutation" ? false : data.get("editRandomMapBonus") === "on"
    };
  }

  function syncEditorTaskTypeUi() {
    const randomCheckbox = calendarEditorForm.querySelector('input[name="editRandomMapBonus"]');
    if (!randomCheckbox) return;
    randomCheckbox.disabled = false;
  }

  function readBulkFormValue() {
    const data = new FormData(calendarBulkForm);
    return {
      startDate: parseDateInput(String(data.get("bulkStartDate") || "")),
      days: Number(data.get("bulkDays") || 0),
      gamesPerDay: Number(data.get("bulkGamesPerDay") || 0),
      difficulty: String(data.get("bulkDifficulty") || "casual"),
      randomMapBonus: data.get("bulkRandomMapBonus") === "on"
    };
  }

  function openEditorModal(mode, options) {
    scheduleState.editorMode = mode;
    scheduleState.editorTaskId = options?.taskId || null;
    scheduleState.editorDate = options?.date || null;
    if (mode === "edit") {
      const selected = scheduleState.tasks.find(function (task) { return task.id === scheduleState.editorTaskId; });
      if (!selected) return;
      fillEditorForm(selected);
      calendarEditorDeleteBtn.hidden = false;
    } else {
      const dateText = options?.date ? dateToInput(options.date) : dateToInput(new Date());
      fillEditorForm({
        date: dateText,
        games: 1,
        taskType: "normal",
        difficulty: "casual",
        randomMapBonus: false
      });
      calendarEditorDeleteBtn.hidden = true;
    }
    calendarEditorModal.hidden = false;
    const firstInput = calendarEditorForm.querySelector('input[name="editDate"]');
    if (firstInput instanceof HTMLElement) firstInput.focus();
  }

  function closeEditorModal() {
    calendarEditorModal.hidden = true;
    scheduleState.editorTaskId = null;
    scheduleState.editorDate = null;
  }

  function openBulkModal(defaultDate) {
    const startDateInput = calendarBulkForm.querySelector('input[name="bulkStartDate"]');
    if (startDateInput) {
      startDateInput.value = dateToInput(defaultDate || new Date());
    }
    calendarBulkModal.hidden = false;
  }

  function closeBulkModal() {
    calendarBulkModal.hidden = true;
  }

  function distributeTemplateTasks(startDate, totalGames, dailyTarget, difficulty, randomMapBonus) {
    if (totalGames <= 0) return [];
    const days = estimateTaskCount(totalGames, dailyTarget);
    const base = Math.floor(totalGames / days);
    const remainder = totalGames % days;
    const tasks = [];
    for (let i = 0; i < days; i += 1) {
      const games = base + (i < remainder ? 1 : 0);
      const date = dateToInput(addDays(startDate, i));
      tasks.push(createTask(date, games, "normal", difficulty, randomMapBonus));
    }
    return tasks;
  }

  function recalculateTaskDetails(tasks, ratio, mutationRewardPerWeek) {
    const sorted = [...tasks].sort(function (a, b) {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.creationOrder || 0) - (b.creationOrder || 0);
    });
    const weekRewardTriggered = new Set();
    const dayFirstWinTriggered = new Set();
    return sorted.map(function (task) {
      const weekKey = getWeekKey(parseDateInput(task.date));
      const taskCopy = { ...task };
      if (taskCopy.taskType === "mutation") {
        taskCopy.randomMapBonus = false;
      }
      const includeFirstWin = !dayFirstWinTriggered.has(taskCopy.date);
      const perGameXp = calculatePerGameXpByConfig(taskCopy.difficulty || "casual", !!taskCopy.randomMapBonus);
      taskCopy.firstWinXp = includeFirstWin ? XP_CONFIG.firstWinFlatBonus : 0;
      taskCopy.coreXp = taskCopy.games * perGameXp;
      taskCopy.baseXp = taskCopy.coreXp + taskCopy.firstWinXp;
      if (includeFirstWin) {
        dayFirstWinTriggered.add(taskCopy.date);
      }
      taskCopy.mutationBonusXp = 0;
      if (taskCopy.taskType === "mutation" && !weekRewardTriggered.has(weekKey)) {
        taskCopy.mutationBonusXp = mutationRewardPerWeek;
        weekRewardTriggered.add(weekKey);
      }
      taskCopy.totalXp = taskCopy.baseXp + taskCopy.mutationBonusXp;
      taskCopy.estimatedMinutes = taskCopy.games * 25;
      return taskCopy;
    });
  }

  function buildDaySummaries(tasks) {
    const map = new Map();
    tasks.forEach(function (task) {
      const current = map.get(task.date) || {
        date: task.date,
        totalGames: 0,
        totalMinutes: 0,
        baseXp: 0,
        mutationBonusXp: 0,
        totalXp: 0,
        tasks: []
      };
      current.totalGames += task.games;
      current.totalMinutes += task.estimatedMinutes;
      current.baseXp += task.baseXp;
      current.mutationBonusXp += task.mutationBonusXp;
      current.totalXp += task.totalXp;
      current.tasks.push(task);
      map.set(task.date, current);
    });
    return map;
  }

  function renderScheduleList() {
    const dayMap = buildDaySummaries(scheduleState.tasks);
    let monthCursor = clampViewDate(scheduleState.viewDate);
    const endMonth = clampViewDate(scheduleState.viewDate);
    const weekdayNames = ["一", "二", "三", "四", "五", "六", "日"];
    const monthBlocks = [];
    const todayKey = dateToInput(new Date());

    while (monthCursor.getTime() <= endMonth.getTime()) {
      const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
      const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
      const padBefore = (monthStart.getDay() + 6) % 7;
      const totalDays = monthEnd.getDate();
      const totalCells = Math.ceil((padBefore + totalDays) / 7) * 7;
      const weekBlocks = [];
      for (let weekIdx = 0; weekIdx < totalCells / 7; weekIdx += 1) {
        const weekCells = [];
        const weekStartDate = addDays(monthStart, weekIdx * 7 - padBefore);
        const weekEndDate = addDays(weekStartDate, 6);
        let weekBonusXp = 0;
        for (let d = 0; d < 7; d += 1) {
          const current = addDays(weekStartDate, d);
          const dayNum = current.getDate();
          const isCurrentMonth = current.getMonth() === monthCursor.getMonth();
          const key = dateToInput(current);
          const summary = dayMap.get(key);
          if (!isCurrentMonth) {
            weekCells.push('<div class="calendar-cell empty"></div>');
            continue;
          }
          if (!summary) {
            const dayLabel = key === todayKey
              ? `<div class="calendar-day">${dayNum}<span class="calendar-day-star" aria-label="今天" title="今天">★</span></div>`
              : `<div class="calendar-day">${dayNum}</div>`;
            weekCells.push([
              '<div class="calendar-cell">',
              dayLabel,
              `<button type="button" class="calendar-cell-add-btn" data-add-date="${key}">+</button>`,
              "</div>"
            ].join(""));
            continue;
          }
          weekBonusXp += summary.mutationBonusXp;
          const taskTags = summary.tasks.map(function (task) {
            const typeText = task.taskType === "mutation" ? "突变" : "普通";
            const difficultyText = DIFFICULTY_LABELS[task.difficulty] || "未知";
            const randomText = task.randomMapBonus ? "随机" : "固定";
            const selectedCls = task.id === scheduleState.selectedTaskId ? " selected" : "";
            const firstWinText = task.firstWinXp > 0 ? ` + 首胜 ${task.firstWinXp.toLocaleString()}` : "";
            const mutationText = task.mutationBonusXp > 0 ? ` + 突变 ${task.mutationBonusXp.toLocaleString()}` : "";
            const titleText = `${typeText}/${difficultyText}/${randomText} ${task.games}局`;
            return [
              `<div class="task-chip${selectedCls}" data-select-id="${task.id}">`,
              `<div class="task-chip-content">`,
              `<div class="task-chip-title">${titleText}</div>`,
              `<div class="task-chip-xp">经验 ${task.coreXp.toLocaleString()}${firstWinText}${mutationText} = ${task.totalXp.toLocaleString()}</div>`,
              "</div>",
              `<button type="button" class="task-chip-gear-btn" data-edit-id="${task.id}" aria-label="编辑任务">⚙</button>`,
              "</div>"
            ].join("");
          }).join("");
          const dayLabel = key === todayKey
            ? `<div class="calendar-day">${dayNum}<span class="calendar-day-star" aria-label="今天" title="今天">★</span></div>`
            : `<div class="calendar-day">${dayNum}</div>`;
          weekCells.push([
            '<div class="calendar-cell has-plan">',
            dayLabel,
            `<button type="button" class="calendar-cell-add-btn" data-add-date="${key}">+</button>`,
            `<div class="calendar-games">${summary.totalGames} 局</div>`,
            `<div class="calendar-time">${formatDuration(summary.totalMinutes)}</div>`,
            `<div class="calendar-xp">基础 ${summary.baseXp.toLocaleString()} + 突变 ${summary.mutationBonusXp.toLocaleString()} = ${summary.totalXp.toLocaleString()}</div>`,
            `<div class="task-chip-list">${taskTags}</div>`,
            "</div>"
          ].join(""));
        }
        const banner = weekBonusXp > 0
          ? `<div class="calendar-week-mutation">${dateToInput(weekStartDate)} 至 ${dateToInput(weekEndDate)} 突变周奖励 +${weekBonusXp.toLocaleString()} 经验</div>`
          : "";
        weekBlocks.push([
          '<div class="calendar-week-block">',
          banner,
          `<div class="calendar-grid week-grid">${weekCells.join("")}</div>`,
          "</div>"
        ].join(""));
      }
      monthBlocks.push([
        '<section class="calendar-month">',
        '<div class="calendar-month-head">',
        `<h4 class="calendar-title">${getMonthLabel(monthStart)}</h4>`,
        '<div class="calendar-nav-slot"></div>',
        '</div>',
        `<div class="calendar-weekdays">${weekdayNames.map(function (n) { return `<div class="calendar-weekday">${n}</div>`; }).join("")}</div>`,
        `<div class="calendar-weeks">${weekBlocks.join("")}</div>`,
        "</section>"
      ].join(""));
      monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    }
    scheduleListEl.innerHTML = monthBlocks.join("");
    const navSlot = scheduleListEl.querySelector(".calendar-nav-slot");
    if (navSlot && calendarToolbarNav.parentElement !== navSlot) {
      navSlot.appendChild(calendarToolbarNav);
    }
  }

  function renderScheduleSummary(targetData) {
    if (!scheduleState.generated) {
      scheduleSummaryEl.innerHTML = "<p>填写参数并点击“自动规划”。</p>";
      return;
    }
    const totalGames = scheduleState.tasks.reduce(function (sum, t) { return sum + t.games; }, 0);
    const totalMinutes = scheduleState.tasks.reduce(function (sum, t) { return sum + t.estimatedMinutes; }, 0);
    const totalXp = scheduleState.tasks.reduce(function (sum, t) { return sum + t.totalXp; }, 0);
    const totalMutationBonus = scheduleState.tasks.reduce(function (sum, t) { return sum + t.mutationBonusXp; }, 0);
    const diff = totalGames - scheduleState.targetGames;
    const diffText = diff === 0
      ? '<span class="ok-text">计划局数与目标一致</span>'
      : `<span class="warn-text">计划与目标差值：${diff > 0 ? "+" : ""}${diff} 局</span>`;
    scheduleSummaryEl.innerHTML = [
      `<p><strong>当前模式：</strong>${targetData.mode === "mastery" ? "精通经验计算" : "指挥官经验计算"}</p>`,
      `<p><strong>目标局数：</strong>${scheduleState.targetGames.toLocaleString()} 局</p>`,
      `<p><strong>当前计划局数：</strong>${totalGames.toLocaleString()} 局</p>`,
      `<p><strong>当前计划总时长：</strong>${formatDuration(totalMinutes)}</p>`,
      `<p><strong>当前计划总经验：</strong>${totalXp.toLocaleString()}（含突变奖励 ${totalMutationBonus.toLocaleString()}）</p>`,
      `<p>${diffText}</p>`
    ].join("");
  }

  function gatherCurrentContext() {
    const input = readInput();
    const mutationInput = readMutationInput();
    const mutationReward = getMutationAccumulatedReward(mutationInput.mutationDifficulty);
    const calc = calculateXp(input, mutationReward);
    const levelingInput = readLevelingInput();
    const masteryInput = readMasteryInput();
    if (!validateInputs(currentMode, levelingInput, masteryInput)) {
      return null;
    }
    const levelingResult = calculateLeveling(levelingInput, calc.total);
    const masteryResult = calculateMasteryLeveling(masteryInput, calc.total);
    return {
      calc,
      mutationReward,
      targetData: computeTargetData(calc.total, levelingResult, masteryResult),
      levelingResult,
      masteryResult
    };
  }

  function generateSchedule() {
    const context = gatherCurrentContext();
    if (!context) return;
    const scheduleInput = readScheduleInput();
    const ratio = DEFAULT_STAGE_RATIO;
    const startDate = parseDateInput(scheduleInput.startDate);
    if (!startDate) {
      window.alert("请选择有效的开始日期。");
      return;
    }
    if (context.targetData.message) {
      scheduleState.generated = true;
      scheduleState.tasks = [];
      scheduleState.targetGames = 0;
      scheduleState.mutationRewardPerWeek = 0;
      scheduleState.selectedTaskId = null;
      renderScheduleSummary(context.targetData);
      renderScheduleList();
      return;
    }
    scheduleState.generated = true;
    scheduleState.targetMode = currentMode;
    scheduleState.targetGames = context.targetData.baseNeededGames;
    const scheduleContextInput = readInput();
    scheduleState.mutationRewardPerWeek = scheduleInput.includeWeeklyMutation
      ? getMutationAccumulatedReward(readMutationInput().mutationDifficulty)
      : 0;
    scheduleState.tasks = distributeTemplateTasks(
      startDate,
      context.targetData.baseNeededGames,
      scheduleInput.dailyGamesTarget,
      scheduleContextInput.difficulty,
      scheduleContextInput.randomMapBonus
    );
    scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, ratio, scheduleState.mutationRewardPerWeek);
    scheduleState.selectedTaskId = null;
    scheduleState.viewDate = clampViewDate(startDate);
    renderScheduleSummary(context.targetData);
    renderScheduleList();
  }

  function saveTaskFromEditor() {
    if (!scheduleState.generated) {
      window.alert("请先自动规划。");
      return;
    }
    const value = readEditorFormValue();
    if (!value.date) {
      window.alert("请选择有效的计划日期。");
      return;
    }
    if (!Number.isFinite(value.games) || value.games <= 0) {
      window.alert("局数必须大于0。");
      return;
    }
    if (scheduleState.editorMode === "edit" && scheduleState.editorTaskId) {
      const target = scheduleState.tasks.find(function (task) { return task.id === scheduleState.editorTaskId; });
      if (target) {
        target.date = dateToInput(value.date);
        target.games = Math.floor(value.games);
        target.taskType = value.taskType;
        target.difficulty = value.difficulty;
        target.randomMapBonus = value.randomMapBonus;
        scheduleState.selectedTaskId = target.id;
      }
    } else {
      const task = createTask(
        dateToInput(value.date),
        Math.floor(value.games),
        value.taskType,
        value.difficulty,
        value.randomMapBonus
      );
      scheduleState.tasks.push(task);
      scheduleState.selectedTaskId = task.id;
    }
    scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, DEFAULT_STAGE_RATIO, scheduleState.mutationRewardPerWeek);
    const context = gatherCurrentContext();
    if (context) {
      renderScheduleSummary(context.targetData);
    }
    scheduleState.viewDate = clampViewDate(value.date);
    closeEditorModal();
    renderScheduleList();
  }

  function removeTaskById(taskId) {
    const ratio = DEFAULT_STAGE_RATIO;
    scheduleState.tasks = scheduleState.tasks.filter(function (task) {
      return task.id !== taskId;
    });
    if (scheduleState.selectedTaskId === taskId) {
      scheduleState.selectedTaskId = null;
    }
    scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, ratio, scheduleState.mutationRewardPerWeek);
    const context = gatherCurrentContext();
    if (context) {
      renderScheduleSummary(context.targetData);
    }
    renderScheduleList();
  }

  function saveBulkTasks() {
    if (!scheduleState.generated) {
      window.alert("请先自动规划。");
      return;
    }
    const value = readBulkFormValue();
    if (!value.startDate) {
      window.alert("请选择有效的开始日期。");
      return;
    }
    if (!Number.isFinite(value.days) || value.days <= 0) {
      window.alert("连续天数必须大于0。");
      return;
    }
    if (!Number.isFinite(value.gamesPerDay) || value.gamesPerDay <= 0) {
      window.alert("每日局数必须大于0。");
      return;
    }
    for (let i = 0; i < Math.floor(value.days); i += 1) {
      const date = dateToInput(addDays(value.startDate, i));
      scheduleState.tasks.push(
        createTask(date, Math.floor(value.gamesPerDay), "normal", value.difficulty, value.randomMapBonus)
      );
    }
    scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, DEFAULT_STAGE_RATIO, scheduleState.mutationRewardPerWeek);
    scheduleState.viewDate = clampViewDate(value.startDate);
    const context = gatherCurrentContext();
    if (context) {
      renderScheduleSummary(context.targetData);
    }
    closeBulkModal();
    renderScheduleList();
  }

  function deleteTaskFromEditor() {
    if (scheduleState.editorMode !== "edit" || !scheduleState.editorTaskId) return;
    removeTaskById(scheduleState.editorTaskId);
    closeEditorModal();
  }

  function refreshAll() {
    syncFirstWinBonusLabel();
    const context = gatherCurrentContext();
    if (!context) return;
    renderResult(resultEl, context.calc);
    if (currentMode === "mastery") {
      renderMasteryResult(masteryResultEl, context.masteryResult, context.calc.total);
    } else {
      renderLevelingResult(levelingResultEl, context.levelingResult, context.calc.total);
    }
    if (scheduleState.generated) {
      scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, DEFAULT_STAGE_RATIO, scheduleState.mutationRewardPerWeek);
      renderScheduleSummary(context.targetData);
      renderScheduleList();
    } else {
      renderScheduleSummary(context.targetData);
      renderScheduleList();
    }
  }

  function selectTask(taskId) {
    const exists = scheduleState.tasks.some(function (task) { return task.id === taskId; });
    scheduleState.selectedTaskId = exists ? taskId : null;
    const selected = getSelectedTask();
    if (selected) {
      const parsed = parseDateInput(selected.date);
      if (parsed) {
        scheduleState.viewDate = clampViewDate(parsed);
      }
      openEditorModal("edit", { taskId: selected.id });
      return;
    }
    renderScheduleList();
  }

  function clearAllTasks() {
    scheduleState.tasks = [];
    scheduleState.generated = false;
    scheduleState.selectedTaskId = null;
    refreshAll();
  }

  function shiftViewMonth(delta) {
    scheduleState.viewDate = clampViewDate(new Date(scheduleState.viewDate.getFullYear(), scheduleState.viewDate.getMonth() + delta, 1));
    renderScheduleList();
  }

  function goToday() {
    scheduleState.viewDate = clampViewDate(new Date());
    renderScheduleList();
  }

  form.addEventListener("input", refreshAll);
  form.addEventListener("change", refreshAll);
  levelingForm.addEventListener("input", refreshAll);
  levelingForm.addEventListener("change", refreshAll);
  masteryForm.addEventListener("input", refreshAll);
  masteryForm.addEventListener("change", refreshAll);
  scheduleForm.addEventListener("input", function () {
    if (scheduleState.generated) {
      refreshAll();
    }
  });
  generateScheduleBtn.addEventListener("click", generateSchedule);
  calendarBulkAddBtn.addEventListener("click", function () {
    openBulkModal(scheduleState.viewDate);
  });
  calendarClearBtn.addEventListener("click", function () {
    const ok = window.confirm("确认删除全部计划？此操作不可撤销。");
    if (!ok) return;
    clearAllTasks();
  });
  calendarPrevMonthBtn.addEventListener("click", function () {
    shiftViewMonth(-1);
  });
  calendarNextMonthBtn.addEventListener("click", function () {
    shiftViewMonth(1);
  });
  calendarTodayBtn.addEventListener("click", function () {
    goToday();
  });
  calendarEditorSaveBtn.addEventListener("click", function () {
    saveTaskFromEditor();
  });
  calendarEditorForm.addEventListener("change", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("name") === "editTaskType") {
      syncEditorTaskTypeUi();
    }
  });
  calendarEditorDeleteBtn.addEventListener("click", function () {
    deleteTaskFromEditor();
  });
  calendarEditorCancelBtn.addEventListener("click", function () {
    closeEditorModal();
  });
  calendarBulkSaveBtn.addEventListener("click", function () {
    saveBulkTasks();
  });
  calendarBulkCancelBtn.addEventListener("click", function () {
    closeBulkModal();
  });
  calendarEditorModal.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-close-modal") === "true") {
      closeEditorModal();
    }
  });
  calendarBulkModal.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-close-bulk-modal") === "true") {
      closeBulkModal();
    }
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !calendarEditorModal.hidden) {
      closeEditorModal();
    }
    if (event.key === "Escape" && !calendarBulkModal.hidden) {
      closeBulkModal();
    }
  });
  scheduleListEl.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const addDate = target.getAttribute("data-add-date");
    if (addDate) {
      const parsed = parseDateInput(addDate);
      openEditorModal("create", { date: parsed || scheduleState.viewDate });
      return;
    }
    const selectId = target.getAttribute("data-select-id") || target.closest("[data-select-id]")?.getAttribute("data-select-id");
    if (selectId) {
      selectTask(selectId);
      return;
    }
    const editId = target.getAttribute("data-edit-id") || target.closest("[data-edit-id]")?.getAttribute("data-edit-id");
    if (editId) {
      openEditorModal("edit", { taskId: editId });
    }
  });
  modeCommanderBtn.addEventListener("click", function () {
    applyMode("commander");
    refreshAll();
  });
  modeMasteryBtn.addEventListener("click", function () {
    applyMode("mastery");
    refreshAll();
  });

  const startDateInput = scheduleForm.querySelector('input[name="startDate"]');
  if (startDateInput && !startDateInput.value) {
    startDateInput.value = dateToInput(new Date());
  }

  scheduleState.viewDate = clampViewDate(new Date());
  applyMode("commander");
  syncFirstWinBonusLabel();
  refreshAll();
})();

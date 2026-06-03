(function () {
  "use strict";

  const infra = window.SC2CoopXpInfra;
  const domain = window.SC2CoopXpDomain;
  if (!infra || !domain) {
    return;
  }
  const {
    trackAnalyticsEvent,
    t,
    formatXp,
    toPercentText,
    formatGamesCount,
    formatDuration,
    createDebouncer
  } = infra;
  const {
    parseDateInput,
    dateToInput,
    addDays,
    getMonthKey,
    clampViewDate,
    mapDifficultyToMutationDifficulty
  } = domain;

  const XP_CONFIG = window.SC2XPData;
  if (!XP_CONFIG) {
    return;
  }
  const MASTERY_MAX_LEVEL = 1000;
  const masteryCumulativeCache = [0];

  function getMonthLabel(date) {
    return t("calendar.monthLabel").replace("{year}", String(date.getFullYear())).replace("{month}", String(date.getMonth() + 1));
  }

  function calculateXp(input, mutationReward) {
    return domain.calculateXp(input, mutationReward, XP_CONFIG);
  }

  function calculatePerGameXpByConfig(difficulty, randomMapBonus) {
    return domain.calculatePerGameXpByConfig(difficulty, randomMapBonus, XP_CONFIG);
  }

  function calculateMutationReward(difficulty) {
    return domain.calculateMutationReward(difficulty, XP_CONFIG);
  }

  function renderResult(target, result) {
    const firstWinText = result.taskType === "mutation"
      ? t("single.result.firstwin.weekly")
      : t("single.result.firstwin.daily");
    target.innerHTML = [
      `<p><strong>${t("single.result.total")}</strong>${formatXp(result.total)}</p>`,
      "<ul>",
      `<li>${t("single.result.base")}${formatXp(result.breakdown.baseXp)}</li>`,
      `<li>${t("single.result.objective")}${formatXp(result.breakdown.objectiveXp)}</li>`,
      `<li>${t("single.result.subtotal")}${formatXp(result.breakdown.subtotal)}</li>`,
      `<li>${t("single.result.diff")}${toPercentText(result.breakdown.diffBonus)}</li>`,
      `<li>${t("single.result.random")}${toPercentText(result.breakdown.randomBonus)}</li>`,
      `<li>${firstWinText}：${formatXp(result.breakdown.firstWin)}</li>`,
      `<li>${t("single.result.mutation")}${formatXp(result.breakdown.mutationBonus)}</li>`,
      "</ul>"
    ].join("");
  }

  const modeCommanderBtn = document.getElementById("mode-commander-btn");
  const modeMasteryBtn = document.getElementById("mode-mastery-btn");
  const modeSections = document.querySelectorAll("[data-mode-section]");
  const levelingForm = document.getElementById("leveling-form");
  const levelingResultEl = document.getElementById("leveling-result");
  const masteryForm = document.getElementById("mastery-form");
  const masteryResultEl = document.getElementById("mastery-result");
  const commanderRangeRoot = document.querySelector('[data-dual-range="commander"]');
  const masteryRangeRoot = document.querySelector('[data-dual-range="mastery"]');
  const scheduleForm = document.getElementById("schedule-form");
  const scheduleTargetXpInput = scheduleForm ? scheduleForm.querySelector('input[name="targetXp"]') : null;
  const autoPlanBtn = document.getElementById("calendar-auto-plan-btn");
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
  const calendarAutoPlanModal = document.getElementById("calendar-auto-plan-modal");
  const calendarAutoPlanForm = document.getElementById("calendar-auto-plan-form");
  const calendarAutoPlanGenerateBtn = document.getElementById("calendar-auto-plan-generate-btn");
  const calendarAutoPlanCancelBtn = document.getElementById("calendar-auto-plan-cancel-btn");
  const calendarAutoPlanProgressEl = document.getElementById("calendar-auto-plan-progress");
  const calendarAutoPlanProgressLabelEl = document.getElementById("calendar-auto-plan-progress-label");
  const calendarAutoPlanProgressBarEl = document.getElementById("calendar-auto-plan-progress-bar");
  const calendarAutoPlanProgressTrackEl = calendarAutoPlanProgressEl
    ? calendarAutoPlanProgressEl.querySelector(".auto-plan-progress-track")
    : null;
  const calendarExportModal = document.getElementById("calendar-export-modal");
  const calendarExportForm = document.getElementById("calendar-export-form");
  const calendarExportConfirmBtn = document.getElementById("calendar-export-confirm-btn");
  const calendarExportCancelBtn = document.getElementById("calendar-export-cancel-btn");
  const calendarBulkAddBtn = document.getElementById("calendar-bulk-add-btn");
  const calendarExportIcsBtn = document.getElementById("calendar-export-ics-btn");
  const calendarClearBtn = document.getElementById("calendar-clear-btn");
  const calendarPrevMonthBtn = document.getElementById("calendar-prev-month-btn");
  const calendarNextMonthBtn = document.getElementById("calendar-next-month-btn");
  const calendarTodayBtn = document.getElementById("calendar-today-btn");
  const calendarTeamShareBtn = document.getElementById("calendar-team-share-btn");
  const calendarToolbarNav = document.querySelector(".calendar-toolbar-nav");

  if (
    !modeCommanderBtn ||
    !modeMasteryBtn ||
    !levelingForm ||
    !levelingResultEl ||
    !masteryForm ||
    !masteryResultEl ||
    !commanderRangeRoot ||
    !masteryRangeRoot ||
    !scheduleForm ||
    !autoPlanBtn ||
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
    !calendarAutoPlanModal ||
    !calendarAutoPlanForm ||
    !calendarAutoPlanGenerateBtn ||
    !calendarAutoPlanCancelBtn ||
    !calendarAutoPlanProgressEl ||
    !calendarAutoPlanProgressLabelEl ||
    !calendarAutoPlanProgressBarEl ||
    !calendarAutoPlanProgressTrackEl ||
    !calendarExportModal ||
    !calendarExportForm ||
    !calendarExportConfirmBtn ||
    !calendarExportCancelBtn ||
    !calendarBulkAddBtn ||
    !calendarExportIcsBtn ||
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
    targetXp: 0,
    targetSource: "none",
    targetMode: "commander",
    mutationRewardPerWeek: 0,
    autoPlanConfig: {
      difficulty: "casual",
      randomMapBonus: false,
      dailyNormalGames: 3,
      challengeMutation: false,
      mutationDifficulty: "savage"
    },
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

  const AUTO_PLAN_BUILD_WEIGHT = 0.65;
  const AUTO_PLAN_OPTIMIZE_WEIGHT = 0.35;
  const AUTO_PLAN_MAX_BUILD_GUARD = 4000;
  const AUTO_PLAN_MAX_OPTIMIZE_GUARD = 4000;
  const AUTO_PLAN_YIELD_EVERY = 12;

  let autoPlanGenerating = false;

  const DIFFICULTY_I18N_KEYS = {
    casual: "difficulty.casual",
    normal: "difficulty.normal",
    hard: "difficulty.hard",
    brutal: "difficulty.brutal",
    brutal1: "difficulty.brutal1",
    brutal2: "difficulty.brutal2",
    brutal3: "difficulty.brutal3",
    brutal4: "difficulty.brutal4",
    brutal5: "difficulty.brutal5",
    brutal6: "difficulty.brutal6"
  };

  function getDifficultyLabel(difficulty) {
    const key = DIFFICULTY_I18N_KEYS[difficulty];
    return key ? t(key) : difficulty;
  }

  const dualRangeState = {
    suppressRefresh: false,
    commander: createDualRangeController({
      root: commanderRangeRoot,
      mode: "commander"
    }),
    mastery: createDualRangeController({
      root: masteryRangeRoot,
      mode: "mastery"
    })
  };

  let coopExportModulePromise = null;
  const COOP_SCHEDULE_DEBOUNCE_MS = 120;
  const scheduleRefreshDebouncer = createDebouncer(COOP_SCHEDULE_DEBOUNCE_MS);

  function loadCoopExportModule() {
    if (!coopExportModulePromise) {
      coopExportModulePromise = import("./coop-xp-export.js");
    }
    return coopExportModulePromise;
  }

  function buildCalendarIcsTexts() {
    return {
      unknown: t("common.unknown"),
      taskTypeMutation: t("single.option.mutationTask"),
      taskTypeNormal: t("single.option.normalTask"),
      gamesUnit: t("calendar.gamesUnit"),
      randomYes: t("common.yes"),
      randomNo: t("common.no"),
      date: t("coop.field.date"),
      taskType: t("single.form.taskType"),
      difficulty: t("single.form.difficulty"),
      games: t("coop.field.games"),
      randomMapBonus: t("coop.field.randomMapBonus"),
      baseXp: t("single.result.base"),
      firstWinXp: t("single.result.firstwin.daily"),
      mutationBonusXp: t("single.result.mutation"),
      totalXp: t("calendar.summary.totalXp"),
      estimatedDuration: t("calendar.summary.duration"),
      durationMinutes: t("time.minutes"),
      durationHoursMinutes: t("time.hoursMinutes")
    };
  }

  function buildCalendarIcsDifficultyLabels() {
    return Object.keys(DIFFICULTY_I18N_KEYS).reduce(function (acc, key) {
      acc[key] = getDifficultyLabel(key);
      return acc;
    }, {});
  }

  /**
   * 供组队邀请提交：仅传任务与导出参数（JSON），不在请求体中携带整段 ICS。
   * 公开邀请页会据此重算并下载日历。
   */
  window.sc2CoopGetCalendarPlanPayload = function () {
    if (!scheduleState.tasks.length) {
      return null;
    }
    let tasks;
    try {
      tasks = JSON.parse(JSON.stringify(scheduleState.tasks));
    } catch (e) {
      return null;
    }
    const vd =
      scheduleState.viewDate instanceof Date
        ? scheduleState.viewDate.toISOString()
        : String(scheduleState.viewDate || "");
    return {
      tasks,
      export: {
        scope: "all",
        startTime: "20:00",
        viewDate: vd,
        texts: buildCalendarIcsTexts(),
        difficultyLabels: buildCalendarIcsDifficultyLabels()
      }
    };
  };

  function cancelCoopScheduleDebounce() {
    scheduleRefreshDebouncer.cancel();
  }

  function getCommanderMaxTotalXp() {
    return XP_CONFIG.commanderLevels.cumulativeAtLevel[15] || 0;
  }

  function toCommanderLevelXpByTotalXp(totalXp) {
    const maxTotal = getCommanderMaxTotalXp();
    const normalizedTotal = Math.max(0, Math.min(maxTotal, Number(totalXp) || 0));
    if (normalizedTotal >= maxTotal) {
      return { level: 15, levelXp: 0 };
    }
    for (let level = 14; level >= 1; level -= 1) {
      const base = XP_CONFIG.commanderLevels.cumulativeAtLevel[level] || 0;
      if (normalizedTotal >= base) {
        const cap = getLevelCap(level);
        return {
          level,
          levelXp: Math.max(0, Math.min(cap, normalizedTotal - base))
        };
      }
    }
    return { level: 1, levelXp: 0 };
  }

  function toMasteryLevelXpByTotalXp(totalXp) {
    let remaining = Math.max(0, Number(totalXp) || 0);
    let level = 0;
    while (remaining > 0 && level < MASTERY_MAX_LEVEL) {
      const need = getMasteryXpToNext(level);
      if (need <= 0 || remaining < need) break;
      remaining -= need;
      level += 1;
    }
    const cap = getMasteryXpToNext(level);
    const levelXp = Math.max(0, Math.min(cap, remaining));
    return { level, levelXp };
  }

  function getCommanderTickTotals() {
    const ticks = [];
    for (let level = 1; level <= 15; level += 1) {
      const total = XP_CONFIG.commanderLevels.cumulativeAtLevel[level] || 0;
      ticks.push({
        total,
        label: String(level),
        showLabel: true,
        title: t("calendar.levelTooltip").replace("{level}", String(level)).replace("{xp}", formatXp(total))
      });
    }
    return ticks;
  }

  function getMasteryTickTotals(minTotal, maxTotal) {
    const rawTicks = [];
    const keyLevels = new Set([0, 30, 60, 90, 200, 400, 600, 800, 1000]);
    const safeMin = Math.max(0, Number(minTotal) || 0);
    const safeMax = Math.max(safeMin + 1, Number(maxTotal) || 1);
    let level = 0;
    while (level <= MASTERY_MAX_LEVEL) {
      const total = getMasteryCumulativeAtLevel(level);
      if (total < safeMin || total > safeMax) {
        level += 1;
        continue;
      }
      rawTicks.push({
        level,
        total,
        label: String(level),
        showLabel: keyLevels.has(level),
        title: t("calendar.levelTooltip").replace("{level}", String(level)).replace("{xp}", formatXp(total))
      });
      level += 1;
    }
    const filtered = [];
    let lastPercent = -1;
    rawTicks.forEach(function (tick) {
      const percent = ((tick.total - safeMin) / Math.max(1, safeMax - safeMin)) * 100;
      if (tick.showLabel || percent - lastPercent >= 0.6 || percent >= 99.95) {
        filtered.push(tick);
        lastPercent = percent;
      }
    });
    return filtered;
  }

  function createDualRangeController(config) {
    const startInput = config.root.querySelector(".xp-dual-input-start");
    const endInput = config.root.querySelector(".xp-dual-input-end");
    const selected = config.root.querySelector(".xp-dual-selected");
    const ticks = config.root.querySelector(".xp-dual-ticks");
    return {
      mode: config.mode,
      root: config.root,
      startInput,
      endInput,
      selected,
      ticks
    };
  }

  function setDualRangeLimits(controller, min, max) {
    const normalizedMin = Math.max(0, Number(min) || 0);
    const normalizedMax = Math.max(normalizedMin, Number(max) || 0);
    controller.startInput.min = String(normalizedMin);
    controller.startInput.max = String(normalizedMax);
    controller.endInput.min = String(normalizedMin);
    controller.endInput.max = String(normalizedMax);
  }

  function updateDualRangeVisual(controller) {
    const min = Number(controller.startInput.min || 0);
    const max = Number(controller.startInput.max || 1);
    const startValue = Number(controller.startInput.value || min);
    const endValue = Number(controller.endInput.value || max);
    const span = Math.max(1, max - min);
    const startPercent = ((startValue - min) / span) * 100;
    const endPercent = ((endValue - min) / span) * 100;
    controller.selected.style.left = `${startPercent}%`;
    controller.selected.style.width = `${Math.max(0, endPercent - startPercent)}%`;
    controller.startInput.style.zIndex = "3";
    controller.endInput.style.zIndex = "4";
  }

  function renderRangeTicks(controller, totals, minTotal, maxTotal) {
    if (!controller.ticks) return;
    const safeMin = Math.max(0, Number(minTotal) || 0);
    const safeMax = Math.max(safeMin + 1, Number(maxTotal) || 1);
    const lines = totals.map(function (tick) {
      const percent = Math.max(0, Math.min(100, ((tick.total - safeMin) / (safeMax - safeMin)) * 100));
      const label = tick.showLabel ? `<span class="xp-dual-tick-label">${tick.label}</span>` : "";
      const title = tick.title ? ` title="${tick.title}"` : "";
      return `<span class="xp-dual-tick" style="left:${percent}%"${title}>${label}</span>`;
    });
    controller.ticks.innerHTML = lines.join("");
  }

  function syncCommanderRangeFromInputs() {
    const startLevel = Number(levelingForm.elements.startLevel.value || 1);
    const startXp = Number(levelingForm.elements.startLevelXp.value || 0);
    const targetLevel = Number(levelingForm.elements.targetLevel.value || 15);
    const targetXp = Number(levelingForm.elements.targetLevelXp.value || 0);
    const maxTotal = getCommanderMaxTotalXp();
    setDualRangeLimits(dualRangeState.commander, 0, maxTotal);
    const startTotal = toTotalCommanderXp(startLevel, startXp);
    const targetTotal = toTotalCommanderXp(targetLevel, targetXp);
    dualRangeState.commander.startInput.value = String(Math.min(startTotal, targetTotal));
    dualRangeState.commander.endInput.value = String(Math.max(startTotal, targetTotal));
    renderRangeTicks(dualRangeState.commander, getCommanderTickTotals(), 0, maxTotal);
    updateDualRangeVisual(dualRangeState.commander);
  }

  function syncMasteryRangeFromInputs() {
    const startLevel = Number(masteryForm.elements.startMasteryLevel.value || 0);
    const startXp = Number(masteryForm.elements.startMasteryXp.value || 0);
    const targetLevel = Number(masteryForm.elements.targetMasteryLevel.value || 90);
    const targetXp = Number(masteryForm.elements.targetMasteryXp.value || 0);
    const startTotal = toTotalMasteryXp(startLevel, startXp);
    const targetTotal = toTotalMasteryXp(targetLevel, targetXp);
    const startLv = clampMasteryLevel(startLevel);
    const targetLv = clampMasteryLevel(targetLevel);
    const lowerLevel = Math.min(startLv, targetLv);
    const upperLevel = Math.max(startLv, targetLv);
    const spanLevel = Math.max(1, upperLevel - lowerLevel);
    const levelPadding = Math.max(5, Math.ceil(spanLevel * 0.5));
    const viewMinLevel = Math.max(0, lowerLevel - levelPadding);
    const viewMaxLevel = Math.min(MASTERY_MAX_LEVEL, upperLevel + levelPadding);
    const rangeMin = getMasteryCumulativeAtLevel(viewMinLevel);
    const rangeMax = getMasteryCumulativeAtLevel(viewMaxLevel) + getMasteryXpToNext(viewMaxLevel);
    const safeMin = Math.min(rangeMin, startTotal, targetTotal);
    const safeMax = Math.max(rangeMax, startTotal, targetTotal, safeMin + 1);
    setDualRangeLimits(dualRangeState.mastery, safeMin, safeMax);
    dualRangeState.mastery.startInput.value = String(startTotal);
    dualRangeState.mastery.endInput.value = String(targetTotal);
    renderRangeTicks(dualRangeState.mastery, getMasteryTickTotals(safeMin, safeMax), safeMin, safeMax);
    updateDualRangeVisual(dualRangeState.mastery);
  }

  function syncRangesFromInputs() {
    syncCommanderRangeFromInputs();
    syncMasteryRangeFromInputs();
  }

  function applyCommanderInputsFromRange() {
    const controller = dualRangeState.commander;
    const startTotal = Number(controller.startInput.value || 0);
    const endTotal = Number(controller.endInput.value || 0);
    const startData = toCommanderLevelXpByTotalXp(startTotal);
    const endData = toCommanderLevelXpByTotalXp(endTotal);
    levelingForm.elements.startLevel.value = String(startData.level);
    levelingForm.elements.startLevelXp.value = String(Math.floor(startData.levelXp));
    levelingForm.elements.targetLevel.value = String(endData.level);
    levelingForm.elements.targetLevelXp.value = String(Math.floor(endData.levelXp));
  }

  function applyMasteryInputsFromRange() {
    const controller = dualRangeState.mastery;
    const startTotal = Number(controller.startInput.value || 0);
    const endTotal = Number(controller.endInput.value || 0);
    const startData = toMasteryLevelXpByTotalXp(startTotal);
    const endData = toMasteryLevelXpByTotalXp(endTotal);
    masteryForm.elements.startMasteryLevel.value = String(startData.level);
    masteryForm.elements.startMasteryXp.value = String(Math.floor(startData.levelXp));
    masteryForm.elements.targetMasteryLevel.value = String(endData.level);
    masteryForm.elements.targetMasteryXp.value = String(Math.floor(endData.levelXp));
  }

  function handleRangeInput(mode, activeSide) {
    const controller = dualRangeState[mode];
    if (!controller) return;
    let startValue = Number(controller.startInput.value || 0);
    let endValue = Number(controller.endInput.value || 0);
    if (activeSide === "start" && startValue > endValue) {
      endValue = startValue;
      controller.endInput.value = String(endValue);
    }
    if (activeSide === "end" && endValue < startValue) {
      startValue = endValue;
      controller.startInput.value = String(startValue);
    }
    updateDualRangeVisual(controller);
    dualRangeState.suppressRefresh = true;
    if (mode === "commander") {
      applyCommanderInputsFromRange();
    } else {
      applyMasteryInputsFromRange();
    }
    dualRangeState.suppressRefresh = false;
    onLevelingMasteryInput();
  }

  function readInput() {
    return {
      difficulty: "casual",
      randomMapBonus: false,
      firstWinBonus: false,
      taskType: "normal"
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
      startLevel: clampMasteryLevel(data.get("startMasteryLevel")),
      startLevelXp: Number(data.get("startMasteryXp") || 0),
      targetLevel: clampMasteryLevel(data.get("targetMasteryLevel")),
      targetLevelXp: Number(data.get("targetMasteryXp") || 0)
    };
  }

  function clampMasteryLevel(value) {
    return Math.max(0, Math.min(MASTERY_MAX_LEVEL, Math.floor(Number(value) || 0)));
  }

  function readScheduleInput() {
    const data = new FormData(scheduleForm);
    return {
      targetXp: Math.max(0, Math.floor(Number(data.get("targetXp") || 0)))
    };
  }

  function readAutoPlanInput() {
    const data = new FormData(calendarAutoPlanForm);
    return {
      startDate: parseDateInput(String(data.get("autoPlanStartDate") || "")),
      dailyNormalGames: Math.max(1, Math.floor(Number(data.get("autoPlanDailyNormalGames") || 1))),
      difficulty: String(data.get("autoPlanDifficulty") || "casual"),
      randomMapBonus: data.get("autoPlanRandomMapBonus") === "on",
      challengeMutation: data.get("autoPlanChallengeMutation") === "on",
      mutationDifficulty: String(data.get("autoPlanMutationDifficulty") || "savage")
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
      return { neededXp: 0, neededGames: 0, message: t("coop.msg.noExtraGamesCommander") };
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
      `<p class="xp-result-line"><span><strong>${t("coop.leveling.needxp")}</strong>${formatXp(levelingResult.neededXp)}</span>${renderSyncToggleButton()}</p>`
    ].join("");
  }

  function getMasteryXpToNext(level) {
    if (level >= 90) return XP_CONFIG.mastery.ascensionPerLevelXp;
    return XP_CONFIG.mastery.xpToNextLevel[level] || 0;
  }

  function getMasteryCumulativeAtLevel(level) {
    const lv = clampMasteryLevel(level);
    if (masteryCumulativeCache[lv] !== undefined) {
      return masteryCumulativeCache[lv];
    }
    let current = masteryCumulativeCache.length - 1;
    let total = masteryCumulativeCache[current];
    while (current < lv) {
      total += getMasteryXpToNext(current);
      current += 1;
      masteryCumulativeCache[current] = total;
    }
    return masteryCumulativeCache[lv];
  }

  function toTotalMasteryXp(level, levelXp) {
    const lv = clampMasteryLevel(level);
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
      return { neededXp: 0, neededGames: 0, message: t("coop.msg.noExtraGamesMastery") };
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
      `<p class="xp-result-line"><span><strong>${t("coop.leveling.needxp")}</strong>${formatXp(masteryResult.neededXp)}</span>${renderSyncToggleButton()}</p>`
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
      if (masteryInput.startLevel > MASTERY_MAX_LEVEL || masteryInput.targetLevel > MASTERY_MAX_LEVEL) {
        onValidationWarning(t("coop.warn.masteryMax").replace("{max}", String(MASTERY_MAX_LEVEL)));
        return false;
      }
      const masteryStartCap = getMasteryXpToNext(Math.max(0, Math.floor(masteryInput.startLevel)));
      if (masteryInput.startLevelXp > masteryStartCap) {
        onValidationWarning(t("coop.warn.masteryStartCap").replace("{cap}", formatXp(masteryStartCap)));
        return false;
      }
      const masteryTargetCap = getMasteryXpToNext(Math.max(0, Math.floor(masteryInput.targetLevel)));
      if (masteryInput.targetLevelXp > masteryTargetCap) {
        onValidationWarning(t("coop.warn.masteryTargetCap").replace("{cap}", formatXp(masteryTargetCap)));
        return false;
      }
    } else {
      const levelCap = getLevelCap(clampLevel(levelingInput.startLevel));
      if (clampLevel(levelingInput.startLevel) < 15 && levelingInput.startLevelXp > levelCap) {
        onValidationWarning(t("coop.warn.commanderStartCap").replace("{cap}", formatXp(levelCap)));
        return false;
      }
      const levelTargetCap = getLevelCap(clampLevel(levelingInput.targetLevel));
      if (clampLevel(levelingInput.targetLevel) < 15 && levelingInput.targetLevelXp > levelTargetCap) {
        onValidationWarning(t("coop.warn.commanderTargetCap").replace("{cap}", formatXp(levelTargetCap)));
        return false;
      }
    }
    return true;
  }

  let currentMode = "commander";

  function renderSyncToggleButton() {
    return `<button type="button" class="sync-target-xp-btn" data-sync-target-xp-action="true">${t("coop.sync.target")}</button>`;
  }

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
      startDateInput.value = dateToInput(new Date());
    }
    calendarBulkModal.hidden = false;
  }

  function closeBulkModal() {
    calendarBulkModal.hidden = true;
  }

  function openAutoPlanModal(defaultDate) {
    resetAutoPlanProgress();
    const startDateInput = calendarAutoPlanForm.querySelector('input[name="autoPlanStartDate"]');
    const dailyInput = calendarAutoPlanForm.querySelector('input[name="autoPlanDailyNormalGames"]');
    const difficultySelect = calendarAutoPlanForm.querySelector('select[name="autoPlanDifficulty"]');
    const randomCheckbox = calendarAutoPlanForm.querySelector('input[name="autoPlanRandomMapBonus"]');
    const mutationCheckbox = calendarAutoPlanForm.querySelector('input[name="autoPlanChallengeMutation"]');
    const mutationDifficultySelect = calendarAutoPlanForm.querySelector('select[name="autoPlanMutationDifficulty"]');
    if (startDateInput) {
      startDateInput.value = dateToInput(new Date());
    }
    if (dailyInput) {
      dailyInput.value = String(scheduleState.autoPlanConfig.dailyNormalGames || 3);
    }
    if (difficultySelect) {
      difficultySelect.value = scheduleState.autoPlanConfig.difficulty || "casual";
    }
    if (randomCheckbox) {
      randomCheckbox.checked = !!scheduleState.autoPlanConfig.randomMapBonus;
    }
    if (mutationCheckbox) {
      mutationCheckbox.checked = !!scheduleState.autoPlanConfig.challengeMutation;
    }
    if (mutationDifficultySelect) {
      mutationDifficultySelect.value = scheduleState.autoPlanConfig.mutationDifficulty || "savage";
    }
    calendarAutoPlanModal.hidden = false;
  }

  function closeAutoPlanModal() {
    if (autoPlanGenerating) return;
    calendarAutoPlanModal.hidden = true;
    resetAutoPlanProgress();
  }

  function yieldToUi() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.setTimeout(resolve, 0);
      });
    });
  }

  function resetAutoPlanProgress() {
    calendarAutoPlanProgressEl.hidden = true;
    calendarAutoPlanProgressBarEl.style.width = "0%";
    calendarAutoPlanProgressTrackEl.setAttribute("aria-valuenow", "0");
  }

  function setAutoPlanProgress(ratio, phase) {
    const percent = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    calendarAutoPlanProgressEl.hidden = false;
    calendarAutoPlanProgressBarEl.style.width = percent + "%";
    calendarAutoPlanProgressTrackEl.setAttribute("aria-valuenow", String(percent));
    const key = phase === "optimizing"
      ? "coop.modal.autoPlan.progressOptimizing"
      : "coop.modal.autoPlan.progressBuilding";
    calendarAutoPlanProgressLabelEl.textContent = t(key).replace("{percent}", String(percent));
  }

  function setAutoPlanGenerating(active) {
    autoPlanGenerating = active;
    calendarAutoPlanGenerateBtn.disabled = active;
    calendarAutoPlanCancelBtn.disabled = active;
    calendarAutoPlanForm.querySelectorAll("input, select, button").forEach(function (element) {
      if (element === calendarAutoPlanGenerateBtn || element === calendarAutoPlanCancelBtn) {
        return;
      }
      element.disabled = active;
    });
  }

  function openExportModal() {
    const scopeSelect = calendarExportForm.querySelector('select[name="exportScope"]');
    const timeInput = calendarExportForm.querySelector('input[name="exportStartTime"]');
    if (scopeSelect) scopeSelect.value = "all";
    if (timeInput && !timeInput.value) timeInput.value = "20:00";
    calendarExportModal.hidden = false;
    if (scopeSelect instanceof HTMLElement) scopeSelect.focus();
  }

  function closeExportModal() {
    calendarExportModal.hidden = true;
  }

  function readExportOptions() {
    const data = new FormData(calendarExportForm);
    return {
      scope: String(data.get("exportScope") || "all"),
      startTime: String(data.get("exportStartTime") || "20:00")
    };
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
        const manualMutationReward = getMutationAccumulatedReward(
          mapDifficultyToMutationDifficulty(taskCopy.difficulty || "casual")
        );
        taskCopy.mutationBonusXp = mutationRewardPerWeek > 0 ? mutationRewardPerWeek : manualMutationReward;
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
    const weekdayNames = [
      t("weekday.mon"),
      t("weekday.tue"),
      t("weekday.wed"),
      t("weekday.thu"),
      t("weekday.fri"),
      t("weekday.sat"),
      t("weekday.sun")
    ];
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
              ? `<div class="calendar-day">${dayNum}<span class="calendar-day-star" aria-label="${t("calendar.today")}" title="${t("calendar.today")}">★</span></div>`
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
            const typeText = task.taskType === "mutation" ? t("single.option.mutationTask") : t("single.option.normalTask");
            const difficultyText = getDifficultyLabel(task.difficulty);
            const randomText = task.randomMapBonus ? t("calendar.random") : t("calendar.fixed");
            const selectedCls = task.id === scheduleState.selectedTaskId ? " selected" : "";
            const mutationCls = task.taskType === "mutation" ? " mutation" : "";
            const firstWinText = task.firstWinXp > 0 ? ` + ${t("calendar.firstWin")} ${formatXp(task.firstWinXp)}` : "";
            const mutationText = task.mutationBonusXp > 0 ? ` + ${t("calendar.mutation")} ${formatXp(task.mutationBonusXp)}` : "";
            const titleText = `${typeText} / ${difficultyText} / ${randomText} ${formatGamesCount(task.games)}`;
            return [
              `<div class="task-chip${mutationCls}${selectedCls}" data-select-id="${task.id}">`,
              `<div class="task-chip-content">`,
              `<div class="task-chip-title">${titleText}</div>`,
              `<div class="task-chip-xp">${t("calendar.xpLabel")} ${formatXp(task.coreXp)}${firstWinText}${mutationText} = ${formatXp(task.totalXp)}</div>`,
              "</div>",
              `<button type="button" class="task-chip-gear-btn" data-edit-id="${task.id}" aria-label="${t("calendar.editTask")}">⚙</button>`,
              "</div>"
            ].join("");
          }).join("");
          const dayLabel = key === todayKey
            ? `<div class="calendar-day">${dayNum}<span class="calendar-day-star" aria-label="${t("calendar.today")}" title="${t("calendar.today")}">★</span></div>`
            : `<div class="calendar-day">${dayNum}</div>`;
          weekCells.push([
            '<div class="calendar-cell has-plan">',
            dayLabel,
            `<button type="button" class="calendar-cell-add-btn" data-add-date="${key}">+</button>`,
            `<div class="calendar-games">${formatGamesCount(summary.totalGames)}</div>`,
            `<div class="calendar-time">${formatDuration(summary.totalMinutes)}</div>`,
            `<div class="calendar-xp">${t("calendar.base")} ${formatXp(summary.baseXp)} + ${t("calendar.mutation")} ${formatXp(summary.mutationBonusXp)} = ${formatXp(summary.totalXp)}</div>`,
            `<div class="task-chip-list">${taskTags}</div>`,
            "</div>"
          ].join(""));
        }
        const banner = weekBonusXp > 0
          ? `<div class="calendar-week-mutation">${dateToInput(weekStartDate)} ${t("common.to")} ${dateToInput(weekEndDate)} ${t("calendar.weekMutationReward")} +${formatXp(weekBonusXp)}</div>`
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
      scheduleSummaryEl.innerHTML = '<p data-i18n="coop.schedule.placeholder"></p>';
      if (window.SC2I18n && typeof window.SC2I18n.translatePage === "function") {
        const lang = window.SC2I18n.detectLanguage ? window.SC2I18n.detectLanguage() : "zh";
        window.SC2I18n.translatePage(lang);
      }
      return;
    }
    const totalGames = scheduleState.tasks.reduce(function (sum, t) { return sum + t.games; }, 0);
    const totalMinutes = scheduleState.tasks.reduce(function (sum, t) { return sum + t.estimatedMinutes; }, 0);
    const totalXp = scheduleState.tasks.reduce(function (sum, t) { return sum + t.totalXp; }, 0);
    const totalMutationBonus = scheduleState.tasks.reduce(function (sum, t) { return sum + t.mutationBonusXp; }, 0);
    const completionDate = scheduleState.tasks.length > 0
      ? scheduleState.tasks.reduce(function (latest, task) {
        if (!latest) return task.date;
        return task.date > latest ? task.date : latest;
      }, "")
      : t("calendar.unscheduled");
    const modeText = targetData.mode === "mastery" ? t("coop.mode.mastery") : t("coop.mode.commander");
    if (scheduleState.targetSource === "manual") {
      scheduleSummaryEl.innerHTML = [
        `<p><strong>${t("calendar.summary.mode")}</strong>${modeText}</p>`,
        `<p><strong>${t("calendar.summary.games")}</strong>${formatGamesCount(totalGames)}</p>`,
        `<p><strong>${t("calendar.summary.duration")}</strong>${formatDuration(totalMinutes)}</p>`,
        `<p><strong>${t("calendar.summary.completion")}</strong>${completionDate}</p>`,
        `<p><strong>${t("calendar.summary.totalXp")}</strong>${formatXp(totalXp)} (${t("calendar.summary.mutationIncluded")} ${formatXp(totalMutationBonus)})</p>`
      ].join("");
      return;
    }
    const xpDiff = totalXp - scheduleState.targetXp;
    const diffText = xpDiff === 0
      ? `<span class="ok-text">${t("calendar.summary.matchTarget")}</span>`
      : `<span class="warn-text">${t("calendar.summary.diff")} ${xpDiff > 0 ? "+" : "-"}${formatXp(Math.abs(xpDiff))}</span>`;
    scheduleSummaryEl.innerHTML = [
      `<p><strong>${t("calendar.summary.mode")}</strong>${modeText}</p>`,
      `<p><strong>${t("calendar.summary.targetXp")}</strong>${formatXp(scheduleState.targetXp)}</p>`,
      `<p><strong>${t("calendar.summary.games")}</strong>${formatGamesCount(totalGames)}</p>`,
      `<p><strong>${t("calendar.summary.duration")}</strong>${formatDuration(totalMinutes)}</p>`,
      `<p><strong>${t("calendar.summary.completion")}</strong>${completionDate}</p>`,
      `<p><strong>${t("calendar.summary.totalXp")}</strong>${formatXp(totalXp)} (${t("calendar.summary.mutationIncluded")} ${formatXp(totalMutationBonus)})</p>`,
      `<p>${diffText}</p>`
    ].join("");
  }

  function sumTotalXp(tasks) {
    return tasks.reduce(function (sum, task) {
      return sum + (task.totalXp || 0);
    }, 0);
  }

  function syncTargetXpFromContext(context) {
    const neededXp = Math.max(0, Math.floor(context?.targetData?.neededXp || 0));
    if (!scheduleTargetXpInput) return;
    scheduleTargetXpInput.value = String(neededXp > 0 ? neededXp : 100000);
  }

  function ensureManualScheduleState() {
    if (scheduleState.generated) return;
    scheduleState.generated = true;
    scheduleState.targetMode = currentMode;
    scheduleState.targetGames = 0;
    scheduleState.targetXp = 0;
    scheduleState.targetSource = "manual";
    syncScheduleMutationRewardSetting(false, "savage");
  }

  function syncScheduleMutationRewardSetting(challengeMutation, mutationDifficulty) {
    scheduleState.mutationRewardPerWeek = challengeMutation
      ? getMutationAccumulatedReward(mutationDifficulty)
      : 0;
  }

  function mapMutationDifficultyToTaskDifficulty(mutationDifficulty) {
    if (mutationDifficulty === "casual") return "casual";
    if (mutationDifficulty === "normal") return "normal";
    if (mutationDifficulty === "hard") return "hard";
    return "brutal";
  }

  function appendWeeklyMutationTasks(tasks, mutationDifficulty) {
    const sortedNormal = [...tasks]
      .filter(function (task) { return task.taskType !== "mutation"; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });
    const weekFirstDateMap = new Map();
    sortedNormal.forEach(function (task) {
      const parsed = parseDateInput(task.date);
      if (!parsed) return;
      const weekKey = getWeekKey(parsed);
      if (!weekFirstDateMap.has(weekKey)) {
        weekFirstDateMap.set(weekKey, task.date);
      }
    });
    const mutationTasks = [];
    const mutationTaskDifficulty = mapMutationDifficultyToTaskDifficulty(mutationDifficulty);
    weekFirstDateMap.forEach(function (date) {
      mutationTasks.push(createTask(date, 1, "mutation", mutationTaskDifficulty, false));
    });
    return [...sortedNormal, ...mutationTasks];
  }

  async function optimizeTasksForTargetXpAsync(tasks, targetXp, challengeMutation, mutationDifficulty, mutationRewardPerWeek, onProgress) {
    let working = [...tasks];
    if (working.length <= 0) return working;
    let improved = true;
    let guard = 0;
    while (improved && guard < AUTO_PLAN_MAX_OPTIMIZE_GUARD) {
      improved = false;
      guard += 1;
      const normalIndexes = [];
      for (let i = 0; i < working.length; i += 1) {
        if (working[i].taskType === "normal") {
          normalIndexes.push(i);
        }
      }
      for (let idx = normalIndexes.length - 1; idx >= 0; idx -= 1) {
        const taskIndex = normalIndexes[idx];
        const candidate = [...working];
        if (candidate[taskIndex].games > 1) {
          candidate[taskIndex] = { ...candidate[taskIndex], games: candidate[taskIndex].games - 1 };
        } else {
          candidate.splice(taskIndex, 1);
        }
        let normalized = candidate;
        if (challengeMutation) {
          normalized = appendWeeklyMutationTasks(normalized, mutationDifficulty);
        }
        normalized = recalculateTaskDetails(normalized, DEFAULT_STAGE_RATIO, mutationRewardPerWeek);
        const totalXp = sumTotalXp(normalized);
        if (totalXp >= targetXp) {
          working = normalized;
          improved = true;
          break;
        }
      }
      if (guard % AUTO_PLAN_YIELD_EVERY === 0) {
        const optimizeRatio = Math.min(1, guard / AUTO_PLAN_MAX_OPTIMIZE_GUARD);
        await onProgress(AUTO_PLAN_BUILD_WEIGHT + optimizeRatio * AUTO_PLAN_OPTIMIZE_WEIGHT, "optimizing");
      }
    }
    return working;
  }

  async function buildTasksByTargetXpAsync(startDate, targetXp, dailyGamesTarget, difficulty, randomMapBonus, challengeMutation, mutationDifficulty, mutationRewardPerWeek, onProgress) {
    if (targetXp <= 0) return [];
    const estimatedGames = Math.max(1, Math.ceil(targetXp / Math.max(1, calculatePerGameXpByConfig(difficulty, randomMapBonus))));
    let tasks = distributeTemplateTasks(startDate, estimatedGames, dailyGamesTarget, difficulty, randomMapBonus);
    if (challengeMutation) {
      tasks = appendWeeklyMutationTasks(tasks, mutationDifficulty);
    }
    tasks = recalculateTaskDetails(tasks, DEFAULT_STAGE_RATIO, mutationRewardPerWeek);
    if (tasks.length <= 0) {
      tasks = [createTask(dateToInput(startDate), 1, "normal", difficulty, randomMapBonus)];
      if (challengeMutation) {
        tasks = appendWeeklyMutationTasks(tasks, mutationDifficulty);
      }
      tasks = recalculateTaskDetails(tasks, DEFAULT_STAGE_RATIO, mutationRewardPerWeek);
    }
    let totalXp = sumTotalXp(tasks);
    let guard = 0;
    await onProgress(Math.min(1, totalXp / targetXp) * AUTO_PLAN_BUILD_WEIGHT, "building");
    while (totalXp < targetXp && guard < AUTO_PLAN_MAX_BUILD_GUARD) {
      const lastIndex = tasks.length - 1;
      if (lastIndex < 0) {
        const nextDate = dateToInput(addDays(startDate, tasks.length));
        tasks.push(createTask(nextDate, dailyGamesTarget, "normal", difficulty, randomMapBonus));
      } else if (tasks[lastIndex].games < dailyGamesTarget * 2) {
        tasks[lastIndex].games += 1;
      } else {
        const nextDate = dateToInput(addDays(startDate, tasks.length));
        tasks.push(createTask(nextDate, dailyGamesTarget, "normal", difficulty, randomMapBonus));
      }
      if (challengeMutation) {
        tasks = appendWeeklyMutationTasks(tasks, mutationDifficulty);
      }
      tasks = recalculateTaskDetails(tasks, DEFAULT_STAGE_RATIO, mutationRewardPerWeek);
      totalXp = sumTotalXp(tasks);
      guard += 1;
      if (guard % AUTO_PLAN_YIELD_EVERY === 0) {
        const buildRatio = Math.min(1, totalXp / targetXp);
        await onProgress(buildRatio * AUTO_PLAN_BUILD_WEIGHT, "building");
      }
    }
    tasks = await optimizeTasksForTargetXpAsync(
      tasks,
      targetXp,
      challengeMutation,
      mutationDifficulty,
      mutationRewardPerWeek,
      onProgress
    );
    await onProgress(1, "optimizing");
    return tasks;
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

  async function generateSchedule() {
    if (autoPlanGenerating) return;
    const context = gatherCurrentContext();
    if (!context) return;
    const scheduleInput = readScheduleInput();
    const autoPlanInput = readAutoPlanInput();
    if (!autoPlanInput.startDate) {
      window.alert(t("alert.selectValidStartDate"));
      return;
    }
    if (!Number.isFinite(scheduleInput.targetXp) || scheduleInput.targetXp <= 0) {
      window.alert(t("alert.enterValidTargetXp"));
      return;
    }
    cancelCoopScheduleDebounce();
    scheduleState.generated = true;
    scheduleState.targetSource = "auto";
    scheduleState.targetMode = currentMode;
    scheduleState.targetXp = Math.floor(scheduleInput.targetXp);
    scheduleState.autoPlanConfig = {
      difficulty: autoPlanInput.difficulty,
      randomMapBonus: autoPlanInput.randomMapBonus,
      dailyNormalGames: autoPlanInput.dailyNormalGames,
      challengeMutation: autoPlanInput.challengeMutation,
      mutationDifficulty: autoPlanInput.mutationDifficulty
    };
    syncScheduleMutationRewardSetting(autoPlanInput.challengeMutation, autoPlanInput.mutationDifficulty);
    setAutoPlanGenerating(true);
    setAutoPlanProgress(0, "building");
    try {
      scheduleState.tasks = await buildTasksByTargetXpAsync(
        autoPlanInput.startDate,
        scheduleState.targetXp,
        autoPlanInput.dailyNormalGames,
        autoPlanInput.difficulty,
        autoPlanInput.randomMapBonus,
        autoPlanInput.challengeMutation,
        autoPlanInput.mutationDifficulty,
        scheduleState.mutationRewardPerWeek,
        async function (ratio, phase) {
          setAutoPlanProgress(ratio, phase);
          await yieldToUi();
        }
      );
    } finally {
      setAutoPlanGenerating(false);
      resetAutoPlanProgress();
    }
    scheduleState.targetGames = scheduleState.tasks.reduce(function (sum, task) { return sum + task.games; }, 0);
    scheduleState.selectedTaskId = null;
    scheduleState.viewDate = clampViewDate(autoPlanInput.startDate);
    trackAnalyticsEvent("schedule_generated", {
      target_xp: scheduleState.targetXp,
      total_tasks: scheduleState.tasks.length,
      total_games: scheduleState.targetGames,
      difficulty: autoPlanInput.difficulty,
      is_random_map: autoPlanInput.randomMapBonus,
      has_challenge_mutation: autoPlanInput.challengeMutation,
      mutation_difficulty: autoPlanInput.mutationDifficulty,
      daily_normal_games: autoPlanInput.dailyNormalGames,
      event_category: "schedule",
      event_label: "auto_plan"
    });
    closeAutoPlanModal();
    renderScheduleSummary(context.targetData);
    renderScheduleList();
  }

  function saveTaskFromEditor() {
    ensureManualScheduleState();
    const value = readEditorFormValue();
    if (!value.date) {
      window.alert(t("alert.selectValidPlanDate"));
      return;
    }
    if (!Number.isFinite(value.games) || value.games <= 0) {
      window.alert(t("alert.gamesMustBePositive"));
      return;
    }
    let analyticsAction = "task_created";
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
      analyticsAction = "task_updated";
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
    trackAnalyticsEvent(analyticsAction, {
      task_type: value.taskType,
      difficulty: value.difficulty,
      games: Math.floor(value.games),
      date: dateToInput(value.date),
      is_random_map: value.randomMapBonus,
      event_category: "schedule_task",
      event_label: analyticsAction
    });
    closeEditorModal();
    renderScheduleList();
  }

  function removeTaskById(taskId) {
    const removedTask = scheduleState.tasks.find(function (task) {
      return task.id === taskId;
    }) || null;
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
    if (removedTask) {
      trackAnalyticsEvent("task_deleted", {
        task_type: removedTask.taskType,
        difficulty: removedTask.difficulty,
        games: removedTask.games,
        date: removedTask.date,
        is_random_map: removedTask.randomMapBonus,
        event_category: "schedule_task",
        event_label: "delete"
      });
    }
    renderScheduleList();
  }

  function saveBulkTasks() {
    ensureManualScheduleState();
    const value = readBulkFormValue();
    if (!value.startDate) {
      window.alert(t("alert.selectValidStartDate"));
      return;
    }
    if (!Number.isFinite(value.days) || value.days <= 0) {
      window.alert(t("alert.daysMustBePositive"));
      return;
    }
    if (!Number.isFinite(value.gamesPerDay) || value.gamesPerDay <= 0) {
      window.alert(t("alert.dailyGamesMustBePositive"));
      return;
    }
    const createdDays = Math.floor(value.days);
    for (let i = 0; i < createdDays; i += 1) {
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
    trackAnalyticsEvent("task_created", {
      create_mode: "bulk",
      days: createdDays,
      games_per_day: Math.floor(value.gamesPerDay),
      difficulty: value.difficulty,
      is_random_map: value.randomMapBonus,
      event_category: "schedule_task",
      event_label: "bulk_create"
    });
    closeBulkModal();
    renderScheduleList();
  }

  function deleteTaskFromEditor() {
    if (scheduleState.editorMode !== "edit" || !scheduleState.editorTaskId) return;
    removeTaskById(scheduleState.editorTaskId);
    closeEditorModal();
  }

  function refreshXpPanels() {
    if (dualRangeState.suppressRefresh) {
      return null;
    }
    const context = gatherCurrentContext();
    if (!context) return null;
    syncRangesFromInputs();
    if (currentMode === "mastery") {
      renderMasteryResult(masteryResultEl, context.masteryResult, context.calc.total);
    } else {
      renderLevelingResult(levelingResultEl, context.levelingResult, context.calc.total);
    }
    return context;
  }

  function refreshScheduleViews(context) {
    if (!context || !scheduleState.generated) return;
    const renderStart = (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
    syncScheduleMutationRewardSetting(
      !!scheduleState.autoPlanConfig.challengeMutation,
      scheduleState.autoPlanConfig.mutationDifficulty || "savage"
    );
    scheduleState.tasks = recalculateTaskDetails(scheduleState.tasks, DEFAULT_STAGE_RATIO, scheduleState.mutationRewardPerWeek);
    renderScheduleSummary(context.targetData);
    renderScheduleList();
    const renderEnd = (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
    if (window.SC2Analytics && typeof window.SC2Analytics.trackTiming === "function") {
      window.SC2Analytics.trackTiming("coop_schedule_refresh", renderEnd - renderStart, {
        event_label: "schedule_refresh",
        tasks_count: scheduleState.tasks.length
      });
    }
  }

  function debouncedRefreshScheduleViews() {
    scheduleRefreshDebouncer.run(function () {
      const ctx = gatherCurrentContext();
      if (ctx && scheduleState.generated) {
        refreshScheduleViews(ctx);
      }
    });
  }

  function refreshAllImmediate() {
    if (dualRangeState.suppressRefresh) {
      return;
    }
    cancelCoopScheduleDebounce();
    const context = refreshXpPanels();
    if (context && scheduleState.generated) {
      refreshScheduleViews(context);
    }
  }

  function onLevelingMasteryInput() {
    const context = refreshXpPanels();
    if (context && scheduleState.generated) {
      debouncedRefreshScheduleViews();
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
    scheduleState.targetXp = 0;
    scheduleState.targetGames = 0;
    scheduleState.targetSource = "none";
    scheduleState.selectedTaskId = null;
    cancelCoopScheduleDebounce();
    refreshXpPanels();
    renderScheduleSummary(null);
    renderScheduleList();
  }

  function shiftViewMonth(delta) {
    scheduleState.viewDate = clampViewDate(new Date(scheduleState.viewDate.getFullYear(), scheduleState.viewDate.getMonth() + delta, 1));
    renderScheduleList();
  }

  function goToday() {
    scheduleState.viewDate = clampViewDate(new Date());
    renderScheduleList();
  }

  levelingForm.addEventListener("input", onLevelingMasteryInput);
  levelingForm.addEventListener("change", refreshAllImmediate);
  masteryForm.addEventListener("input", onLevelingMasteryInput);
  masteryForm.addEventListener("change", refreshAllImmediate);
  levelingResultEl.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const actionBtn = target.closest('[data-sync-target-xp-action="true"]');
    if (!actionBtn) return;
    const context = gatherCurrentContext();
    if (!context) return;
    syncTargetXpFromContext(context);
    refreshAllImmediate();
  });
  masteryResultEl.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const actionBtn = target.closest('[data-sync-target-xp-action="true"]');
    if (!actionBtn) return;
    const context = gatherCurrentContext();
    if (!context) return;
    syncTargetXpFromContext(context);
    refreshAllImmediate();
  });
  scheduleForm.addEventListener("input", function () {
    if (scheduleState.generated) {
      debouncedRefreshScheduleViews();
    }
  });
  scheduleForm.addEventListener("change", function () {
    if (scheduleState.generated) {
      cancelCoopScheduleDebounce();
      const ctx = gatherCurrentContext();
      if (ctx) {
        refreshScheduleViews(ctx);
      }
    }
  });
  autoPlanBtn.addEventListener("click", function () {
    openAutoPlanModal(scheduleState.viewDate);
  });
  calendarAutoPlanGenerateBtn.addEventListener("click", function () {
    void generateSchedule();
  });
  calendarAutoPlanCancelBtn.addEventListener("click", function () {
    closeAutoPlanModal();
  });
  calendarBulkAddBtn.addEventListener("click", function () {
    openBulkModal(scheduleState.viewDate);
  });
  calendarExportIcsBtn.addEventListener("click", function () {
    if (!scheduleState.tasks.length) {
      window.alert(t("alert.noTasksToExport"));
      return;
    }
    openExportModal();
  });
  calendarExportConfirmBtn.addEventListener("click", async function () {
    const exportStart = (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
    const options = readExportOptions();
    const suffix = options.scope === "currentMonth"
      ? `${scheduleState.viewDate.getFullYear()}${String(scheduleState.viewDate.getMonth() + 1).padStart(2, "0")}`
      : dateToInput(new Date()).replace(/-/g, "");
    const filename = `coop-plan-${suffix}.ics`;
    const exportModule = await loadCoopExportModule();
    const exportResult = exportModule.exportTasksAsIcs(scheduleState.tasks, {
      scope: options.scope,
      startTime: options.startTime,
      viewDate: scheduleState.viewDate,
      difficultyLabels: buildCalendarIcsDifficultyLabels(),
      texts: buildCalendarIcsTexts(),
      filename
    });
    if (!exportResult.ok) {
      window.alert(t("alert.noTasksInScope"));
      return;
    }
    const exportEnd = (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
    if (window.SC2Analytics && typeof window.SC2Analytics.trackTiming === "function") {
      window.SC2Analytics.trackTiming("coop_export_ics", exportEnd - exportStart, {
        event_label: "ics_export",
        exported_tasks: exportResult.exportedTasks || 0
      });
    }
    trackAnalyticsEvent("ics_export", {
      export_scope: options.scope,
      start_time: options.startTime,
      exported_tasks: exportResult.exportedTasks,
      filename: exportResult.filename,
      event_category: "schedule",
      event_label: "ics_export"
    });
    closeExportModal();
  });
  calendarExportCancelBtn.addEventListener("click", function () {
    closeExportModal();
  });
  calendarClearBtn.addEventListener("click", function () {
    const ok = window.confirm(t("confirm.clearAllTasks"));
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
  if (calendarTeamShareBtn) {
    calendarTeamShareBtn.addEventListener("click", function () {
      if (typeof window.sc2OpenTeamInviteModal === "function") {
        window.sc2OpenTeamInviteModal();
      }
    });
  }
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
  calendarAutoPlanModal.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-close-auto-plan-modal") === "true") {
      closeAutoPlanModal();
    }
  });
  calendarExportModal.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("data-close-export-modal") === "true") {
      closeExportModal();
    }
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !calendarEditorModal.hidden) {
      closeEditorModal();
    }
    if (event.key === "Escape" && !calendarBulkModal.hidden) {
      closeBulkModal();
    }
    if (event.key === "Escape" && !calendarAutoPlanModal.hidden) {
      closeAutoPlanModal();
    }
    if (event.key === "Escape" && !calendarExportModal.hidden) {
      closeExportModal();
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
    refreshAllImmediate();
    trackAnalyticsEvent("mode_switch", {
      mode: "commander",
      event_category: "calculator_mode",
      event_label: "commander"
    });
  });
  modeMasteryBtn.addEventListener("click", function () {
    applyMode("mastery");
    refreshAllImmediate();
    trackAnalyticsEvent("mode_switch", {
      mode: "mastery",
      event_category: "calculator_mode",
      event_label: "mastery"
    });
  });
  dualRangeState.commander.startInput.addEventListener("input", function () {
    handleRangeInput("commander", "start");
  });
  dualRangeState.commander.endInput.addEventListener("input", function () {
    handleRangeInput("commander", "end");
  });
  dualRangeState.mastery.startInput.addEventListener("input", function () {
    handleRangeInput("mastery", "start");
  });
  dualRangeState.mastery.endInput.addEventListener("input", function () {
    handleRangeInput("mastery", "end");
  });

  const startDateInput = calendarAutoPlanForm.querySelector('input[name="autoPlanStartDate"]');
  if (startDateInput && !startDateInput.value) {
    startDateInput.value = dateToInput(new Date());
  }

  scheduleState.viewDate = clampViewDate(new Date());
  applyMode("commander");
  syncRangesFromInputs();
  refreshXpPanels();
  renderScheduleSummary(null);
  renderScheduleList();
  window.addEventListener("sc2tool:languagechange", function () {
    refreshAllImmediate();
  });
})();

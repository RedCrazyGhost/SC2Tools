(function () {
  "use strict";

  function trackAnalyticsEvent(eventName, params) {
    if (!window.SC2Analytics || typeof window.SC2Analytics.trackEvent !== "function") {
      return;
    }
    window.SC2Analytics.trackEvent(eventName, params);
  }

  function t(key) {
    if (window.SC2I18n && typeof window.SC2I18n.t === "function") {
      return window.SC2I18n.t(key);
    }
    return key;
  }

  const XP_CONFIG = window.SC2XPData;
  if (!XP_CONFIG) {
    return;
  }

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

  const form = document.getElementById("xp-form");
  const resultEl = document.getElementById("xp-result");
  const firstWinBonusLabel = document.getElementById("first-win-bonus-label");
  if (!form || !resultEl || !firstWinBonusLabel) {
    return;
  }

  function syncFirstWinBonusLabel() {
    const taskTypeSelect = form.querySelector('select[name="taskType"]');
    if (!taskTypeSelect) return;
    firstWinBonusLabel.textContent = taskTypeSelect.value === "mutation"
      ? t("single.firstwin.weekly")
      : t("single.firstwin.daily");
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

  let refreshDebounceTimer = null;
  const INPUT_DEBOUNCE_MS = 100;

  function cancelRefreshDebounce() {
    if (refreshDebounceTimer) {
      clearTimeout(refreshDebounceTimer);
      refreshDebounceTimer = null;
    }
  }

  function refreshDebounced() {
    cancelRefreshDebounce();
    refreshDebounceTimer = setTimeout(function () {
      refreshDebounceTimer = null;
      refresh();
    }, INPUT_DEBOUNCE_MS);
  }

  form.addEventListener("input", refreshDebounced);
  form.addEventListener("change", function () {
    cancelRefreshDebounce();
    refresh();
    const input = readInput();
    const mutationDifficulty = mapDifficultyToMutationDifficulty(input.difficulty);
    const mutationReward = getMutationAccumulatedReward(mutationDifficulty);
    const result = calculateXp(input, mutationReward);
    trackAnalyticsEvent("single_xp_calculated", {
      task_type: input.taskType,
      difficulty: input.difficulty,
      is_random_map: input.randomMapBonus,
      has_first_win_bonus: input.firstWinBonus,
      mutation_difficulty: mutationDifficulty,
      total_xp: result.total,
      event_category: "calculation",
      event_label: "single_xp"
    });
  });
  window.addEventListener("sc2tool:languagechange", refresh);
  refresh();
})();

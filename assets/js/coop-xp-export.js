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

function toCompactDateTime(date) {
  return [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "T",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");
}

function toCompactUtcDateTime(date) {
  return [
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    "T",
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
    "Z"
  ].join("");
}

function escapeIcsText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function parseTimeInput(value) {
  const text = String(value || "").trim();
  const matched = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!matched) return { hour: 20, minute: 0 };
  const hour = Math.max(0, Math.min(23, Number(matched[1]) || 0));
  const minute = Math.max(0, Math.min(59, Number(matched[2]) || 0));
  return { hour, minute };
}

function toIcsEventRange(dateText, durationMinutes, startTime) {
  const parsed = parseDateInput(dateText);
  const start = parsed || new Date();
  const time = parseTimeInput(startTime);
  start.setHours(time.hour, time.minute, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Math.max(15, Number(durationMinutes) || 0));
  return {
    dtStart: toCompactDateTime(start),
    dtEnd: toCompactDateTime(end)
  };
}

function getTaskTypeText(taskType) {
  return taskType === "mutation" ? "突变任务" : "普通任务";
}

function formatXp(value) {
  return `${Math.round(Number(value) || 0).toLocaleString()} xp`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}分钟`;
  return `${h}小时${m}分钟`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function filterTasksByScope(tasks, scope, viewDate) {
  if (scope !== "currentMonth") return [...tasks];
  const monthKey = getMonthKey(viewDate || new Date());
  return tasks.filter(function (task) {
    const parsed = parseDateInput(task.date);
    if (!parsed) return false;
    return getMonthKey(parsed) === monthKey;
  });
}

function buildIcsContent(tasks, options) {
  const newline = "\r\n";
  const nowStamp = toCompactUtcDateTime(new Date());
  const settings = {
    startTime: "20:00",
    difficultyLabels: {},
    ...options
  };
  const sorted = [...tasks].sort(function (a, b) {
    if (a.date !== b.date) return String(a.date || "").localeCompare(String(b.date || ""));
    return (a.creationOrder || 0) - (b.creationOrder || 0);
  });
  const events = sorted.map(function (task) {
    const range = toIcsEventRange(task.date, task.estimatedMinutes, settings.startTime);
    const typeText = getTaskTypeText(task.taskType);
    const difficultyText = settings.difficultyLabels[task.difficulty] || String(task.difficulty || "未知");
    const summary = `${typeText} ${difficultyText} ${task.games || 0}局`;
    const description = [
      `日期：${task.date || ""}`,
      `任务类型：${typeText}`,
      `难度：${difficultyText}`,
      `局数：${task.games || 0}局`,
      `随机地图加成：${task.randomMapBonus ? "是" : "否"}`,
      `基础经验：${formatXp(task.baseXp || 0)}`,
      `首胜经验：${formatXp(task.firstWinXp || 0)}`,
      `突变奖励：${formatXp(task.mutationBonusXp || 0)}`,
      `总经验：${formatXp(task.totalXp || 0)}`,
      `预计时长：${formatDuration(task.estimatedMinutes || 0)}`
    ].join("\n");
    const uid = `${task.id || `task_${Date.now()}`}@sc2tools.local`;
    return [
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(uid)}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${range.dtStart}`,
      `DTEND:${range.dtEnd}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VEVENT"
    ].join(newline);
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SC2Tools//CoopSchedule//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
    ""
  ].join(newline);
}

function downloadIcs(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportTasksAsIcs(tasks, options) {
  const settings = {
    scope: "all",
    startTime: "20:00",
    viewDate: new Date(),
    difficultyLabels: {},
    filename: `coop-plan-${Date.now()}.ics`,
    ...options
  };
  const exportingTasks = filterTasksByScope(tasks, settings.scope, settings.viewDate);
  if (!exportingTasks.length) {
    return { ok: false, reason: "empty_scope" };
  }
  const content = buildIcsContent(exportingTasks, {
    startTime: settings.startTime,
    difficultyLabels: settings.difficultyLabels
  });
  downloadIcs(settings.filename, content);
  return { ok: true, exportedTasks: exportingTasks.length, filename: settings.filename };
}

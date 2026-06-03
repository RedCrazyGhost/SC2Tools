(function (global) {
  "use strict";

  var DIFFICULTY_I18N_KEYS = {
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

  function infra() {
    return global.SC2CoopXpInfra;
  }

  function domain() {
    return global.SC2CoopXpDomain;
  }

  function calNavIconSvg(direction) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      direction === "prev"
        ? "M14.7 6.3a1 1 0 0 1 0 1.4L10.41 12l4.3 4.3a1 1 0 1 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.41 0Z"
        : "M9.3 17.7a1 1 0 0 1 0-1.4L13.59 12l-4.3-4.3a1 1 0 0 1 1.42-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.41 0Z"
    );
    svg.appendChild(path);
    return svg;
  }

  function downloadIconSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L11 12.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z"
    );
    svg.appendChild(path);
    return svg;
  }

  /**
   * @param {{ label?: string, href?: string, onClick?: function }} downloadOpts
   */
  function createDownloadControl(downloadOpts) {
    downloadOpts = downloadOpts || {};
    var label = downloadOpts.label || "Download";
    var el;
    if (downloadOpts.href) {
      el = document.createElement("a");
      el.href = downloadOpts.href;
      el.setAttribute("download", "");
    } else {
      el = document.createElement("button");
      el.type = "button";
      if (typeof downloadOpts.onClick === "function") {
        el.addEventListener("click", downloadOpts.onClick);
      }
    }
    el.className = "calendar-icon-btn invite-pub-cal-download-btn";
    el.setAttribute("aria-label", label);
    el.setAttribute("title", label);
    el.appendChild(downloadIconSvg());
    return el;
  }

  function buildDaySummaries(tasks) {
    var map = new Map();
    tasks.forEach(function (task) {
      if (!task.date) {
        return;
      }
      var current = map.get(task.date);
      if (!current) {
        current = {
          date: task.date,
          totalGames: 0,
          totalMinutes: 0,
          baseXp: 0,
          mutationBonusXp: 0,
          totalXp: 0,
          tasks: []
        };
      }
      current.totalGames += task.games || 0;
      current.totalMinutes += task.estimatedMinutes || 0;
      current.baseXp += task.baseXp || 0;
      current.mutationBonusXp += task.mutationBonusXp || 0;
      current.totalXp += task.totalXp || 0;
      current.tasks.push(task);
      map.set(task.date, current);
    });
    return map;
  }

  function initialViewDate(tasks, exportOpts, dom) {
    var d = domain();
    if (!d) {
      return new Date();
    }
    if (dom && dom._viewDate instanceof Date) {
      return d.clampViewDate(dom._viewDate);
    }
    var raw = exportOpts && exportOpts.viewDate;
    if (raw) {
      var parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        return d.clampViewDate(parsed);
      }
    }
    if (tasks.length) {
      var sorted = tasks
        .map(function (t) {
          return t.date;
        })
        .filter(Boolean)
        .sort();
      var first = d.parseDateInput(sorted[0]);
      if (first) {
        return d.clampViewDate(first);
      }
    }
    return d.clampViewDate(new Date());
  }

  function renderMonthHtml(tasks, viewDate, t, getDifficultyLabel) {
    var I = infra();
    var D = domain();
    if (!I || !D) {
      return "";
    }
    var dayMap = buildDaySummaries(tasks);
    var monthCursor = D.clampViewDate(viewDate);
    var weekdayNames = [
      t("weekday.mon"),
      t("weekday.tue"),
      t("weekday.wed"),
      t("weekday.thu"),
      t("weekday.fri"),
      t("weekday.sat"),
      t("weekday.sun")
    ];
    var todayKey = D.dateToInput(new Date());
    var monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    var monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    var padBefore = (monthStart.getDay() + 6) % 7;
    var totalDays = monthEnd.getDate();
    var totalCells = Math.ceil((padBefore + totalDays) / 7) * 7;
    var weekBlocks = [];

    for (var weekIdx = 0; weekIdx < totalCells / 7; weekIdx += 1) {
      var weekCells = [];
      var weekStartDate = D.addDays(monthStart, weekIdx * 7 - padBefore);

      for (var d = 0; d < 7; d += 1) {
        var current = D.addDays(weekStartDate, d);
        var dayNum = current.getDate();
        var isCurrentMonth = current.getMonth() === monthCursor.getMonth();
        var key = D.dateToInput(current);

        if (!isCurrentMonth) {
          weekCells.push('<div class="calendar-cell empty"></div>');
          continue;
        }

        var summary = dayMap.get(key);
        if (!summary) {
          var dayLabelEmpty =
            key === todayKey
              ? '<div class="calendar-day">' +
                dayNum +
                '<span class="calendar-day-star" aria-label="' +
                t("calendar.today") +
                '" title="' +
                t("calendar.today") +
                '">★</span></div>'
              : '<div class="calendar-day">' + dayNum + "</div>";
          weekCells.push('<div class="calendar-cell">' + dayLabelEmpty + "</div>");
          continue;
        }

        var taskTags = summary.tasks
          .map(function (task) {
            var typeText =
              task.taskType === "mutation" ? t("single.option.mutationTask") : t("single.option.normalTask");
            var difficultyText = getDifficultyLabel(task.difficulty);
            var randomText = task.randomMapBonus ? t("calendar.random") : t("calendar.fixed");
            var mutationCls = task.taskType === "mutation" ? " mutation" : "";
            var titleText =
              typeText + " / " + difficultyText + " / " + randomText + " " + I.formatGamesCount(task.games);
            return [
              '<div class="task-chip' + mutationCls + '">',
              '<div class="task-chip-content">',
              '<div class="task-chip-title">' + titleText + "</div>",
              "</div>",
              "</div>"
            ].join("");
          })
          .join("");

        var dayLabel =
          key === todayKey
            ? '<div class="calendar-day">' +
              dayNum +
              '<span class="calendar-day-star" aria-label="' +
              t("calendar.today") +
              '" title="' +
              t("calendar.today") +
              '">★</span></div>'
            : '<div class="calendar-day">' + dayNum + "</div>";

        weekCells.push(
          [
            '<div class="calendar-cell has-plan">',
            dayLabel,
            '<div class="calendar-games">' + I.formatGamesCount(summary.totalGames) + "</div>",
            '<div class="calendar-time">' + I.formatDuration(summary.totalMinutes) + "</div>",
            '<div class="task-chip-list">' + taskTags + "</div>",
            "</div>"
          ].join("")
        );
      }

      weekBlocks.push(
        [
          '<div class="calendar-week-block">',
          '<div class="calendar-grid week-grid">' + weekCells.join("") + "</div>",
          "</div>"
        ].join("")
      );
    }

    var monthLabel = t("calendar.monthLabel")
      .replace("{year}", String(monthStart.getFullYear()))
      .replace("{month}", String(monthStart.getMonth() + 1));

    return [
      '<section class="calendar-month">',
      '<div class="calendar-month-head">',
      '<h4 class="calendar-title">' + monthLabel + "</h4>",
      "</div>",
      '<div class="calendar-weekdays">' +
        weekdayNames
          .map(function (n) {
            return '<div class="calendar-weekday">' + n + "</div>";
          })
          .join("") +
        "</div>",
      '<div class="calendar-weeks">' + weekBlocks.join("") + "</div>",
      "</section>"
    ].join("");
  }

  function paint(hostEl, plan, tFn) {
    var I = infra();
    var D = domain();
    if (!hostEl || !plan || !I || !D || !Array.isArray(plan.tasks) || !plan.tasks.length) {
      return false;
    }

    var t = tFn || I.t;
    var ex = plan.export || {};
    var diffLabels = ex.difficultyLabels || {};

    function getDifficultyLabel(difficulty) {
      if (diffLabels[difficulty] != null) {
        return String(diffLabels[difficulty]);
      }
      var key = DIFFICULTY_I18N_KEYS[difficulty];
      return key ? t(key) : String(difficulty || "");
    }

    var viewDate = initialViewDate(plan.tasks, ex, hostEl);
    hostEl._viewDate = viewDate;

    var nav = hostEl.parentElement && hostEl.parentElement.querySelector("[data-invite-cal-nav]");
    var titleEl = nav && nav.querySelector("[data-invite-cal-title]");

    function syncTitle() {
      if (titleEl) {
        titleEl.textContent = t("calendar.monthLabel")
          .replace("{year}", String(viewDate.getFullYear()))
          .replace("{month}", String(viewDate.getMonth() + 1));
      }
    }

    function shiftMonth(delta) {
      viewDate = D.clampViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
      hostEl._viewDate = viewDate;
      repaint();
    }

    function repaint() {
      hostEl.innerHTML = renderMonthHtml(plan.tasks, viewDate, t, getDifficultyLabel);
      syncTitle();
    }

    if (nav && !nav._wired) {
      nav._wired = true;
      nav.addEventListener("click", function (ev) {
        var prevBtn = ev.target.closest("[data-invite-cal-prev]");
        var nextBtn = ev.target.closest("[data-invite-cal-next]");
        if (prevBtn) {
          ev.preventDefault();
          shiftMonth(-1);
          return;
        }
        if (nextBtn) {
          ev.preventDefault();
          shiftMonth(1);
        }
      });
    }

    repaint();
    return true;
  }

  /**
   * @param {HTMLElement} sectionEl section.invite-pub-section (calendar block)
   * @param {object} plan calendar_plan from API
   * @param {{ t?: function, download?: object }} [opts]
   */
  function render(hostEl, plan, opts) {
    if (!hostEl || !plan || !Array.isArray(plan.tasks) || !plan.tasks.length) {
      return false;
    }
    opts = opts || {};
    var tFn = opts.t;

    hostEl.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "invite-pub-calendar-wrap";

    var nav = document.createElement("div");
    nav.className = "invite-pub-cal-nav";
    nav.setAttribute("data-invite-cal-nav", "1");

    var navCore = document.createElement("div");
    navCore.className = "invite-pub-cal-nav-core";

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "calendar-icon-btn invite-pub-cal-nav-btn";
    prevBtn.setAttribute("data-invite-cal-prev", "");
    prevBtn.setAttribute("aria-label", tFn ? tFn("coop.toolbar.prev") : "Previous month");
    prevBtn.appendChild(calNavIconSvg("prev"));

    var titleSpan = document.createElement("span");
    titleSpan.className = "invite-pub-cal-nav-title";
    titleSpan.setAttribute("data-invite-cal-title", "");

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "calendar-icon-btn invite-pub-cal-nav-btn";
    nextBtn.setAttribute("data-invite-cal-next", "");
    nextBtn.setAttribute("aria-label", tFn ? tFn("coop.toolbar.next") : "Next month");
    nextBtn.appendChild(calNavIconSvg("next"));

    navCore.appendChild(prevBtn);
    navCore.appendChild(titleSpan);
    navCore.appendChild(nextBtn);
    nav.appendChild(navCore);

    if (opts.download) {
      nav.appendChild(createDownloadControl(opts.download));
    }

    var root = document.createElement("div");
    root.className = "invite-pub-calendar-root";
    root.setAttribute("data-invite-cal-host", "1");

    wrap.appendChild(nav);
    wrap.appendChild(root);
    hostEl.appendChild(wrap);

    if (!paint(root, plan, tFn)) {
      hostEl.innerHTML = "";
      return false;
    }
    return true;
  }

  global.sc2InviteCalendarPreview = {
    render: render,
    createDownloadControl: createDownloadControl
  };
})(window);

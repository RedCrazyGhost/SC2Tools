(function (global) {
  "use strict";

  function trackAnalyticsEvent(eventName, params) {
    if (!global.SC2Analytics || typeof global.SC2Analytics.trackEvent !== "function") {
      return;
    }
    global.SC2Analytics.trackEvent(eventName, params);
  }

  function t(key) {
    if (global.SC2I18n && typeof global.SC2I18n.t === "function") {
      return global.SC2I18n.t(key);
    }
    return key;
  }

  function formatXp(value) {
    return `${Math.round(Number(value) || 0).toLocaleString()} xp`;
  }

  function toPercentText(value) {
    return `${Math.round(value * 100)}%`;
  }

  function formatGamesCount(value) {
    const count = Math.max(0, Math.floor(Number(value) || 0));
    const unit = t("calendar.gamesUnit");
    const lang = (global.SC2I18n && typeof global.SC2I18n.detectLanguage === "function")
      ? global.SC2I18n.detectLanguage()
      : "zh";
    if (lang === "en") {
      return `${count} ${unit}`;
    }
    return `${count}${unit}`;
  }

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h <= 0) {
      return t("time.minutes").replace("{m}", String(m));
    }
    return t("time.hoursMinutes").replace("{h}", String(h)).replace("{m}", String(m));
  }

  function createDebouncer(delayMs) {
    let timer = null;
    return {
      run(callback) {
        if (timer) {
          global.clearTimeout(timer);
        }
        timer = global.setTimeout(function () {
          timer = null;
          callback();
        }, delayMs);
      },
      cancel() {
        if (!timer) return;
        global.clearTimeout(timer);
        timer = null;
      }
    };
  }

  global.SC2CoopXpInfra = Object.freeze({
    trackAnalyticsEvent,
    t,
    formatXp,
    toPercentText,
    formatGamesCount,
    formatDuration,
    createDebouncer
  });
})(window);

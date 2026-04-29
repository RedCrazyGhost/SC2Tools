(function () {
  "use strict";

  const config = window.SC2_ANALYTICS_CONFIG || {};
  const debugEnabled = !!config.debug;
  const autoTrack = config.autoTrack || {};
  let initialized = false;

  function logDebug(message, payload) {
    if (!debugEnabled) return;
    if (payload === undefined) {
      console.info("[SC2Analytics]", message);
      return;
    }
    console.info("[SC2Analytics]", message, payload);
  }

  function detectToolName(pathname) {
    const cleanPath = String(pathname || "/");
    if (cleanPath === "/" || cleanPath.endsWith("/index.html")) {
      return "home";
    }
    const matched = /\/tools\/([a-z0-9-]+)\.html$/i.exec(cleanPath);
    if (!matched) return "unknown";
    return matched[1];
  }

  function getTrackingPolicy() {
    const toolName = detectToolName(window.location.pathname);
    const tablePages = new Set([
      "commander-xp-table",
      "mastery-xp-table",
      "mutation-reward-table"
    ]);
    if (tablePages.has(toolName)) {
      return {
        enableClick: autoTrack.click !== false,
        enableChange: false,
        enableSubmit: false
      };
    }
    return {
      enableClick: autoTrack.click !== false,
      enableChange: autoTrack.change !== false,
      enableSubmit: autoTrack.submit !== false
    };
  }

  function getEventContext() {
    return {
      site_name: String(config.siteName || "SC2Tools"),
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      tool_name: detectToolName(window.location.pathname)
    };
  }

  function getElementText(element) {
    const text = (element.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return text.slice(0, 120);
  }

  function readElementPayload(element) {
    const tag = String(element.tagName || "").toLowerCase();
    const dataset = element.dataset || {};
    const id = element.id || "";
    const className = typeof element.className === "string" ? element.className.trim() : "";
    const role = element.getAttribute("role") || "";
    const name = element.getAttribute("name") || "";
    const type = element.getAttribute("type") || "";
    const href = element.getAttribute("href") || "";
    const label = element.getAttribute("aria-label") || "";
    return {
      element_tag: tag,
      element_id: id.slice(0, 64),
      element_class: className.slice(0, 120),
      element_role: role.slice(0, 64),
      element_name: name.slice(0, 64),
      element_type: type.slice(0, 64),
      element_text: getElementText(element),
      element_href: href.slice(0, 240),
      element_label: label.slice(0, 120),
      event_category: dataset.analyticsCategory || "ui",
      event_label: dataset.analyticsLabel || ""
    };
  }

  function toSafeParams(params) {
    const source = params || {};
    const cleaned = {};
    Object.keys(source).forEach(function (key) {
      const normalizedKey = String(key || "").trim().toLowerCase();
      if (!normalizedKey) return;
      const value = source[key];
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "string") {
        cleaned[normalizedKey] = value.slice(0, 240);
        return;
      }
      cleaned[normalizedKey] = value;
    });
    return cleaned;
  }

  function trackEvent(eventName, params) {
    const name = String(eventName || "").trim();
    if (!name) return;
    const payload = {
      ...getEventContext(),
      ...toSafeParams(params)
    };
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
      logDebug(`event:${name}`, payload);
      return;
    }
    logDebug(`skip_event:${name}`, payload);
  }

  function trackPageView() {
    const context = getEventContext();
    if (typeof window.gtag === "function") {
      window.gtag("event", "tool_page_view", {
        tool_name: context.tool_name,
        event_category: "engagement",
        event_label: context.page_path
      });
      logDebug("tool_page_view", context);
    }
  }

  function trackTiming(name, durationMs, params) {
    const metricName = String(name || "").trim();
    if (!metricName) return;
    const duration = Math.max(0, Math.round(Number(durationMs) || 0));
    trackEvent("perf_timing", {
      metric_name: metricName,
      duration_ms: duration,
      event_category: "performance",
      ...(params || {})
    });
  }

  function initErrorTracking() {
    window.addEventListener("error", function (event) {
      trackEvent("frontend_error", {
        event_category: "error",
        event_label: "window_error",
        message: String(event.message || "").slice(0, 240),
        source: String(event.filename || "").slice(0, 240),
        line: Number(event.lineno) || 0,
        column: Number(event.colno) || 0
      });
    });
    window.addEventListener("unhandledrejection", function (event) {
      const reason = event.reason;
      const text = reason && typeof reason === "object" && "message" in reason
        ? String(reason.message || "")
        : String(reason || "");
      trackEvent("frontend_error", {
        event_category: "error",
        event_label: "unhandled_rejection",
        message: text.slice(0, 240)
      });
    });
  }

  function initLongTaskTracking() {
    if (!("PerformanceObserver" in window)) return;
    try {
      const observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          trackTiming("long_task", entry.duration, {
            entry_name: String(entry.name || "unknown").slice(0, 120)
          });
        });
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      logDebug("longtask_observer_not_supported", error);
    }
  }

  function trackAutoClick(event) {
    const target = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
    if (!target) return;
    const payload = readElementPayload(target);
    if (payload.element_href) {
      trackEvent("tool_nav_click", {
        destination: payload.element_href,
        event_category: "navigation",
        event_label: payload.element_text || payload.element_label || payload.element_href
      });
      if (target.matches("[data-monetization-cta='true'], .monetization-cta")) {
        trackEvent("monetization_cta_click", {
          destination: payload.element_href,
          cta_text: payload.element_text || payload.element_label || "cta",
          event_category: "monetization",
          event_label: payload.element_href
        });
      }
    }
    trackEvent("ui_click", payload);
  }

  function trackAutoChange(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
      return;
    }
    const form = target.form;
    trackEvent("form_change", {
      ...readElementPayload(target),
      form_id: form ? (form.id || "") : "",
      field_name: target.name || "",
      event_category: "form"
    });
  }

  function trackAutoSubmit(event) {
    const target = event.target instanceof HTMLFormElement ? event.target : null;
    if (!target) return;
    trackEvent("form_submit", {
      form_id: target.id || "",
      event_category: "form",
      event_label: target.id || target.getAttribute("name") || "unknown_form"
    });
  }

  function initAutoTracking() {
    const policy = getTrackingPolicy();
    if (policy.enableClick) {
      document.addEventListener("click", trackAutoClick, true);
    }
    if (policy.enableChange) {
      document.addEventListener("change", trackAutoChange, true);
    }
    if (policy.enableSubmit) {
      document.addEventListener("submit", trackAutoSubmit, true);
    }
  }

  function initAnalytics() {
    if (initialized) return;
    initialized = true;
    initAutoTracking();
    initErrorTracking();
    initLongTaskTracking();
    if (typeof window.gtag === "function") {
      trackPageView();
    } else {
      logDebug("gtag_not_found_skip_page_event");
    }
  }

  window.SC2Analytics = {
    initAnalytics,
    trackEvent,
    trackPageView,
    trackTiming,
    getToolName: function () {
      return detectToolName(window.location.pathname);
    }
  };

  initAnalytics();
})();

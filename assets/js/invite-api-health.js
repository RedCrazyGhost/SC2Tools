(function () {
  "use strict";

  var CACHE_TTL_MS = 30000;
  var DEFAULT_TIMEOUT_MS = 5000;

  var cached = {
    available: null,
    reason: null,
    checkedAt: 0
  };

  var listeners = [];
  var inflight = null;

  var PROD_INVITE_API_BASE = "http://154z1z6562.qicp.vip";
  var DEV_INVITE_API_BASE = "http://127.0.0.1:8080";

  function metaContent(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m || !m.content) {
      return "";
    }
    return String(m.content).trim();
  }

  function trimBase(raw) {
    return String(raw || "").trim().replace(/\/+$/, "");
  }

  function isLocalDevHost(hostname) {
    hostname = String(hostname || "").toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      /\.local$/i.test(hostname)
    );
  }

  function localDevApiFallback() {
    try {
      var loc = window.location;
      if (!loc || !isLocalDevHost(loc.hostname)) {
        return "";
      }
      return DEV_INVITE_API_BASE;
    } catch (e) {
      return "";
    }
  }

  function productionApiFallback() {
    return PROD_INVITE_API_BASE;
  }

  function apiBase() {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.apiBase === "function") {
      return window.sc2InviteUrl.apiBase();
    }
    var fromMeta = trimBase(metaContent("sc2-invite-api-base"));
    if (fromMeta) {
      return fromMeta;
    }
    try {
      var ls = trimBase(localStorage.getItem("sc2tool_invite_api_base"));
      if (ls) {
        return ls;
      }
    } catch (e) {
      /* ignore */
    }
    var localFallback = localDevApiFallback();
    if (localFallback) {
      return localFallback;
    }
    return productionApiFallback();
  }

  function isCacheFresh() {
    return cached.checkedAt > 0 && Date.now() - cached.checkedAt < CACHE_TTL_MS;
  }

  function notifyListeners(status) {
    listeners.forEach(function (fn) {
      try {
        fn(status);
      } catch (e) {
        /* ignore */
      }
    });
    try {
      window.dispatchEvent(
        new CustomEvent("sc2tool:invite-api-status", {
          detail: status
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function setStatus(available, reason) {
    var prev = cached.available;
    cached.available = available;
    cached.reason = reason || null;
    cached.checkedAt = Date.now();
    if (prev !== available) {
      notifyListeners(getStatus());
    }
  }

  function getStatus() {
    return {
      available: cached.available,
      reason: cached.reason,
      checkedAt: cached.checkedAt
    };
  }

  function isAvailable() {
    return cached.available;
  }

  function onStatusChange(fn) {
    if (typeof fn !== "function") {
      return function () {};
    }
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (item) {
        return item !== fn;
      });
    };
  }

  function isNetworkFailure(err) {
    if (!err) {
      return true;
    }
    if (err.name === "AbortError") {
      return true;
    }
    if (err instanceof TypeError) {
      return true;
    }
    return false;
  }

  function checkHealth(opts) {
    opts = opts || {};
    if (!opts.force && isCacheFresh() && cached.available !== null) {
      return Promise.resolve(getStatus());
    }
    if (inflight) {
      return inflight;
    }
    inflight = (async function () {
      var base = apiBase();
      if (!base) {
        setStatus(false, "no_base");
        return getStatus();
      }
      var timeoutMs = typeof opts.timeout === "number" ? opts.timeout : DEFAULT_TIMEOUT_MS;
      var controller = new AbortController();
      var timer = setTimeout(function () {
        controller.abort();
      }, timeoutMs);
      try {
        var res = await fetch(base + "/healthz", {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
          signal: controller.signal
        });
        var text = await res.text();
        if (res.ok && String(text || "").trim() === "ok") {
          setStatus(true, null);
        } else {
          setStatus(false, "bad_response");
        }
      } catch (e) {
        if (e && e.name === "AbortError") {
          setStatus(false, "timeout");
        } else {
          setStatus(false, "network");
        }
      } finally {
        clearTimeout(timer);
        inflight = null;
      }
      return getStatus();
    })();
    return inflight;
  }

  window.sc2InviteApi = {
    apiBase: apiBase,
    checkHealth: checkHealth,
    getStatus: getStatus,
    isAvailable: isAvailable,
    isNetworkFailure: isNetworkFailure,
    onStatusChange: onStatusChange
  };
})();

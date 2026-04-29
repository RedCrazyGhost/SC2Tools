(function (global) {
  "use strict";

  const cfg = global.SC2_ANALYTICS_CONFIG || {};
  const measurementId = String(cfg.measurementId || "").trim();
  if (!measurementId) return;

  let loaded = false;
  function loadGa() {
    if (loaded) return;
    loaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    global.dataLayer = global.dataLayer || [];
    global.gtag = global.gtag || function gtag() { global.dataLayer.push(arguments); };
    global.gtag("js", new Date());
    global.gtag("config", measurementId);
    (function notifyAnalyticsLoaded(retry) {
      if (global.SC2Analytics && typeof global.SC2Analytics.trackPageView === "function") {
        global.SC2Analytics.trackPageView();
        return;
      }
      if (retry > 0) {
        global.setTimeout(function () {
          notifyAnalyticsLoaded(retry - 1);
        }, 300);
      }
    })(5);
  }

  global.addEventListener("pointerdown", loadGa, { once: true, passive: true });
  global.addEventListener("keydown", loadGa, { once: true, passive: true });
  if ("requestIdleCallback" in global) {
    global.requestIdleCallback(loadGa, { timeout: 2000 });
  } else {
    global.setTimeout(loadGa, 1500);
  }
})(window);

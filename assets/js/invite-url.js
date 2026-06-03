(function () {
  "use strict";

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

  var PROD_INVITE_API_HOST = "api.redcrazyghost.vip";
  var DEV_INVITE_API_BASE = "http://127.0.0.1:8080";

  function isLocalDevHost(hostname) {
    hostname = String(hostname || "").toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      /\.local$/i.test(hostname)
    );
  }

  /** 本地静态站：固定指向本机 invite-service */
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

  /** 生产环境默认 API（与当前页协议一致，避免 HTTPS 页面请求 HTTP 被拦截） */
  function productionApiFallback() {
    var proto = "https:";
    try {
      if (window.location && window.location.protocol === "http:") {
        proto = "http:";
      }
    } catch (e) {
      /* ignore */
    }
    return proto + "//" + PROD_INVITE_API_HOST;
  }

  /** API 基址：meta → localStorage → 本地 8080 → 生产 api.redcrazyghost.vip */
  function apiBase() {
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

  /** 静态站基址（分享链接用）：meta sc2-invite-static-base，否则当前页 origin */
  function staticBase() {
    var fromMeta = trimBase(metaContent("sc2-invite-static-base"));
    if (fromMeta) {
      return fromMeta;
    }
    return trimBase(window.location.origin || "");
  }

  /** 公开展示页 URL，仅含 key，不含 API 地址 */
  function viewPageUrl(inviteKey) {
    inviteKey = String(inviteKey || "").trim();
    if (!inviteKey) {
      return "";
    }
    try {
      var u = new URL("tools/invite-view.html", staticBase() + "/");
      u.searchParams.set("key", inviteKey);
      return u.href;
    } catch (e) {
      return staticBase() + "/tools/invite-view.html?key=" + encodeURIComponent(inviteKey);
    }
  }

  function publicInviteJsonUrl(inviteKey) {
    return apiBase() + "/api/v1/public/invites/by-key/" + encodeURIComponent(inviteKey);
  }

  function publicInviteCalendarUrl(inviteKey) {
    return apiBase() + "/api/v1/public/invites/by-key/" + encodeURIComponent(inviteKey) + "/calendar.ics";
  }

  function assetsBase() {
    var fromMeta = trimBase(metaContent("sc2-invite-assets-base"));
    if (fromMeta) {
      return fromMeta;
    }
    fromMeta = trimBase(metaContent("sc2-invite-static-base"));
    if (fromMeta) {
      return fromMeta;
    }
    return trimBase(window.location.origin || "");
  }

  function assetUrl(relativePath) {
    relativePath = String(relativePath || "").replace(/^\/+/, "");
    if (!relativePath) {
      return "";
    }
    try {
      return new URL(relativePath, assetsBase() + "/").href;
    } catch (e) {
      return assetsBase() + "/" + relativePath;
    }
  }

  function posterAssetUrl(posterId) {
    posterId = String(posterId || "").trim();
    if (!posterId || !window.sc2InviteValidate || typeof window.sc2InviteValidate.posterAssetPath !== "function") {
      return "";
    }
    var rel = window.sc2InviteValidate.posterAssetPath(posterId);
    return rel ? assetUrl(rel) : "";
  }

  window.sc2InviteUrl = {
    apiBase: apiBase,
    staticBase: staticBase,
    assetsBase: assetsBase,
    assetUrl: assetUrl,
    posterAssetUrl: posterAssetUrl,
    viewPageUrl: viewPageUrl,
    publicInviteJsonUrl: publicInviteJsonUrl,
    publicInviteCalendarUrl: publicInviteCalendarUrl
  };
})();

(function () {
  "use strict";

  var FB = {
    "head.inviteView.title": "查看组队匹配 - 星际争霸2工具站",
    "inviteView.loading": "正在加载邀请…",
    "inviteView.missingKey": "链接缺少邀请码，请使用完整分享链接打开。",
    "inviteView.invalidKey": "邀请码格式不正确，请使用完整分享链接打开。",
    "inviteView.notFound": "未找到该邀请，链接可能不正确或已删除。",
    "inviteView.gone": "此邀请链接已失效。",
    "inviteView.networkError": "网络异常，请稍后重试。",
    "inviteApi.serviceUnavailable": "邀请服务暂时不可用，请稍后重试。",
    "inviteApi.retry": "重试",
    "inviteApi.checking": "正在检查服务状态…",
    "inviteView.badResponse": "接口返回异常（HTTP {status}），请刷新或稍后重试。",
    "inviteView.parseError": "接口数据无法解析，请确认后端版本与页面一致。",
    "inviteView.parseErrorHtml":
      "接口返回了网页而不是 JSON（当前请求：{url}）。请确认 invite-service 在 8080 运行，或检查页面 meta sc2-invite-api-base。",
    "inviteView.qrError": "二维码生成失败，请使用上方分享链接打开。",
    "inviteView.cardTitle": "合作组队匹配",
    "inviteView.noteLabel": "说明",
    "inviteView.viewCount": "本页累计查看次数：",
    "inviteView.expiresAt": "展示有效期至：",
    "inviteView.footer": "内容由邀请方提供 · 星际争霸2工具站",
    "inviteView.calendarDownload": "下载合作任务日历（.ics）",
    "inviteView.calendarBuildError": "无法生成日历文件，请稍后重试。",
    "inviteView.calendarPreviewIcsOnly": "此邀请仅提供日历文件下载，暂无任务明细预览。",
    "inviteView.calendarPreviewLoadError": "无法加载日历预览，请刷新页面或下载 .ics 文件。",
    "inviteView.posterExpand": "展开",
    "inviteView.posterCollapse": "收起",
    "teamInvite.poster.protossWantYou.alt": "I WANT YOU FOR PROTOSS 招募海报"
  };

  function t(key) {
    if (window.SC2I18n && typeof window.SC2I18n.t === "function") {
      var fromI18n = window.SC2I18n.t(key);
      if (fromI18n && fromI18n !== key) {
        return fromI18n;
      }
    }
    return FB[key] || key;
  }

  function apiBaseFromPage() {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.apiBase === "function") {
      return window.sc2InviteUrl.apiBase();
    }
    return String(window.location.origin || "").replace(/\/+$/, "");
  }

  function viewPageUrl(inviteKey) {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.viewPageUrl === "function") {
      return window.sc2InviteUrl.viewPageUrl(inviteKey);
    }
    return (
      String(window.location.origin || "").replace(/\/+$/, "") +
      "/tools/invite-view.html?key=" +
      encodeURIComponent(inviteKey)
    );
  }

  function publicCalendarUrl(inviteKey) {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.publicInviteCalendarUrl === "function") {
      return window.sc2InviteUrl.publicInviteCalendarUrl(inviteKey);
    }
    return apiBaseFromPage() + "/api/v1/public/invites/by-key/" + encodeURIComponent(inviteKey) + "/calendar.ics";
  }

  function keyFromPage() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("key") || params.get("slug") || "").trim();
  }

  function looksLikeHtml(text) {
    var s = String(text || "").trim().slice(0, 256).toLowerCase();
    return s.indexOf("<!doctype") === 0 || s.indexOf("<html") === 0 || s.indexOf("<!doctype html") === 0;
  }

  function parseErrorMessage(url, raw) {
    if (looksLikeHtml(raw)) {
      return t("inviteView.parseErrorHtml").replace(/\{url\}/g, url || "");
    }
    return t("inviteView.parseError");
  }

  function parseCalendarPlan(data) {
    var p = data.calendar_plan;
    if (p == null || p === "") {
      return null;
    }
    if (typeof p === "string") {
      try {
        p = JSON.parse(p);
      } catch (e) {
        return null;
      }
    }
    if (!p || !Array.isArray(p.tasks) || !p.tasks.length) {
      return null;
    }
    return p;
  }

  function coopExportModuleUrl() {
    var params = new URLSearchParams(window.location.search);
    var base = (params.get("assets") || "").trim().replace(/\/+$/, "");
    if (base) {
      return base + "/assets/js/coop-xp-export.js";
    }
    var m = document.querySelector('meta[name="sc2-invite-assets-base"]');
    var metaBase = (m && m.content ? String(m.content) : "").trim().replace(/\/+$/, "");
    if (metaBase) {
      return metaBase + "/assets/js/coop-xp-export.js";
    }
    try {
      return new URL("../assets/js/coop-xp-export.js", window.location.href).href;
    } catch (e) {
      return "";
    }
  }

  function downloadCalendarFromPlan(plan) {
    var url = coopExportModuleUrl();
    if (!url) {
      window.alert(t("inviteView.calendarBuildError"));
      return;
    }
    return import(url)
      .then(function (mod) {
        if (!mod || typeof mod.exportTasksAsIcs !== "function") {
          throw new Error("export");
        }
        var ex = plan.export || {};
        var viewDate = ex.viewDate ? new Date(ex.viewDate) : new Date();
        var r = mod.exportTasksAsIcs(plan.tasks, {
          scope: ex.scope || "all",
          startTime: ex.startTime || "20:00",
          viewDate: viewDate,
          skipDownload: false,
          filename: "sc2-coop-invite.ics",
          difficultyLabels: ex.difficultyLabels || {},
          texts: ex.texts || {}
        });
        if (!r || !r.ok) {
          window.alert(t("inviteView.calendarBuildError"));
        }
      })
      .catch(function () {
        window.alert(t("inviteView.calendarBuildError"));
      });
  }

  function show(el) {
    if (el) {
      el.hidden = false;
    }
  }

  function hide(el) {
    if (el) {
      el.hidden = true;
    }
  }

  function renderInviteQrCode(container, text) {
    return new Promise(function (resolve, reject) {
      if (!container || !text) {
        reject(new Error("args"));
        return;
      }
      if (typeof QRCode !== "function" || !QRCode.CorrectLevel) {
        reject(new Error("qrcode_load"));
        return;
      }
      container.innerHTML = "";
      var holder = document.createElement("div");
      holder.className = "sc2-qrcode-holder";
      container.appendChild(holder);
      var L = QRCode.CorrectLevel.L;
      var M = QRCode.CorrectLevel.M;
      var configs = [
        { w: 160, h: 160, lvl: M },
        { w: 160, h: 160, lvl: L },
        { w: 140, h: 140, lvl: L },
        { w: 120, h: 120, lvl: L },
        { w: 100, h: 100, lvl: L }
      ];
      var lastErr = null;
      for (var i = 0; i < configs.length; i++) {
        holder.innerHTML = "";
        try {
          new QRCode(holder, {
            text: text,
            width: configs[i].w,
            height: configs[i].h,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: configs[i].lvl
          });
          resolve();
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      reject(lastErr || new Error("qrcode_render"));
    });
  }

  function renderCalendarPreview(hostEl, plan, downloadOpts) {
    var root = typeof window !== "undefined" ? window : globalThis;
    if (root.sc2InviteCalendarPreview && typeof root.sc2InviteCalendarPreview.render === "function") {
      return root.sc2InviteCalendarPreview.render(hostEl, plan, { t: t, download: downloadOpts });
    }
    return false;
  }

  function calendarDownloadOpts(plan, inviteKey) {
    var label = t("inviteView.calendarDownload");
    if (plan) {
      return {
        label: label,
        onClick: function () {
          downloadCalendarFromPlan(plan);
        }
      };
    }
    return {
      label: label,
      href: publicCalendarUrl(inviteKey)
    };
  }

  function appendCalendarDownloadToHead(headEl, downloadOpts) {
    var preview = typeof window !== "undefined" ? window.sc2InviteCalendarPreview : null;
    if (!headEl || !downloadOpts || !preview || typeof preview.createDownloadControl !== "function") {
      return;
    }
    headEl.appendChild(preview.createDownloadControl(downloadOpts));
  }

  function paintQR(container, url) {
    if (!container || !url) {
      return;
    }
    container.innerHTML = "";
    renderInviteQrCode(container, url).catch(function () {
      container.textContent = t("inviteView.qrError");
    });
  }

  var lastOk = null;

  function posterImageUrl(posterId) {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.posterAssetUrl === "function") {
      return window.sc2InviteUrl.posterAssetUrl(posterId);
    }
    if (window.sc2InviteValidate && typeof window.sc2InviteValidate.posterAssetPath === "function") {
      var rel = window.sc2InviteValidate.posterAssetPath(posterId);
      if (!rel) {
        return "";
      }
      try {
        return new URL("../" + rel.replace(/^\/+/, ""), window.location.href).href;
      } catch (e) {
        return "../" + rel.replace(/^\/+/, "");
      }
    }
    return "";
  }

  function clearPosterRail() {
    var existing = document.querySelector(".invite-pub-poster-rail");
    if (existing) {
      existing.remove();
    }
    var mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.classList.remove("invite-view-main--has-poster");
    }
    var card = document.querySelector(".invite-pub-card");
    if (card) {
      card.classList.remove("invite-pub-card--has-poster");
    }
  }

  function posterToggleIconSvg(expanded) {
    if (expanded) {
      return (
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M14.7 6.3a1 1 0 0 1 0 1.4L10.41 12l4.3 4.3a1 1 0 1 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.41 0Z"/>' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M9.3 17.7a1 1 0 0 1 0-1.4L13.59 12l-4.3-4.3a1 1 0 0 1 1.42-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.41 0Z"/>' +
      "</svg>"
    );
  }

  function syncPosterToggleButton(button, expanded) {
    if (!button) {
      return;
    }
    var labelKey = expanded ? "inviteView.posterCollapse" : "inviteView.posterExpand";
    var label = t(labelKey);
    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("data-i18n-aria-label", labelKey);
    button.setAttribute("data-i18n-title", labelKey);
    button.innerHTML = posterToggleIconSvg(expanded);
  }

  function createPosterRail(posterId) {
    posterId = String(posterId || "").trim();
    if (!posterId) {
      return null;
    }
    var src = posterImageUrl(posterId);
    if (!src) {
      return null;
    }
    var rail = document.createElement("aside");
    rail.className = "invite-pub-poster-rail";
    rail.setAttribute("aria-label", t("teamInvite.poster.protossWantYou.alt"));

    var viewport = document.createElement("div");
    viewport.className = "invite-pub-poster-viewport";

    var figure = document.createElement("figure");
    figure.className = "invite-pub-poster";
    var img = document.createElement("img");
    img.className = "invite-pub-poster-img";
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    figure.appendChild(img);
    viewport.appendChild(figure);
    rail.appendChild(viewport);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "invite-pub-poster-rail-toggle";
    syncPosterToggleButton(toggle, false);
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var expanded = rail.classList.toggle("is-expanded");
      syncPosterToggleButton(toggle, expanded);
    });
    rail.appendChild(toggle);

    return rail;
  }

  function mountPosterRail(posterId) {
    clearPosterRail();
    var rail = createPosterRail(posterId);
    if (!rail) {
      return null;
    }
    var mainEl = document.getElementById("main-content");
    if (mainEl) {
      mainEl.classList.add("invite-view-main--has-poster");
      mainEl.insertBefore(rail, mainEl.firstChild);
    }
    var card = document.querySelector(".invite-pub-card");
    if (card) {
      card.classList.add("invite-pub-card--has-poster");
    }
    return rail;
  }

  function renderOk(data, apiBase, inviteKey) {
    var loading = document.getElementById("invite-view-loading");
    var err = document.getElementById("invite-view-error");
    var content = document.getElementById("invite-view-content");
    hide(loading);
    hide(err);
    show(content);
    if (!content) {
      return;
    }
    content.innerHTML = "";

    mountPosterRail(data.poster);

    var pageUrl = viewPageUrl(inviteKey);

    var head = document.createElement("div");
    head.className = "invite-pub-head";

    var headMain = document.createElement("div");
    headMain.className = "invite-pub-head-main";

    var titleText = String(data.title || "").trim();
    var h1 = document.createElement("h1");
    h1.className = "invite-pub-title";
    h1.textContent = titleText || t("inviteView.cardTitle");

    var btag = document.createElement("p");
    btag.className = "invite-pub-btag";
    var strong = document.createElement("strong");
    strong.setAttribute("data-i18n", "teamInvite.blizzardId");
    strong.textContent = t("teamInvite.blizzardId");
    var span = document.createElement("span");
    span.textContent = data.blizzard_id || "";
    btag.appendChild(strong);
    btag.appendChild(document.createTextNode(" "));
    btag.appendChild(span);

    headMain.appendChild(h1);
    headMain.appendChild(btag);

    if (data.note && String(data.note).trim()) {
      var noteWrap = document.createElement("div");
      noteWrap.className = "invite-pub-note";
      var noteLabel = document.createElement("span");
      noteLabel.className = "invite-pub-note-label";
      noteLabel.setAttribute("data-i18n", "inviteView.noteLabel");
      noteLabel.textContent = t("inviteView.noteLabel");
      noteWrap.appendChild(noteLabel);
      noteWrap.appendChild(document.createTextNode(data.note));
      headMain.appendChild(noteWrap);
    }

    var headQr = document.createElement("div");
    headQr.className = "invite-pub-head-qr";
    var qrWrap = document.createElement("div");
    qrWrap.className = "invite-pub-qr-wrap";
    headQr.appendChild(qrWrap);

    head.appendChild(headMain);
    head.appendChild(headQr);
    content.appendChild(head);

    paintQR(qrWrap, pageUrl);

    var plan = data.has_calendar ? parseCalendarPlan(data) : null;

    if (data.has_calendar) {
      var calSection = document.createElement("section");
      calSection.className = "invite-pub-section";
      var downloadOpts = calendarDownloadOpts(plan, inviteKey);

      var calHost = document.createElement("div");
      calHost.className = "invite-pub-calendar-host";

      if (plan && renderCalendarPreview(calHost, plan, downloadOpts)) {
        calSection.appendChild(calHost);
      } else if (plan) {
        var sectionHead = document.createElement("div");
        sectionHead.className = "invite-pub-section-head";
        appendCalendarDownloadToHead(sectionHead, downloadOpts);
        if (sectionHead.childNodes.length) {
          calSection.appendChild(sectionHead);
        }
        calSection.appendChild(calHost);
        var fallback = document.createElement("p");
        fallback.className = "invite-pub-meta";
        fallback.textContent = t("inviteView.calendarPreviewLoadError");
        calSection.appendChild(fallback);
      } else {
        var sectionHeadIcs = document.createElement("div");
        sectionHeadIcs.className = "invite-pub-section-head";
        appendCalendarDownloadToHead(sectionHeadIcs, downloadOpts);
        if (sectionHeadIcs.childNodes.length) {
          calSection.appendChild(sectionHeadIcs);
        }
        var calHint = document.createElement("p");
        calHint.className = "invite-pub-meta";
        calHint.setAttribute("data-i18n", "inviteView.calendarPreviewIcsOnly");
        calHint.textContent = t("inviteView.calendarPreviewIcsOnly");
        calSection.appendChild(calHint);
      }
      content.appendChild(calSection);
    }

    var foot = document.createElement("div");
    foot.className = "invite-pub-foot";

    var shareBlock = document.createElement("div");
    shareBlock.className = "invite-pub-share-block";
    var linkLabel = document.createElement("p");
    linkLabel.className = "invite-pub-qr-label";
    var lk = document.createElement("strong");
    lk.setAttribute("data-i18n", "teamInvite.shortUrl");
    lk.textContent = t("teamInvite.shortUrl");
    linkLabel.appendChild(lk);
    shareBlock.appendChild(linkLabel);

    var linkLine = document.createElement("p");
    linkLine.className = "invite-pub-share-line";
    var a = document.createElement("a");
    a.href = pageUrl || "#";
    a.rel = "noopener noreferrer";
    a.textContent = pageUrl || "";
    linkLine.appendChild(a);
    shareBlock.appendChild(linkLine);
    foot.appendChild(shareBlock);

    var meta = document.createElement("p");
    meta.className = "invite-pub-meta";
    meta.setAttribute("data-i18n", "inviteView.viewCount");
    meta.textContent = t("inviteView.viewCount") + String(data.view_count != null ? data.view_count : "");
    foot.appendChild(meta);

    if (data.expires_at) {
      var exp = document.createElement("p");
      exp.className = "invite-pub-meta";
      exp.setAttribute("data-i18n", "inviteView.expiresAt");
      var expLabel = t("inviteView.expiresAt");
      var expVal = "";
        try {
          expVal = new Date(data.expires_at).toLocaleString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          });
        } catch (e) {
        expVal = String(data.expires_at);
      }
      exp.textContent = expLabel + expVal;
      foot.appendChild(exp);
    }

    content.appendChild(foot);

    document.title =
      (titleText || (data.blizzard_id ? String(data.blizzard_id) : "")) +
      (titleText || data.blizzard_id ? " · " : "") +
      t("head.inviteView.title");
  }

  function renderError(message, showRetry) {
    clearPosterRail();
    var loading = document.getElementById("invite-view-loading");
    var err = document.getElementById("invite-view-error");
    var content = document.getElementById("invite-view-content");
    hide(loading);
    hide(content);
    show(err);
    if (err) {
      err.innerHTML = "";
      var msgEl = document.createElement("span");
      msgEl.textContent = message;
      err.appendChild(msgEl);
      if (showRetry) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "invite-api-retry-btn";
        btn.textContent = t("inviteApi.retry");
        btn.addEventListener("click", function () {
          if (window.sc2InviteApi && typeof window.sc2InviteApi.checkHealth === "function") {
            window.sc2InviteApi.checkHealth({ force: true });
          }
          fetchAndRender();
        });
        err.appendChild(btn);
      }
    }
    document.title = t("head.inviteView.title");
  }

  function fetchAndRender() {
    var inviteKey = keyFromPage();
    var apiBase = apiBaseFromPage();
    var loadingEl = document.getElementById("invite-view-loading");
    if (loadingEl) {
      loadingEl.setAttribute("data-i18n", "inviteView.loading");
      loadingEl.textContent = t("inviteView.loading");
    }
    if (!inviteKey) {
      lastOk = null;
      renderError(t("inviteView.missingKey"));
      return;
    }
    if (window.sc2InviteValidate && !window.sc2InviteValidate.validInviteKey(inviteKey)) {
      lastOk = null;
      renderError(t("inviteView.invalidKey"));
      return;
    }
    if (!apiBase) {
      lastOk = null;
      renderError(t("inviteApi.serviceUnavailable"), true);
      return;
    }
    var url =
      window.sc2InviteUrl && typeof window.sc2InviteUrl.publicInviteJsonUrl === "function"
        ? window.sc2InviteUrl.publicInviteJsonUrl(inviteKey)
        : apiBase + "/api/v1/public/invites/by-key/" + encodeURIComponent(inviteKey);
    fetch(url, { cache: "no-store", credentials: "omit" })
      .then(function (res) {
        return res.text().then(function (text) {
          var body = null;
          var parseFailed = false;
          if (text) {
            try {
              body = JSON.parse(text);
            } catch (e) {
              parseFailed = true;
              body = null;
            }
          }
          return { res: res, body: body, parseFailed: parseFailed, raw: text };
        });
      })
      .then(function (ref) {
        var res = ref.res;
        var body = ref.body;
        if (res.ok && body && typeof body === "object") {
          lastOk = { data: body, apiBase: apiBase, inviteKey: inviteKey };
          try {
            renderOk(body, apiBase, inviteKey);
          } catch (renderErr) {
            console.error("invite-view render failed", renderErr);
            renderError(t("inviteView.parseError"));
          }
          return;
        }
        lastOk = null;
        if (res.status === 404) {
          renderError((body && body.message) || t("inviteView.notFound"));
          return;
        }
        if (res.status === 410) {
          renderError((body && body.message) || t("inviteView.gone"));
          return;
        }
        if (ref.parseFailed) {
          console.error("invite-view JSON parse failed", {
            url: url,
            status: res.status,
            preview: String(ref.raw || "").slice(0, 240)
          });
        }
        if (res.ok && ref.parseFailed) {
          renderError(parseErrorMessage(url, ref.raw));
          return;
        }
        if (res.ok && !body) {
          renderError(parseErrorMessage(url, ref.raw));
          return;
        }
        renderError(
          t("inviteView.badResponse").replace(/\{status\}/g, String(res.status || ""))
        );
      })
      .catch(function (err) {
        lastOk = null;
        console.error("invite-view fetch failed", err);
        renderError(t("inviteApi.serviceUnavailable"), true);
      });
  }

  function boot() {
    fetchAndRender();
    window.addEventListener("sc2tool:languagechange", function () {
      if (lastOk) {
        renderOk(lastOk.data, lastOk.apiBase, lastOk.inviteKey);
      } else {
        var loadingEl = document.getElementById("invite-view-loading");
        if (loadingEl && !loadingEl.hidden) {
          loadingEl.setAttribute("data-i18n", "inviteView.loading");
          loadingEl.textContent = t("inviteView.loading");
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

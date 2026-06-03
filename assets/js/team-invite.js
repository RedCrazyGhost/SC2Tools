(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function t(key) {
    return (window.SC2I18n && window.SC2I18n.t(key)) || key;
  }

  function baseURL() {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.apiBase === "function") {
      return window.sc2InviteUrl.apiBase();
    }
    var m = document.querySelector('meta[name="sc2-invite-api-base"]');
    if (m && m.content) {
      return String(m.content).trim().replace(/\/+$/, "");
    }
    return String(window.location.origin || "").replace(/\/+$/, "");
  }

  function jsonHeaders() {
    return { "Content-Type": "application/json" };
  }

  function applyIntro() {
    var el = $("teamInviteIntro");
    if (!el) {
      return;
    }
    el.textContent = t("teamInvite.introProd");
  }

  function serviceUnavailableMessage() {
    return t("inviteApi.serviceUnavailable");
  }

  function setPageStatus(msg, isErr) {
    var el = $("statusLine");
    if (!el) {
      return;
    }
    el.textContent = msg || "";
    el.classList.toggle("text-error", !!isErr && !!msg);
    el.classList.remove("text-success");
  }

  function ensureApiBanner() {
    if (!$("inviteList")) {
      return null;
    }
    var statusEl = $("statusLine");
    if (!statusEl) {
      return null;
    }
    var banner = $("inviteApiBanner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "inviteApiBanner";
      banner.className = "invite-api-banner";
      banner.hidden = true;
      banner.setAttribute("role", "status");
      statusEl.parentNode.insertBefore(banner, statusEl);
    }
    return banner;
  }

  function updateInviteApiBanner(available) {
    if (!$("inviteList")) {
      return;
    }
    var banner = ensureApiBanner();
    if (!banner) {
      return;
    }
    if (available === false) {
      banner.hidden = false;
      banner.innerHTML = "";
      var msg = document.createElement("span");
      msg.className = "invite-api-banner-text";
      msg.textContent = serviceUnavailableMessage();
      banner.appendChild(msg);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "inviteApiBannerRetry";
      btn.className = "invite-api-retry-btn";
      btn.textContent = t("inviteApi.retry");
      btn.addEventListener("click", retryListLoad);
      banner.appendChild(btn);
    } else {
      banner.hidden = true;
      banner.innerHTML = "";
    }
  }

  async function retryListLoad() {
    if (window.sc2InviteApi && typeof window.sc2InviteApi.checkHealth === "function") {
      var status = await window.sc2InviteApi.checkHealth({ force: true });
      updateInviteApiBanner(status.available);
      if (status.available === false) {
        var list = $("inviteList");
        if (list) {
          list.innerHTML = "";
        }
        setPageStatus("", false);
        return;
      }
    }
    loadList();
  }

  function setModalStatus(msg, isErr) {
    var el = $("modalStatusLine");
    if (!el) {
      return;
    }
    el.textContent = msg || "";
    el.classList.toggle("text-error", !!isErr && !!msg);
    el.classList.toggle("text-success", !isErr && !!msg);
  }

  function resetModalView() {
    var wrap = $("inviteModalFormWrap");
    var result = $("inviteModalResult");
    var title = $("inviteModalTitle");
    if (wrap) {
      wrap.hidden = false;
    }
    if (result) {
      result.hidden = true;
    }
    if (title) {
      title.textContent = t("teamInvite.modalTitle");
    }
    setModalStatus("");
    var qr = $("qrWrap");
    if (qr) {
      qr.innerHTML = "";
    }
  }

  function parseApiErrorMessage(text) {
    if (!text) {
      return "";
    }
    try {
      var j = JSON.parse(text);
      if (j && j.message) {
        return String(j.message);
      }
    } catch (e) {
      /* plain text */
    }
    return String(text).trim();
  }

  function showValidationResult(result) {
    var V = window.sc2InviteValidate;
    if (!V || !result || result.ok) {
      return false;
    }
    setModalStatus(V.formatMessage(t, result), true);
    return true;
  }

  function isModalOpen() {
    return document.documentElement.classList.contains("team-invite-modal-open");
  }

  function prefetchCoopCalendarIntoInviteForm() {
    var chk = $("includeCoopCalendar");
    if (!chk || typeof window.sc2CoopGetCalendarPlanPayload !== "function") {
      return;
    }
    var plan = window.sc2CoopGetCalendarPlanPayload();
    chk.checked = !!(plan && plan.tasks && plan.tasks.length);
  }

  function openInviteModal() {
    var modal = $("inviteModal");
    if (!modal) {
      return;
    }
    modal.removeAttribute("hidden");
    document.documentElement.classList.add("team-invite-modal-open");
    resetModalView();
    resetInviteExpiresAtField();
    prefetchCoopCalendarIntoInviteForm();
    var posterChk = $("includeInvitePoster");
    if (posterChk) {
      posterChk.checked = false;
    }
    var first = $("inviteTitle") || $("blizzardId");
    if (first) {
      setTimeout(function () {
        first.focus();
      }, 0);
    }
  }

  function closeInviteModal() {
    var modal = $("inviteModal");
    if (!modal) {
      document.documentElement.classList.remove("team-invite-modal-open");
      return;
    }
    modal.setAttribute("hidden", "");
    document.documentElement.classList.remove("team-invite-modal-open");
    resetModalView();
  }

  function qrRenderSize(container) {
    if (!container) {
      return 160;
    }
    var w = container.clientWidth || 0;
    if (w < 80) {
      w = 280;
    }
    return Math.min(Math.max(Math.floor(w), 100), 480);
  }

  function renderInviteQrCode(container, text, opts) {
    opts = opts || {};
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
      var base = opts.fullWidth ? qrRenderSize(container) : 160;
      var configs = [
        { w: base, h: base, lvl: M },
        { w: base, h: base, lvl: L },
        { w: Math.max(100, base - 20), h: Math.max(100, base - 20), lvl: L },
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

  function resetInviteExpiresAtField() {
    var el = $("inviteExpiresAt");
    if (!el) {
      return;
    }
    var V = window.sc2InviteValidate;
    if (V && typeof V.applyExpiresAtInputBounds === "function") {
      V.applyExpiresAtInputBounds(el);
    }
    if (V && typeof V.defaultExpiresAtLocal === "function") {
      el.value = V.defaultExpiresAtLocal();
    }
  }

  function readExpiresAt() {
    var el = $("inviteExpiresAt");
    if (!el) {
      return "";
    }
    return String(el.value || "").trim();
  }

  function renderQR(url) {
    var wrap = $("qrWrap");
    if (!wrap) {
      return;
    }
    wrap.innerHTML = "";
    if (!url) {
      return;
    }
    renderInviteQrCode(wrap, url).catch(function () {
      wrap.textContent = t("teamInvite.qrError");
      setModalStatus(t("teamInvite.qrError"), true);
    });
  }

  function sharePageUrl(inviteKey) {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.viewPageUrl === "function") {
      return window.sc2InviteUrl.viewPageUrl(inviteKey);
    }
    var s = String(inviteKey || "").trim();
    if (!s) {
      return "";
    }
    return String(window.location.origin || "").replace(/\/+$/, "") + "/tools/invite-view.html?key=" + encodeURIComponent(s);
  }

  function showModalResult(data, statusMsg, isErr) {
    var wrap = $("inviteModalFormWrap");
    var result = $("inviteModalResult");
    var title = $("inviteModalTitle");
    var link = $("resultLink");
    if (!result || !link) {
      return;
    }
    if (wrap) {
      wrap.hidden = true;
    }
    result.hidden = false;
    if (title) {
      title.textContent =
        String(data.title || "").trim() || t("teamInvite.modalResultTitle");
    }
    setModalStatus(statusMsg || "", !!isErr);
    var shareUrl = sharePageUrl(data.key);
    link.href = shareUrl;
    link.textContent = shareUrl;
    var rel = $("resultExpiresLine");
    var rv = $("resultExpiresValue");
    if (rel && rv) {
      if (data.expires_at) {
        rel.hidden = false;
        try {
          rv.textContent = formatExpires(data.expires_at);
        } catch (e) {
          rv.textContent = String(data.expires_at);
        }
      } else {
        rel.hidden = true;
        rv.textContent = "";
      }
    }
    renderQR(shareUrl);
  }

  async function createInvite() {
    var b = baseURL();
    if (!b) {
      setModalStatus(t("teamInvite.networkError"), true);
      return;
    }
    var payload = {
      title: String($("inviteTitle").value || "").trim(),
      blizzard_id: String($("blizzardId").value || "").trim(),
      note: String($("note").value || "").trim(),
      expires_at: readExpiresAt()
    };
    var inc = $("includeCoopCalendar");
    if (inc && inc.checked && typeof window.sc2CoopGetCalendarPlanPayload === "function") {
      var plan = window.sc2CoopGetCalendarPlanPayload();
      if (plan && plan.tasks && plan.tasks.length) {
        payload.calendar_plan = plan;
      }
    }
    var posterChk = $("includeInvitePoster");
    if (posterChk && posterChk.checked) {
      payload.poster = posterChk.value || "protoss-want-you";
    }
    if (window.sc2InviteValidate) {
      var check = window.sc2InviteValidate.validateCreatePayload(payload);
      if (!check.ok) {
        showValidationResult(check);
        return;
      }
      payload = check.value;
    }
    var body = payload;
    var submitBtn = $("modalSubmitInvite");
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    setModalStatus("");
    try {
      var res = await fetch(b + "/api/v1/invites", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(body)
      });
      var text = await res.text();
      var data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = null;
      }
      if (res.status === 409 && data && data.invite) {
        showModalResult(data.invite, t("teamInvite.alreadyExists"), true);
        loadList();
        return;
      }
      if (!res.ok) {
        var apiMsg = parseApiErrorMessage(text);
        setModalStatus(apiMsg || t("teamInvite.error"), true);
        return;
      }
      showModalResult(data, t("teamInvite.createSuccess"), false);
      loadList();
    } catch (e) {
      var unavailable =
        window.sc2InviteApi &&
        typeof window.sc2InviteApi.isNetworkFailure === "function" &&
        window.sc2InviteApi.isNetworkFailure(e);
      setModalStatus(unavailable ? serviceUnavailableMessage() : t("teamInvite.networkError"), true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  }

  function formatExpires(iso) {
    if (!iso) {
      return "";
    }
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch (e) {
      return String(iso);
    }
  }

  function copyTextToClipboard(text) {
    text = String(text || "");
    if (!text) {
      return Promise.reject(new Error("empty"));
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) {
          resolve();
        } else {
          reject(new Error("copy"));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  function cardBtnIconSvg(name) {
    if (name === "open") {
      return (
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>' +
      "</svg>"
    );
  }

  function decorateCardActionBtn(el, iconName, labelText) {
    var iconWrap = document.createElement("span");
    iconWrap.className = "team-invite-list-card-btn-icon";
    iconWrap.innerHTML = cardBtnIconSvg(iconName);
    el.appendChild(iconWrap);
    var label = document.createElement("span");
    label.className = "team-invite-list-card-btn-label";
    label.textContent = labelText;
    el.appendChild(label);
    return label;
  }

  function flashCopyButton(btn) {
    if (!btn) {
      return;
    }
    var label = btn.querySelector(".team-invite-list-card-btn-label");
    var prev = label ? label.textContent : btn.textContent;
    if (label) {
      label.textContent = t("teamInvite.copyLinkDone");
    } else {
      btn.textContent = t("teamInvite.copyLinkDone");
    }
    btn.disabled = true;
    setTimeout(function () {
      if (label) {
        label.textContent = prev;
      } else {
        btn.textContent = prev;
      }
      btn.disabled = false;
    }, 1400);
  }

  function buildListCard(row) {
    var card = document.createElement("article");
    card.className = "team-invite-list-card";

    var shareUrl = sharePageUrl(row.key);
    var titleText = String(row.title || "").trim() || String(row.blizzard_id || "");

    var head = document.createElement("header");
    head.className = "team-invite-list-card-head";

    var headMain = document.createElement("div");
    headMain.className = "team-invite-list-card-head-main";

    var titleEl = document.createElement("h4");
    titleEl.className = "team-invite-list-card-title";
    titleEl.textContent = titleText;
    headMain.appendChild(titleEl);

    var btag = document.createElement("p");
    btag.className = "team-invite-list-card-btag";
    var btagLabel = document.createElement("strong");
    btagLabel.textContent = t("teamInvite.blizzardId");
    var btagValue = document.createElement("span");
    btagValue.textContent = row.blizzard_id || "";
    btag.appendChild(btagLabel);
    btag.appendChild(document.createTextNode(" "));
    btag.appendChild(btagValue);
    headMain.appendChild(btag);

    if (row.note && String(row.note).trim()) {
      var note = document.createElement("div");
      note.className = "team-invite-list-card-note";
      var noteLabel = document.createElement("span");
      noteLabel.className = "team-invite-list-card-note-label";
      noteLabel.textContent = t("teamInvite.note");
      note.appendChild(noteLabel);
      note.appendChild(document.createTextNode(row.note));
      headMain.appendChild(note);
    }

    var chips = document.createElement("div");
    chips.className = "team-invite-list-card-chips";
    if (row.view_count != null) {
      var viewsChip = document.createElement("span");
      viewsChip.className = "team-invite-list-card-chip";
      viewsChip.textContent = t("teamInvite.colViews") + " " + String(row.view_count);
      chips.appendChild(viewsChip);
    }
    if (row.expires_at) {
      var expChip = document.createElement("span");
      expChip.className = "team-invite-list-card-chip team-invite-list-card-chip--expires";
      expChip.textContent = t("teamInvite.colExpires") + " " + formatExpires(row.expires_at);
      chips.appendChild(expChip);
    }
    if (row.has_calendar) {
      var calChip = document.createElement("span");
      calChip.className = "team-invite-list-card-chip team-invite-list-card-chip--calendar";
      calChip.textContent = t("teamInvite.hasCalendar");
      chips.appendChild(calChip);
    }
    if (chips.childNodes.length) {
      headMain.appendChild(chips);
    }

    head.appendChild(headMain);
    card.appendChild(head);

    if (shareUrl) {
      var qrBlock = document.createElement("div");
      qrBlock.className = "team-invite-list-card-qr-block";
      var qrWrap = document.createElement("div");
      qrWrap.className = "team-invite-list-card-qr-wrap";
      qrBlock.appendChild(qrWrap);
      card.appendChild(qrBlock);
      card._qrPending = { wrap: qrWrap, url: shareUrl, block: qrBlock };
    }

    var foot = document.createElement("footer");
    foot.className = "team-invite-list-card-foot";

    var actions = document.createElement("div");
    actions.className = "team-invite-list-card-actions";
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "team-invite-list-card-btn";
    decorateCardActionBtn(copyBtn, "copy", t("teamInvite.copyLink"));
    copyBtn.addEventListener("click", function () {
      copyTextToClipboard(shareUrl)
        .then(function () {
          flashCopyButton(copyBtn);
        })
        .catch(function () {
          setPageStatus(t("teamInvite.error"), true);
        });
    });
    actions.appendChild(copyBtn);
    if (shareUrl) {
      var openLink = document.createElement("a");
      openLink.className = "team-invite-list-card-btn";
      openLink.href = shareUrl;
      openLink.target = "_blank";
      openLink.rel = "noopener noreferrer";
      decorateCardActionBtn(openLink, "open", t("teamInvite.openLink"));
      actions.appendChild(openLink);
    }
    foot.appendChild(actions);
    card.appendChild(foot);

    return card;
  }

  function renderListLoading(list) {
    list.innerHTML = "";
    var loading = document.createElement("p");
    loading.className = "team-invite-list-empty team-invite-list-loading";
    loading.textContent = t("teamInvite.listLoading");
    list.appendChild(loading);
  }

  function paintListCardQr(card) {
    if (!card || !card._qrPending) {
      return;
    }
    var pending = card._qrPending;
    delete card._qrPending;
    requestAnimationFrame(function () {
      renderInviteQrCode(pending.wrap, pending.url, { fullWidth: true }).catch(function () {
        if (pending.block && pending.block.parentNode) {
          pending.block.remove();
        }
      });
    });
  }

  async function loadList() {
    var b = baseURL();
    var list = $("inviteList");
    if (!list) {
      return;
    }
    if (window.sc2InviteApi && window.sc2InviteApi.isAvailable() === false) {
      list.innerHTML = "";
      setPageStatus("", false);
      return;
    }
    renderListLoading(list);
    if (!b) {
      updateInviteApiBanner(false);
      list.innerHTML = "";
      setPageStatus("", false);
      return;
    }
    try {
      var res = await fetch(b + "/api/v1/invites?status=active");
      if (!res.ok) {
        list.innerHTML = "";
        setPageStatus(t("teamInvite.error"), true);
        return;
      }
      updateInviteApiBanner(true);
      setPageStatus("");
      var rows = await res.json();
      list.innerHTML = "";
      if (!rows.length) {
        var empty = document.createElement("p");
        empty.className = "team-invite-list-empty";
        empty.textContent = t("teamInvite.emptyList");
        list.appendChild(empty);
        return;
      }
      rows.forEach(function (row) {
        var card = buildListCard(row);
        list.appendChild(card);
        paintListCardQr(card);
      });
    } catch (e) {
      list.innerHTML = "";
      if (window.sc2InviteApi && typeof window.sc2InviteApi.checkHealth === "function") {
        await window.sc2InviteApi.checkHealth({ force: true });
        updateInviteApiBanner(window.sc2InviteApi.isAvailable());
      } else {
        updateInviteApiBanner(false);
      }
      setPageStatus("", false);
    }
  }

  async function bootstrapInviteList() {
    if (!$("inviteList")) {
      return;
    }
    if (window.sc2InviteApi && typeof window.sc2InviteApi.checkHealth === "function") {
      await window.sc2InviteApi.checkHealth();
      updateInviteApiBanner(window.sc2InviteApi.isAvailable());
      if (window.sc2InviteApi.isAvailable() === false) {
        $("inviteList").innerHTML = "";
        setPageStatus("", false);
        return;
      }
    }
    loadList();
  }

  function init() {
    applyIntro();

    function wireOpen(btnId) {
      var el = document.getElementById(btnId);
      if (el) {
        el.addEventListener("click", openInviteModal);
      }
    }
    wireOpen("openInviteModal");
    wireOpen("calendar-team-share-btn");

    var refreshBtn = $("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", retryListLoad);
    }
    var submitBtn = $("modalSubmitInvite");
    if (submitBtn) {
      submitBtn.addEventListener("click", createInvite);
    }
    var cancelBtn = $("modalCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeInviteModal);
    }
    var doneBtn = $("modalDoneBtn");
    if (doneBtn) {
      doneBtn.addEventListener("click", closeInviteModal);
    }

    document.querySelectorAll("[data-close-invite-modal]").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        if (ev.target === el) {
          closeInviteModal();
        }
      });
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && isModalOpen()) {
        closeInviteModal();
      }
    });

    window.addEventListener("sc2tool:languagechange", function () {
      applyIntro();
      if ($("inviteList") && window.sc2InviteApi) {
        updateInviteApiBanner(window.sc2InviteApi.isAvailable());
        if (window.sc2InviteApi.isAvailable() === true) {
          loadList();
        }
      }
    });

    if ($("inviteList") && window.sc2InviteApi && typeof window.sc2InviteApi.onStatusChange === "function") {
      window.sc2InviteApi.onStatusChange(function (status) {
        updateInviteApiBanner(status.available);
        if (status.available === false) {
          var list = $("inviteList");
          if (list) {
            list.innerHTML = "";
          }
          setPageStatus("", false);
        }
      });
      bootstrapInviteList();
    } else if ($("inviteList")) {
      loadList();
    }
    resetInviteExpiresAtField();
  }

  if (typeof window !== "undefined") {
    window.sc2OpenTeamInviteModal = openInviteModal;
  }

  document.addEventListener("DOMContentLoaded", init);
})();

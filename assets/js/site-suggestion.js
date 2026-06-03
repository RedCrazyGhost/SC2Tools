(function () {
  "use strict";

  var MAX_CONTENT = 2000;
  var MAX_CONTACT = 120;

  function t(key) {
    return (window.SC2I18n && window.SC2I18n.t(key)) || key;
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

  function apiBase() {
    if (window.sc2InviteUrl && typeof window.sc2InviteUrl.apiBase === "function") {
      return window.sc2InviteUrl.apiBase();
    }
    var m = document.querySelector('meta[name="sc2-invite-api-base"]');
    if (m && m.content) {
      return String(m.content).trim().replace(/\/+$/, "");
    }
    try {
      var ls = String(localStorage.getItem("sc2tool_invite_api_base") || "").trim().replace(/\/+$/, "");
      if (ls) {
        return ls;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (isLocalDevHost(window.location.hostname)) {
        return "http://127.0.0.1:8080";
      }
    } catch (e) {
      /* ignore */
    }
    return "http://api.redcrazyghost.vip";
  }

  function hasDisallowedControlChars(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 0) {
        return true;
      }
      if (c < 32 && c !== 9 && c !== 10 && c !== 13) {
        return true;
      }
    }
    return false;
  }

  function validatePayload(payload) {
    var content = String(payload.content || "").trim();
    if (!content) {
      return { ok: false, key: "siteSuggestion.validation.contentRequired" };
    }
    if (Array.from(content).length > MAX_CONTENT) {
      return { ok: false, key: "siteSuggestion.validation.contentTooLong", params: { max: MAX_CONTENT } };
    }
    if (hasDisallowedControlChars(content)) {
      return { ok: false, key: "siteSuggestion.validation.invalidChars" };
    }
    var contact = String(payload.contact || "").trim();
    if (Array.from(contact).length > MAX_CONTACT) {
      return { ok: false, key: "siteSuggestion.validation.contactTooLong", params: { max: MAX_CONTACT } };
    }
    if (hasDisallowedControlChars(contact)) {
      return { ok: false, key: "siteSuggestion.validation.invalidChars" };
    }
    return {
      ok: true,
      value: {
        content: content,
        page_url: String(payload.page_url || "").trim(),
        contact: contact
      }
    };
  }

  function formatMessage(result) {
    if (!result || result.ok || !result.key) {
      return "";
    }
    var msg = t(result.key);
    if (result.params) {
      Object.keys(result.params).forEach(function (k) {
        msg = msg.replace(new RegExp("\\{" + k + "\\}", "g"), String(result.params[k]));
      });
    }
    return msg;
  }

  function ensureModal() {
    if (document.getElementById("siteSuggestionModal")) {
      return;
    }
    var modal = document.createElement("div");
    modal.id = "siteSuggestionModal";
    modal.className = "site-suggestion-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "siteSuggestionModalTitle");
    modal.innerHTML =
      '<div class="site-suggestion-modal-backdrop" data-site-suggestion-close></div>' +
      '<div class="site-suggestion-modal-panel">' +
      '<div class="site-suggestion-modal-head">' +
      '<h2 id="siteSuggestionModalTitle" data-i18n="siteSuggestion.modalTitle">网站修改建议</h2>' +
      '<button type="button" class="site-suggestion-modal-close" data-site-suggestion-close aria-label="Close">×</button>' +
      '</div>' +
      '<p class="site-suggestion-modal-hint" data-i18n="siteSuggestion.hint">欢迎提出功能、界面或文案方面的改进意见，不会公开展示。</p>' +
      '<p id="siteSuggestionStatus" class="site-suggestion-status" aria-live="polite"></p>' +
      '<form id="siteSuggestionForm" class="site-suggestion-form" onsubmit="return false;">' +
      '<label><span data-i18n="siteSuggestion.content">建议内容</span>' +
      '<textarea id="siteSuggestionContent" name="content" rows="5" maxlength="2000" data-i18n-placeholder="siteSuggestion.contentPlaceholder" placeholder="请描述你的想法或遇到的问题…"></textarea></label>' +
      '<label><span data-i18n="siteSuggestion.contact">联系方式（可选）</span>' +
      '<input type="text" id="siteSuggestionContact" name="contact" maxlength="120" data-i18n-placeholder="siteSuggestion.contactPlaceholder" placeholder="邮箱、战网 ID 等，便于回访"></label>' +
      '<div class="site-suggestion-actions">' +
      '<button type="button" data-site-suggestion-close data-i18n="common.cancel">取消</button>' +
      '<button type="button" id="siteSuggestionSubmit" class="site-suggestion-submit" data-i18n="siteSuggestion.submit">提交</button>' +
      '</div></form></div>';
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-site-suggestion-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.getElementById("siteSuggestionSubmit").addEventListener("click", submitForm);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function setStatus(msg, isErr) {
    var el = document.getElementById("siteSuggestionStatus");
    if (!el) {
      return;
    }
    el.textContent = msg || "";
    el.classList.toggle("is-error", !!isErr);
    el.classList.toggle("is-ok", !!msg && !isErr);
  }

  function updateTriggerAvailability(available) {
    var btn = document.querySelector("[data-site-suggestion-trigger]");
    if (!btn) {
      return;
    }
    var down = available === false;
    btn.disabled = down;
    btn.setAttribute("aria-disabled", down ? "true" : "false");
    if (down) {
      btn.title = t("siteSuggestion.serviceUnavailable");
    } else {
      btn.removeAttribute("title");
    }
  }

  function openModal() {
    if (window.sc2InviteApi && window.sc2InviteApi.isAvailable() === false) {
      return;
    }
    ensureModal();
    var modal = document.getElementById("siteSuggestionModal");
    if (!modal) {
      return;
    }
    if (window.SC2I18n && typeof window.SC2I18n.translatePage === "function") {
      window.SC2I18n.translatePage();
    }
    modal.hidden = false;
    document.documentElement.classList.add("site-suggestion-modal-open");
    setStatus("");
    var ta = document.getElementById("siteSuggestionContent");
    if (ta) {
      ta.focus();
    }
  }

  function closeModal() {
    var modal = document.getElementById("siteSuggestionModal");
    if (modal) {
      modal.hidden = true;
    }
    document.documentElement.classList.remove("site-suggestion-modal-open");
  }

  async function submitForm() {
    var base = apiBase();
    if (!base) {
      setStatus(t("siteSuggestion.networkError"), true);
      return;
    }
    var payload = {
      content: String(document.getElementById("siteSuggestionContent").value || ""),
      contact: String(document.getElementById("siteSuggestionContact").value || ""),
      page_url: String(window.location.href || "")
    };
    var check = validatePayload(payload);
    if (!check.ok) {
      setStatus(formatMessage(check), true);
      return;
    }
    var btn = document.getElementById("siteSuggestionSubmit");
    if (btn) {
      btn.disabled = true;
    }
    setStatus("");
    try {
      var res = await fetch(base + "/api/v1/site-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check.value)
      });
      if (!res.ok) {
        setStatus(t("siteSuggestion.error"), true);
        return;
      }
      setStatus(t("siteSuggestion.success"), false);
      document.getElementById("siteSuggestionForm").reset();
    } catch (e) {
      var unavailable =
        window.sc2InviteApi &&
        typeof window.sc2InviteApi.isNetworkFailure === "function" &&
        window.sc2InviteApi.isNetworkFailure(e);
      setStatus(unavailable ? t("siteSuggestion.serviceUnavailable") : t("siteSuggestion.networkError"), true);
    } finally {
      if (btn) {
        btn.disabled = false;
      }
    }
  }

  function wireFooter() {
    var footer = document.querySelector(".site-footer .container");
    if (!footer || footer.querySelector("[data-site-suggestion-trigger]")) {
      return;
    }
    var wrap = document.createElement("div");
    wrap.className = "site-footer-inner";
    while (footer.firstChild) {
      wrap.appendChild(footer.firstChild);
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-suggestion-link";
    btn.setAttribute("data-site-suggestion-trigger", "1");
    btn.setAttribute("data-i18n", "siteSuggestion.link");
    btn.textContent = t("siteSuggestion.link");
    btn.addEventListener("click", openModal);
    wrap.appendChild(btn);
    footer.appendChild(wrap);
    if (window.SC2I18n && typeof window.SC2I18n.translatePage === "function") {
      window.SC2I18n.translatePage();
    }
  }

  function init() {
    ensureModal();
    wireFooter();
    if (window.sc2InviteApi && typeof window.sc2InviteApi.checkHealth === "function") {
      window.sc2InviteApi.checkHealth().then(function (status) {
        updateTriggerAvailability(status.available);
      });
      window.sc2InviteApi.onStatusChange(function (status) {
        updateTriggerAvailability(status.available);
      });
    }
    document.addEventListener("sc2tool:languagechange", function () {
      if (window.SC2I18n && typeof window.SC2I18n.translatePage === "function") {
        window.SC2I18n.translatePage();
      }
      if (window.sc2InviteApi) {
        updateTriggerAvailability(window.sc2InviteApi.isAvailable());
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

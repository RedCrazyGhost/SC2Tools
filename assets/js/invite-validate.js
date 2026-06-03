(function () {
  "use strict";

  var BATTLE_TAG_NAME_MIN = 3;
  var BATTLE_TAG_NAME_MAX = 12;
  var BATTLE_TAG_MAX_LEN = 18;
  var MAX_TITLE = 80;
  var MAX_NOTE = 250;
  var MAX_EXPIRES_DAYS = 30;
  var DEFAULT_EXPIRES_DAYS = 3;
  var MAX_CALENDAR_PLAN_BYTES = 512 * 1024;
  var MAX_CALENDAR_ICS_BYTES = 512 * 1024;
  var MAX_CALENDAR_TASKS = 500;
  var BATTLE_TAG_CODE_RE = /^[0-9]{2,5}$/;
  var VALID_POSTERS = {
    "protoss-want-you": "assets/images/invite-posters/protoss-want-you.png"
  };

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

  function normalizeBattleTag(raw) {
    var s = String(raw || "").trim().replace(/\uFF03/g, "#");
    return s.replace(/[\uFF10-\uFF19]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 48);
    });
  }

  function isLetterRune(ch) {
    return /\p{L}/u.test(ch);
  }

  function isNumberRune(ch) {
    return /\p{N}/u.test(ch);
  }

  function validBattleTagName(name) {
    var chars = Array.from(name);
    if (chars.length < BATTLE_TAG_NAME_MIN || chars.length > BATTLE_TAG_NAME_MAX) {
      return false;
    }
    if (!isLetterRune(chars[0])) {
      return false;
    }
    for (var i = 0; i < chars.length; i++) {
      if (!isLetterRune(chars[i]) && !isNumberRune(chars[i])) {
        return false;
      }
    }
    return true;
  }

  function validInviteKey(key) {
    key = String(key || "").trim();
    if (key.length < 4 || key.length > 24) {
      return false;
    }
    return /^[A-Za-z0-9_-]+$/.test(key);
  }

  function fail(key, params) {
    return { ok: false, key: key, params: params || null };
  }

  function ok(value) {
    return { ok: true, value: value };
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toDatetimeLocalValue(date) {
    var d = new Date(date);
    if (isNaN(d.getTime())) {
      return "";
    }
    return (
      d.getFullYear() +
      "-" +
      pad2(d.getMonth() + 1) +
      "-" +
      pad2(d.getDate()) +
      "T" +
      pad2(d.getHours()) +
      ":" +
      pad2(d.getMinutes())
    );
  }

  function defaultExpiresAtLocal() {
    var d = new Date();
    d.setDate(d.getDate() + DEFAULT_EXPIRES_DAYS);
    d.setSeconds(0, 0);
    return toDatetimeLocalValue(d);
  }

  function applyExpiresAtInputBounds(el) {
    if (!el) {
      return;
    }
    var now = new Date();
    now.setSeconds(0, 0);
    var max = new Date(now.getTime());
    max.setDate(max.getDate() + MAX_EXPIRES_DAYS);
    el.min = toDatetimeLocalValue(now);
    el.max = toDatetimeLocalValue(max);
    el.step = "60";
  }

  function validateExpiresAt(raw) {
    var s = String(raw || "").trim();
    if (!s) {
      return fail("teamInvite.validation.expiresAtRequired");
    }
    var d = new Date(s);
    if (isNaN(d.getTime())) {
      return fail("teamInvite.validation.expiresAtInvalid");
    }
    d.setSeconds(0, 0);
    var now = new Date();
    now.setSeconds(0, 0);
    if (d.getTime() <= now.getTime()) {
      return fail("teamInvite.validation.expiresAtPast");
    }
    var max = new Date(now.getTime());
    max.setDate(max.getDate() + MAX_EXPIRES_DAYS);
    if (d.getTime() > max.getTime()) {
      return fail("teamInvite.validation.expiresAtTooFar", { max: MAX_EXPIRES_DAYS });
    }
    return ok(d.toISOString());
  }

  function validateBlizzardId(raw) {
    var s = normalizeBattleTag(raw);
    if (!s) {
      return fail("teamInvite.validation.battleTagRequired");
    }
    if (hasDisallowedControlChars(s)) {
      return fail("teamInvite.validation.invalidChars");
    }
    var hash = (s.match(/#/g) || []).length;
    if (hash !== 1) {
      return fail("teamInvite.validation.battleTagFormat");
    }
    var parts = s.split("#");
    var name = parts[0];
    var code = parts[1];
    if (name.indexOf(" ") !== -1 || code.indexOf(" ") !== -1) {
      return fail("teamInvite.validation.battleTagFormat");
    }
    if (!validBattleTagName(name) || !BATTLE_TAG_CODE_RE.test(code)) {
      return fail("teamInvite.validation.battleTagFormat");
    }
    return ok(name + "#" + code);
  }

  function validateTitle(raw) {
    var s = String(raw || "").trim();
    if (!s) {
      return fail("teamInvite.validation.inviteTitleRequired");
    }
    if (Array.from(s).length > MAX_TITLE) {
      return fail("teamInvite.validation.inviteTitleTooLong", { max: MAX_TITLE });
    }
    if (hasDisallowedControlChars(s)) {
      return fail("teamInvite.validation.invalidChars");
    }
    return ok(s);
  }

  function validateNote(raw) {
    var s = String(raw || "").trim();
    if (Array.from(s).length > MAX_NOTE) {
      return fail("teamInvite.validation.noteTooLong", { max: MAX_NOTE });
    }
    if (hasDisallowedControlChars(s)) {
      return fail("teamInvite.validation.invalidChars");
    }
    return ok(s);
  }

  function validateCalendarPlan(plan) {
    if (plan == null) {
      return ok(null);
    }
    var json;
    try {
      json = JSON.stringify(plan);
    } catch (e) {
      return fail("teamInvite.validation.calendarPlanInvalid");
    }
    if (json.length > MAX_CALENDAR_PLAN_BYTES) {
      return fail("teamInvite.validation.calendarPlanTooLarge");
    }
    if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
      return fail("teamInvite.validation.calendarPlanNoTasks");
    }
    if (plan.tasks.length > MAX_CALENDAR_TASKS) {
      return fail("teamInvite.validation.calendarPlanTooManyTasks", { max: MAX_CALENDAR_TASKS });
    }
    return ok(plan);
  }

  function validatePoster(raw) {
    var s = String(raw || "").trim();
    if (!s) {
      return ok("");
    }
    if (!Object.prototype.hasOwnProperty.call(VALID_POSTERS, s)) {
      return fail("teamInvite.validation.posterInvalid");
    }
    return ok(s);
  }

  function validateCreatePayload(payload) {
    payload = payload || {};
    var title = validateTitle(payload.title);
    if (!title.ok) {
      return title;
    }
    var bid = validateBlizzardId(payload.blizzard_id);
    if (!bid.ok) {
      return bid;
    }
    var note = validateNote(payload.note);
    if (!note.ok) {
      return note;
    }
    var expires = validateExpiresAt(payload.expires_at);
    if (!expires.ok) {
      return expires;
    }
    var plan = null;
    if (payload.calendar_plan != null) {
      var cp = validateCalendarPlan(payload.calendar_plan);
      if (!cp.ok) {
        return cp;
      }
      plan = cp.value;
    }
    if (payload.calendar_ics != null && String(payload.calendar_ics).trim() !== "") {
      var ics = String(payload.calendar_ics);
      if (ics.length > MAX_CALENDAR_ICS_BYTES) {
        return fail("teamInvite.validation.calendarIcsTooLarge");
      }
      if (ics.indexOf("BEGIN:VCALENDAR") === -1) {
        return fail("teamInvite.validation.calendarIcsInvalid");
      }
      if (plan) {
        return fail("teamInvite.validation.calendarBoth");
      }
    }
    var poster = validatePoster(payload.poster);
    if (!poster.ok) {
      return poster;
    }
    return {
      ok: true,
      value: {
        title: title.value,
        blizzard_id: bid.value,
        note: note.value,
        expires_at: expires.value,
        calendar_plan: plan,
        poster: poster.value
      }
    };
  }

  function formatMessage(t, result) {
    if (!result || result.ok || !result.key) {
      return "";
    }
    var msg = typeof t === "function" ? t(result.key) : result.key;
    if (!result.params) {
      return msg;
    }
    Object.keys(result.params).forEach(function (k) {
      msg = msg.replace(new RegExp("\\{" + k + "\\}", "g"), String(result.params[k]));
    });
    return msg;
  }

  window.sc2InviteValidate = {
    limits: {
      titleMax: MAX_TITLE,
      battleTagMaxLen: BATTLE_TAG_MAX_LEN,
      noteMax: MAX_NOTE,
      expiresMaxDays: MAX_EXPIRES_DAYS
    },
    normalizeBattleTag: normalizeBattleTag,
    validInviteKey: validInviteKey,
    validateTitle: validateTitle,
    validateBlizzardId: validateBlizzardId,
    validateNote: validateNote,
    validateExpiresAt: validateExpiresAt,
    toDatetimeLocalValue: toDatetimeLocalValue,
    defaultExpiresAtLocal: defaultExpiresAtLocal,
    applyExpiresAtInputBounds: applyExpiresAtInputBounds,
    validateCalendarPlan: validateCalendarPlan,
    validatePoster: validatePoster,
    validateCreatePayload: validateCreatePayload,
    posterAssetPath: function (posterId) {
      return VALID_POSTERS[posterId] || "";
    },
    formatMessage: formatMessage
  };
})();

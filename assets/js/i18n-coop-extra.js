(function (global) {
  "use strict";

  const coopExtraMessages = {
    zh: {
      "coop.scope.tag": "合作模式"
    },
    en: {
      "coop.scope.tag": "Co-op"
    }
  };

  if (global.SC2I18n && typeof global.SC2I18n.addMessages === "function") {
    global.SC2I18n.addMessages(coopExtraMessages);
    return;
  }

  global.SC2I18N_PENDING_MESSAGES = global.SC2I18N_PENDING_MESSAGES || [];
  global.SC2I18N_PENDING_MESSAGES.push(coopExtraMessages);
})(window);

(function (global) {
  "use strict";

  function decodeText(buffer) {
    try {
      return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    } catch (_err) {
      return "";
    }
  }

  function pickFirst(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return String(match[1]).trim();
      }
    }
    return "N/A";
  }

  function unique(list) {
    return Array.from(new Set(list));
  }

  function extractPlayers(text) {
    const tags = text.match(/[A-Za-z][A-Za-z0-9_]{2,15}#\d{3,6}/g) || [];
    const cleaned = unique(tags).slice(0, 8);
    return cleaned.length ? cleaned : ["N/A"];
  }

  function extractRaces(text) {
    const races = [];
    if (/Terran/i.test(text)) races.push("Terran");
    if (/Zerg/i.test(text)) races.push("Zerg");
    if (/Protoss/i.test(text)) races.push("Protoss");
    if (/Random/i.test(text)) races.push("Random");
    return races.length ? races : ["N/A"];
  }

  function toMinutesFromGameLoops(rawLoops) {
    const loops = Number(rawLoops);
    if (!Number.isFinite(loops) || loops <= 0) {
      return "N/A";
    }
    const seconds = loops / 16;
    const minutes = Math.floor(seconds / 60);
    const remain = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  }

  async function parseReplay(file) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".sc2replay")) {
      throw new Error("文件扩展名不正确，请选择 .SC2Replay 文件。");
    }

    const buffer = await file.arrayBuffer();
    const text = decodeText(buffer);

    const mapName = pickFirst(text, [
      /MapName(?:\W+)([^\0\r\n]{2,80})/i,
      /map(?:\W+)([A-Za-z0-9 _\-\u4e00-\u9fa5]{3,80})/i
    ]);
    const gameMode = pickFirst(text, [
      /GameType(?:\W+)([A-Za-z0-9_\- ]{2,40})/i,
      /(Co-op|Versus|Ladder|Custom)/i
    ]);
    const buildVersion = pickFirst(text, [
      /BaseBuild(?:\W+)(\d{3,8})/i,
      /Version(?:\W+)(\d+\.\d+\.\d+\.\d+)/i
    ]);
    const loops = pickFirst(text, [/GameDuration(?:\W+)(\d{2,10})/i]);
    const duration = loops === "N/A" ? "N/A" : toMinutesFromGameLoops(loops);
    const players = extractPlayers(text);
    const races = extractRaces(text);

    return {
      fileName: file.name,
      fileSizeKb: Math.round(file.size / 1024),
      mapName,
      gameMode,
      buildVersion,
      duration,
      players,
      races,
      result: "N/A"
    };
  }

  global.SC2ReplayParser = {
    parseReplay
  };
})(window);

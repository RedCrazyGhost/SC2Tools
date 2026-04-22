(function () {
  "use strict";

  const input = document.getElementById("replay-file-input");
  const statusEl = document.getElementById("parse-status");
  const metaEl = document.getElementById("replay-meta");

  if (!input || !statusEl || !metaEl || !window.SC2ReplayParser) {
    return;
  }

  function renderMeta(meta) {
    const players = meta.players.map(function (name) {
      return `<li>${name}</li>`;
    }).join("");
    const races = meta.races.map(function (race) {
      return `<li>${race}</li>`;
    }).join("");

    metaEl.innerHTML = [
      `<p><strong>文件：</strong>${meta.fileName}</p>`,
      `<p><strong>大小：</strong>${meta.fileSizeKb} KB</p>`,
      `<p><strong>地图：</strong>${meta.mapName}</p>`,
      `<p><strong>模式：</strong>${meta.gameMode}</p>`,
      `<p><strong>版本：</strong>${meta.buildVersion}</p>`,
      `<p><strong>时长：</strong>${meta.duration}</p>`,
      `<p><strong>结果：</strong>${meta.result}</p>`,
      "<p><strong>玩家：</strong></p>",
      `<ul>${players}</ul>`,
      "<p><strong>可能种族：</strong></p>",
      `<ul>${races}</ul>`
    ].join("");
  }

  function renderError(message) {
    metaEl.innerHTML = `<p>${message}</p>`;
  }

  input.addEventListener("change", async function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    statusEl.textContent = "解析中...";
    try {
      const meta = await window.SC2ReplayParser.parseReplay(file);
      renderMeta(meta);
      statusEl.textContent = "解析完成";
    } catch (error) {
      renderError(error instanceof Error ? error.message : "解析失败，请重试其他Replay文件。");
      statusEl.textContent = "解析失败";
    }
  });
})();

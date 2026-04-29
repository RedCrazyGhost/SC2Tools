import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = [
  "index.html",
  "404.html",
  "tools/single-xp.html",
  "tools/coop-xp.html",
  "tools/commander-xp-table.html",
  "tools/mastery-xp-table.html",
  "tools/mutation-reward-table.html"
];

const i18nFile = path.join(root, "assets/js/i18n.js");
const i18nContent = fs.readFileSync(i18nFile, "utf8");
const keySet = new Set();
const keyPattern = /"([a-z0-9_.-]+)"\s*:/gi;
for (const match of i18nContent.matchAll(keyPattern)) {
  keySet.add(match[1]);
}

const attrPatterns = [
  /data-i18n="([^"]+)"/g,
  /data-i18n-content="([^"]+)"/g,
  /data-i18n-title="([^"]+)"/g,
  /data-i18n-placeholder="([^"]+)"/g,
  /data-i18n-aria-label="([^"]+)"/g
];

const missing = [];
for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const content = fs.readFileSync(fullPath, "utf8");
  for (const pattern of attrPatterns) {
    for (const match of content.matchAll(pattern)) {
      const key = match[1];
      if (!keySet.has(key)) {
        missing.push(`${file}: ${key}`);
      }
    }
  }
}

const seoCheck = [];
for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const content = fs.readFileSync(fullPath, "utf8");
  if (!/property="og:title"[^>]+data-i18n-content=/.test(content)) {
    seoCheck.push(`${file}: missing data-i18n-content for og:title`);
  }
  if (!/property="og:description"[^>]+data-i18n-content=/.test(content)) {
    seoCheck.push(`${file}: missing data-i18n-content for og:description`);
  }
}

const ariaCheck = [];
for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const content = fs.readFileSync(fullPath, "utf8");
  if (/<nav[^>]+aria-label=/.test(content) && !/data-i18n-aria-label="aria\.mainNav"/.test(content)) {
    ariaCheck.push(`${file}: nav aria label not i18n-bound`);
  }
  if (/class="breadcrumb"[^>]+aria-label=/.test(content) && !/data-i18n-aria-label="aria\.breadcrumb"/.test(content)) {
    ariaCheck.push(`${file}: breadcrumb aria label not i18n-bound`);
  }
}

if (!missing.length && !seoCheck.length && !ariaCheck.length) {
  console.log("i18n integrity check passed");
  process.exit(0);
}

console.error("i18n integrity check failed");
for (const item of missing) console.error(`- missing key: ${item}`);
for (const item of seoCheck) console.error(`- seo issue: ${item}`);
for (const item of ariaCheck) console.error(`- aria issue: ${item}`);
process.exit(1);

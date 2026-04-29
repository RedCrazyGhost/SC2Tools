(function (global) {
  "use strict";

  const STORAGE_KEY = "sc2tool_lang";
  const SUPPORTED_LANGS = ["zh", "en"];

  const messages = {
    zh: {
      "lang.switcher.label": "语言",
      "lang.zh": "中文",
      "lang.en": "EN",
      "site.footer": "© 2026 星际争霸2工具站 · Version 1.0.2",
      "common.home": "首页",
      "common.calculator": "经验计算器",
      "common.skipToContent": "跳到主要内容",
      "aria.mainNav": "主导航",
      "aria.breadcrumb": "面包屑",
      "aria.languageSwitcher": "语言切换",
      "nav.single": "单局经验计算器",
      "nav.coop": "合作练级日历",
      "site.name": "星际争霸2工具站",
      "head.index.title": "星际争霸2工具站 - 经验计算器与练级工具",
      "head.index.description": "星际争霸2工具站提供合作模式经验计算器与练级工具，纯前端实现，快速、安全、无需登录。",
      "head.index.ogDescription": "合作模式经验计算器与练级工具。",
      "head.404.title": "页面未找到 - 星际争霸2工具站",
      "head.404.description": "你访问的页面不存在，返回星际争霸2工具站首页继续使用经验计算器与练级工具。",
      "head.404.ogTitle": "页面未找到",
      "head.404.ogDescription": "该页面不存在，请返回首页继续使用工具。",
      "head.single.title": "单局游戏经验计算 - 星际争霸2工具站",
      "head.single.description": "星际争霸2合作模式单局游戏经验计算：按固定基础经验、奖励目标经验、难度加成、随机加成与首胜规则计算每局经验。",
      "head.single.ogTitle": "单局游戏经验计算",
      "head.single.ogDescription": "按公开官方规则估算单局合作经验。",
      "head.coop.title": "合作模式经验计算器 - 星际争霸2工具站",
      "head.coop.description": "星际争霸2合作模式经验计算器：支持指挥官/精通等级经验计算、目标经验同步、合作任务计划日历自动规划与突变奖励结算。",
      "head.coop.ogTitle": "合作模式经验计算器",
      "head.coop.ogDescription": "按公开官方规则估算合作模式经验。",
      "head.commander.title": "指挥官1-15级经验列表 - 星际争霸2工具站",
      "head.commander.description": "星际争霸2合作模式指挥官1-15级经验列表，包含每级所需经验与累计经验，便于快速查询升级进度。",
      "head.commander.ogTitle": "指挥官1-15级经验列表",
      "head.commander.ogDescription": "查看合作模式指挥官每级所需经验与累计经验。",
      "head.mastery.title": "精通0-90级经验列表 - 星际争霸2工具站",
      "head.mastery.description": "星际争霸2合作模式精通0-90级经验列表，包含每级所需经验与累计经验，并说明90级后晋升经验规则。",
      "head.mastery.ogTitle": "精通0-90级经验列表",
      "head.mastery.ogDescription": "查看精通每级所需经验、累计经验及90级后晋升说明。",
      "head.mutation.title": "每周突变奖励经验列表 - 星际争霸2工具站",
      "head.mutation.description": "星际争霸2合作模式每周突变奖励经验列表：各档与累积奖励，包含休闲、普通、困难、残酷四档。",
      "head.mutation.ogTitle": "每周突变奖励经验列表",
      "head.mutation.ogDescription": "查看每周突变奖励各档经验及累积奖励。",
      "index.hero.title": "专为星际争霸2玩家打造的轻量工具集合",
      "index.hero.desc": "使用原生HTML/CSS/JS构建，首屏可抓取、加载快、移动端友好。",
      "index.tools.title": "工具列表",
      "index.card.single.title": "单局游戏经验计算",
      "index.card.single.desc": "按公开规则快速计算单局经验，支持难度、随机地图、首胜和突变奖励。",
      "index.card.coop.title": "合作模式经验计算器",
      "index.card.coop.desc": "计算升级所需经验并可手动同步到日历目标经验，支持合作任务计划。",
      "index.card.commander.title": "指挥官1-15级经验列表",
      "index.card.commander.desc": "快速查询每级升级所需经验与累计经验，便于安排指挥官练级计划。",
      "index.card.mastery.title": "精通0-90级经验列表",
      "index.card.mastery.desc": "查看精通等级经验曲线，并附90级后晋升每级固定经验说明。",
      "index.card.mutation.title": "每周突变奖励经验列表",
      "index.card.mutation.desc": "查看休闲到残酷各档突变奖励经验与累积奖励。",
      "index.faq.title": "常见问题",
      "index.faq.login.q": "这个站点是否需要登录？",
      "index.faq.login.a": "不需要。所有基础工具可直接使用。",
      "404.title": "404 - 页面未找到",
      "404.desc": "你访问的地址可能已变更、被删除，或输入有误。",
      "404.entry.title": "可以试试以下入口",
      "404.entry.home": "返回首页",
      "single.title": "单局游戏经验",
      "single.breadcrumb": "单局经验",
      "single.result.title": "计算结果",
      "single.formula.title": "公式说明",
      "single.form.taskType": "任务类型",
      "single.form.difficulty": "难度",
      "single.form.randomMap": "随机地图（+25%）",
      "single.option.normalTask": "普通任务",
      "single.option.mutationTask": "突变任务",
      "single.firstwin.daily": "每日首胜",
      "single.firstwin.weekly": "每周首胜",
      "single.result.total": "每局经验：",
      "single.result.base": "基础经验：",
      "single.result.objective": "奖励目标经验：",
      "single.result.subtotal": "基础合计：",
      "single.result.diff": "难度加成：",
      "single.result.random": "随机地图加成：",
      "single.result.firstwin.daily": "每日首胜经验：",
      "single.result.firstwin.weekly": "每周首胜经验：",
      "single.result.mutation": "突变奖励：",
      "single.formula.line1": "每局游戏经验 = (基础经验 + 奖励目标经验) × (1 + 难度加成 + 随机加成) + 首胜经验 + （每周第一次完成时的累积难度奖励）",
      "single.formula.line2": "基础经验：20000 xp（固定） | 奖励目标经验：2000 xp（固定） | 随机加成：随机地图时25% | 首胜经验：10000 xp",
      "single.quicklinks": "经验列表速查：",
      "table.commander.title": "经验表",
      "table.mastery.title": "经验表（0-90）",
      "table.col.level": "等级",
      "table.col.toNext": "到下一等级所需经验（xp）",
      "table.col.cumulative": "当前等级累计经验（xp）",
      "table.commander.note": "注：15级已满级，故“到下一等级所需经验”为0 xp。",
      "table.mastery.note": "90级后进入晋升阶段，每升一级固定需要200,000 xp。",
      "table.mutation.title": "奖励档位与累积奖励",
      "table.mutation.col.difficulty": "突变难度",
      "table.mutation.col.single": "单档奖励",
      "table.mutation.col.cumulative": "累积奖励（含低档）",
      "table.mutation.note": "累积奖励口径：完成更高档时，包含该档及以下所有档位奖励。",
      "difficulty.casual": "休闲",
      "difficulty.normal": "普通",
      "difficulty.hard": "困难",
      "difficulty.brutal": "残酷",
      "difficulty.brutal1": "残酷+1",
      "difficulty.brutal2": "残酷+2",
      "difficulty.brutal3": "残酷+3",
      "difficulty.brutal4": "残酷+4",
      "difficulty.brutal5": "残酷+5",
      "difficulty.brutal6": "残酷+6",
      "coop.mode.commander": "指挥官经验计算",
      "coop.mode.mastery": "精通经验计算",
      "coop.title": "合作任务计划日历",
      "coop.mode.title": "计算模式",
      "coop.commander.title": "指挥官升级经验计算",
      "coop.commander.desc": "根据“起始等级+当前经验”到“目标等级+目标经验”，计算需要获得经验，可手动同步到计划日历目标经验。",
      "coop.mastery.title": "精通/晋升等级经验计算",
      "coop.mastery.desc": "精通0-90按固定经验表计算；90-1000级按每级200000经验计算（晋升）。",
      "coop.schedule.title": "计划日历",
      "coop.field.startLevel": "起始等级",
      "coop.field.startLevelXp": "起始等级当前经验",
      "coop.field.targetLevel": "目标等级",
      "coop.field.targetLevelXp": "目标等级当前经验",
      "coop.field.startMasteryLevel": "起始精通/晋升等级",
      "coop.field.targetMasteryLevel": "目标精通/晋升等级",
      "coop.field.xpRange": "等级经验区间（拖拽两端）",
      "coop.field.targetXp": "目标经验（xp）",
      "coop.field.taskDifficulty": "任务难度",
      "coop.field.randomMapBonus": "随机地图加成",
      "coop.field.date": "计划日期",
      "coop.field.games": "局数",
      "coop.field.startDate": "开始日期",
      "coop.field.days": "连续天数",
      "coop.field.gamesPerDay": "每日局数",
      "coop.field.dailyNormalGames": "每日普通任务局数",
      "coop.field.normalTaskDifficulty": "普通任务难度",
      "coop.field.mutationDifficulty": "突变任务等级",
      "coop.field.challengeMutation": "挑战突变任务（每周额外安排）",
      "coop.field.enableChallengeMutation": "启用挑战突变任务",
      "coop.field.exportScope": "导出范围",
      "coop.field.eventStartTime": "事件开始时间",
      "coop.option.allTasks": "全部计划任务",
      "coop.option.currentMonth": "当前显示月份",
      "coop.modal.editor.title": "日历任务编辑",
      "coop.modal.bulk.title": "批量添加普通任务",
      "coop.modal.bulk.action": "批量添加",
      "coop.modal.autoPlan.title": "自动规划参数",
      "coop.modal.autoPlan.generate": "生成计划",
      "coop.modal.export.title": "导出日历计划（.ics）",
      "coop.modal.export.confirm": "导出 .ics",
      "coop.schedule.placeholder": "填写参数并点击“自动规划”。",
      "coop.toolbar.prev": "上月",
      "coop.toolbar.next": "下月",
      "coop.toolbar.today": "返回今天",
      "coop.toolbar.autoPlan": "自动规划",
      "coop.toolbar.bulkAdd": "批量添加普通任务",
      "coop.toolbar.exportIcs": "导出日历计划 (.ics)",
      "coop.toolbar.clearAll": "删除所有计划",
      "coop.tip.mutationDifficulty": "仅影响每周额外突变任务与其奖励，不影响普通任务",
      "coop.tip.challengeMutation": "开启后会在每周额外安排 1 场突变任务",
      "coop.aria.startTotalXp": "起始总经验",
      "coop.aria.targetTotalXp": "目标总经验",
      "coop.calendar.loading": "日历加载中...",
      "common.save": "保存",
      "common.delete": "删除",
      "common.cancel": "取消",
      "common.yes": "是",
      "common.no": "否",
      "common.unknown": "未知",
      "common.to": "至",
      "weekday.mon": "一",
      "weekday.tue": "二",
      "weekday.wed": "三",
      "weekday.thu": "四",
      "weekday.fri": "五",
      "weekday.sat": "六",
      "weekday.sun": "日",
      "time.minutes": "{m}分钟",
      "time.hoursMinutes": "{h}小时{m}分钟",
      "calendar.monthLabel": "{year}年{month}月",
      "calendar.today": "今天",
      "calendar.random": "随机",
      "calendar.fixed": "固定",
      "calendar.firstWin": "首胜",
      "calendar.mutation": "突变",
      "calendar.base": "基础",
      "calendar.gamesUnit": "局",
      "calendar.xpLabel": "经验",
      "calendar.editTask": "编辑任务",
      "calendar.weekMutationReward": "突变周奖励",
      "calendar.unscheduled": "未计划",
      "calendar.levelTooltip": "等级 {level}（累计经验 {xp}）",
      "calendar.summary.mode": "当前模式：",
      "calendar.summary.games": "当前计划局数：",
      "calendar.summary.duration": "当前计划总时长：",
      "calendar.summary.completion": "预计完成日期：",
      "calendar.summary.totalXp": "当前计划总经验：",
      "calendar.summary.mutationIncluded": "含突变奖励",
      "calendar.summary.matchTarget": "计划经验与目标一致",
      "calendar.summary.diff": "计划与目标经验差值：",
      "calendar.summary.targetXp": "目标经验：",
      "alert.selectValidStartDate": "请选择有效的开始日期。",
      "alert.enterValidTargetXp": "请输入有效的目标经验（xp，且大于0）。",
      "alert.selectValidPlanDate": "请选择有效的计划日期。",
      "alert.gamesMustBePositive": "局数必须大于0。",
      "alert.daysMustBePositive": "连续天数必须大于0。",
      "alert.dailyGamesMustBePositive": "每日局数必须大于0。",
      "alert.noTasksToExport": "当前没有可导出的计划任务。",
      "alert.noTasksInScope": "所选范围内没有可导出的计划任务。",
      "confirm.clearAllTasks": "确认删除全部计划？此操作不可撤销。",
      "coop.msg.noExtraGamesCommander": "目标经验不高于当前经验，无需额外对局。",
      "coop.msg.noExtraGamesMastery": "目标精通/晋升经验不高于当前经验，无需额外对局。",
      "coop.warn.masteryMax": "精通/晋升等级不能超过 {max}。",
      "coop.warn.masteryStartCap": "精通/晋升起始等级当前经验不能超过该等级上限（{cap}）。",
      "coop.warn.masteryTargetCap": "精通/晋升目标等级当前经验不能超过该等级上限（{cap}）。",
      "coop.warn.commanderStartCap": "指挥官起始等级当前经验不能超过该等级上限（{cap}）。",
      "coop.warn.commanderTargetCap": "指挥官目标等级当前经验不能超过该等级上限（{cap}）。",
      "coop.leveling.needxp": "需要获得经验：",
      "coop.sync.target": "同步目标经验"
    },
    en: {
      "lang.switcher.label": "Language",
      "lang.zh": "中文",
      "lang.en": "EN",
      "site.footer": "© 2026 SC2 Tools · Version 1.0.2",
      "common.home": "Home",
      "common.calculator": "XP Calculator",
      "common.skipToContent": "Skip to main content",
      "aria.mainNav": "Main navigation",
      "aria.breadcrumb": "Breadcrumb",
      "aria.languageSwitcher": "Language switcher",
      "nav.single": "Single Match XP",
      "nav.coop": "Co-op Planner",
      "site.name": "SC2 Tools",
      "head.index.title": "SC2 Tools - XP Calculator & Planner",
      "head.index.description": "SC2 Tools provides co-op XP calculators and planning tools. Pure frontend, fast and no sign-in required.",
      "head.index.ogDescription": "Co-op XP calculator and planning tools.",
      "head.404.title": "Page Not Found - SC2 Tools",
      "head.404.description": "The page you visited does not exist. Return to SC2 Tools homepage to continue using XP tools.",
      "head.404.ogTitle": "Page Not Found",
      "head.404.ogDescription": "This page does not exist. Return to homepage to continue using tools.",
      "head.single.title": "Single Match XP Calculator - SC2 Tools",
      "head.single.description": "SC2 co-op single match XP calculator with base XP, objective XP, difficulty bonus, random map bonus and first win rules.",
      "head.single.ogTitle": "Single Match XP Calculator",
      "head.single.ogDescription": "Estimate single co-op XP based on public rules.",
      "head.coop.title": "Co-op XP Planner - SC2 Tools",
      "head.coop.description": "SC2 co-op XP planner with commander/mastery leveling, target XP sync, auto schedule planning, and mutation rewards.",
      "head.coop.ogTitle": "Co-op XP Planner",
      "head.coop.ogDescription": "Estimate co-op XP based on public rules.",
      "head.commander.title": "Commander Lv1-15 XP Table - SC2 Tools",
      "head.commander.description": "SC2 co-op commander level 1-15 XP table, including XP to next level and cumulative XP.",
      "head.commander.ogTitle": "Commander Lv1-15 XP Table",
      "head.commander.ogDescription": "Check XP required and cumulative XP for each commander level.",
      "head.mastery.title": "Mastery Lv0-90 XP Table - SC2 Tools",
      "head.mastery.description": "SC2 co-op mastery level 0-90 XP table, including XP to next level, cumulative XP, and post-90 ascension rules.",
      "head.mastery.ogTitle": "Mastery Lv0-90 XP Table",
      "head.mastery.ogDescription": "Check mastery XP, cumulative XP and post-90 ascension details.",
      "head.mutation.title": "Weekly Mutation Reward Table - SC2 Tools",
      "head.mutation.description": "SC2 co-op weekly mutation reward table across Casual, Normal, Hard and Brutal tiers.",
      "head.mutation.ogTitle": "Weekly Mutation Reward Table",
      "head.mutation.ogDescription": "Check weekly mutation rewards by tier and cumulative values.",
      "index.hero.title": "Lightweight tools built for SC2 players",
      "index.hero.desc": "Built with native HTML/CSS/JS, fast to load and mobile friendly.",
      "index.tools.title": "Tools",
      "index.card.single.title": "Single Match XP Calculator",
      "index.card.single.desc": "Calculate XP per game with difficulty, random map, first win and mutation rewards.",
      "index.card.coop.title": "Co-op XP Planner",
      "index.card.coop.desc": "Calculate required XP and sync targets to your schedule planner.",
      "index.card.commander.title": "Commander Lv1-15 XP Table",
      "index.card.commander.desc": "Quickly check XP needed and cumulative XP for each commander level.",
      "index.card.mastery.title": "Mastery Lv0-90 XP Table",
      "index.card.mastery.desc": "View mastery XP curve and fixed ascension XP after level 90.",
      "index.card.mutation.title": "Weekly Mutation Reward Table",
      "index.card.mutation.desc": "Check mutation rewards and cumulative bonuses by difficulty.",
      "index.faq.title": "FAQ",
      "index.faq.login.q": "Do I need to sign in?",
      "index.faq.login.a": "No. All core tools are available without sign-in.",
      "404.title": "404 - Page Not Found",
      "404.desc": "The page may have moved, been removed, or the URL is invalid.",
      "404.entry.title": "Try these links",
      "404.entry.home": "Back to Home",
      "single.title": "Single Match XP",
      "single.breadcrumb": "Single Match XP",
      "single.result.title": "Result",
      "single.formula.title": "Formula",
      "single.form.taskType": "Task Type",
      "single.form.difficulty": "Difficulty",
      "single.form.randomMap": "Random Map (+25%)",
      "single.option.normalTask": "Normal Mission",
      "single.option.mutationTask": "Mutation Mission",
      "single.firstwin.daily": "Daily First Win",
      "single.firstwin.weekly": "Weekly First Win",
      "single.result.total": "XP per Match:",
      "single.result.base": "Base XP:",
      "single.result.objective": "Objective XP:",
      "single.result.subtotal": "Base Subtotal:",
      "single.result.diff": "Difficulty Bonus:",
      "single.result.random": "Random Map Bonus:",
      "single.result.firstwin.daily": "Daily First Win XP:",
      "single.result.firstwin.weekly": "Weekly First Win XP:",
      "single.result.mutation": "Mutation Bonus:",
      "single.formula.line1": "XP per match = (Base XP + Objective XP) x (1 + Difficulty Bonus + Random Bonus) + First Win XP + (Weekly cumulative mutation difficulty reward)",
      "single.formula.line2": "Base XP: 20000 (fixed) | Objective XP: 2000 (fixed) | Random Bonus: 25% on random map | First Win XP: 10000",
      "single.quicklinks": "Quick XP tables:",
      "table.commander.title": "XP Table",
      "table.mastery.title": "XP Table (0-90)",
      "table.col.level": "Level",
      "table.col.toNext": "XP to Next Level",
      "table.col.cumulative": "Cumulative XP at Level",
      "table.commander.note": "Note: Level 15 is max level, so XP to next level is 0.",
      "table.mastery.note": "After level 90, each ascension level requires fixed 200,000 XP.",
      "table.mutation.title": "Reward Tiers and Cumulative Rewards",
      "table.mutation.col.difficulty": "Mutation Difficulty",
      "table.mutation.col.single": "Tier Reward",
      "table.mutation.col.cumulative": "Cumulative Reward",
      "table.mutation.note": "Cumulative reward means higher tier includes all lower-tier rewards.",
      "difficulty.casual": "Casual",
      "difficulty.normal": "Normal",
      "difficulty.hard": "Hard",
      "difficulty.brutal": "Brutal",
      "difficulty.brutal1": "Brutal+1",
      "difficulty.brutal2": "Brutal+2",
      "difficulty.brutal3": "Brutal+3",
      "difficulty.brutal4": "Brutal+4",
      "difficulty.brutal5": "Brutal+5",
      "difficulty.brutal6": "Brutal+6",
      "coop.mode.commander": "Commander XP",
      "coop.mode.mastery": "Mastery XP",
      "coop.title": "Co-op Task Planner Calendar",
      "coop.mode.title": "Mode",
      "coop.commander.title": "Commander Leveling XP",
      "coop.commander.desc": "Calculate required XP from start level/current XP to target level/target XP, and sync it to planner target XP.",
      "coop.mastery.title": "Mastery/Ascension XP",
      "coop.mastery.desc": "Levels 0-90 follow the fixed mastery table; levels 90-1000 use 200,000 XP per level.",
      "coop.schedule.title": "Schedule Calendar",
      "coop.field.startLevel": "Start Level",
      "coop.field.startLevelXp": "Current XP at Start Level",
      "coop.field.targetLevel": "Target Level",
      "coop.field.targetLevelXp": "Current XP at Target Level",
      "coop.field.startMasteryLevel": "Start Mastery/Ascension Level",
      "coop.field.targetMasteryLevel": "Target Mastery/Ascension Level",
      "coop.field.xpRange": "XP Range (drag both ends)",
      "coop.field.targetXp": "Target XP",
      "coop.field.taskDifficulty": "Task Difficulty",
      "coop.field.randomMapBonus": "Random Map Bonus",
      "coop.field.date": "Date",
      "coop.field.games": "Games",
      "coop.field.startDate": "Start Date",
      "coop.field.days": "Consecutive Days",
      "coop.field.gamesPerDay": "Games Per Day",
      "coop.field.dailyNormalGames": "Daily Normal Games",
      "coop.field.normalTaskDifficulty": "Normal Mission Difficulty",
      "coop.field.mutationDifficulty": "Mutation Difficulty",
      "coop.field.challengeMutation": "Challenge Mutation (weekly extra task)",
      "coop.field.enableChallengeMutation": "Enable Challenge Mutation",
      "coop.field.exportScope": "Export Scope",
      "coop.field.eventStartTime": "Event Start Time",
      "coop.option.allTasks": "All Planned Tasks",
      "coop.option.currentMonth": "Current Displayed Month",
      "coop.modal.editor.title": "Calendar Task Editor",
      "coop.modal.bulk.title": "Bulk Add Normal Tasks",
      "coop.modal.bulk.action": "Bulk Add",
      "coop.modal.autoPlan.title": "Auto Plan Settings",
      "coop.modal.autoPlan.generate": "Generate Plan",
      "coop.modal.export.title": "Export Calendar Plan (.ics)",
      "coop.modal.export.confirm": "Export .ics",
      "coop.schedule.placeholder": "Fill in settings and click Auto Plan.",
      "coop.toolbar.prev": "Prev Month",
      "coop.toolbar.next": "Next Month",
      "coop.toolbar.today": "Today",
      "coop.toolbar.autoPlan": "Auto Plan",
      "coop.toolbar.bulkAdd": "Bulk Add Normal Tasks",
      "coop.toolbar.exportIcs": "Export Calendar Plan (.ics)",
      "coop.toolbar.clearAll": "Delete All Plans",
      "coop.tip.mutationDifficulty": "Affects only extra weekly mutation tasks and rewards, not normal tasks.",
      "coop.tip.challengeMutation": "When enabled, one extra mutation task is scheduled every week.",
      "coop.aria.startTotalXp": "Starting total XP",
      "coop.aria.targetTotalXp": "Target total XP",
      "coop.calendar.loading": "Loading calendar...",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.cancel": "Cancel",
      "common.yes": "Yes",
      "common.no": "No",
      "common.unknown": "Unknown",
      "common.to": "to",
      "weekday.mon": "Mon",
      "weekday.tue": "Tue",
      "weekday.wed": "Wed",
      "weekday.thu": "Thu",
      "weekday.fri": "Fri",
      "weekday.sat": "Sat",
      "weekday.sun": "Sun",
      "time.minutes": "{m}m",
      "time.hoursMinutes": "{h}h {m}m",
      "calendar.monthLabel": "{year}-{month}",
      "calendar.today": "Today",
      "calendar.random": "Random",
      "calendar.fixed": "Fixed",
      "calendar.firstWin": "First Win",
      "calendar.mutation": "Mutation",
      "calendar.base": "Base",
      "calendar.gamesUnit": "games",
      "calendar.xpLabel": "XP",
      "calendar.editTask": "Edit Task",
      "calendar.weekMutationReward": "Weekly Mutation Reward",
      "calendar.unscheduled": "Not Scheduled",
      "calendar.levelTooltip": "Level {level} (Cumulative XP {xp})",
      "calendar.summary.mode": "Mode:",
      "calendar.summary.games": "Planned Games:",
      "calendar.summary.duration": "Planned Duration:",
      "calendar.summary.completion": "Estimated Completion:",
      "calendar.summary.totalXp": "Planned Total XP:",
      "calendar.summary.mutationIncluded": "including mutation",
      "calendar.summary.matchTarget": "Planned XP matches target",
      "calendar.summary.diff": "Planned vs target XP difference:",
      "calendar.summary.targetXp": "Target XP:",
      "alert.selectValidStartDate": "Please select a valid start date.",
      "alert.enterValidTargetXp": "Please enter a valid target XP (greater than 0).",
      "alert.selectValidPlanDate": "Please select a valid planned date.",
      "alert.gamesMustBePositive": "Games must be greater than 0.",
      "alert.daysMustBePositive": "Days must be greater than 0.",
      "alert.dailyGamesMustBePositive": "Daily games must be greater than 0.",
      "alert.noTasksToExport": "There are no planned tasks to export.",
      "alert.noTasksInScope": "No tasks in the selected export scope.",
      "confirm.clearAllTasks": "Delete all planned tasks? This cannot be undone.",
      "coop.msg.noExtraGamesCommander": "Target XP is not higher than current XP. No extra games needed.",
      "coop.msg.noExtraGamesMastery": "Target mastery/ascension XP is not higher than current XP. No extra games needed.",
      "coop.warn.masteryMax": "Mastery/ascension level cannot exceed {max}.",
      "coop.warn.masteryStartCap": "Current XP at start mastery level cannot exceed cap ({cap}).",
      "coop.warn.masteryTargetCap": "Current XP at target mastery level cannot exceed cap ({cap}).",
      "coop.warn.commanderStartCap": "Current XP at start commander level cannot exceed cap ({cap}).",
      "coop.warn.commanderTargetCap": "Current XP at target commander level cannot exceed cap ({cap}).",
      "coop.leveling.needxp": "Required XP:",
      "coop.sync.target": "Sync Target XP"
    }
  };

  function addMessages(extraMessages) {
    if (!extraMessages || typeof extraMessages !== "object") return;
    SUPPORTED_LANGS.forEach(function (lang) {
      if (!messages[lang]) return;
      const additions = extraMessages[lang];
      if (!additions || typeof additions !== "object") return;
      Object.keys(additions).forEach(function (key) {
        messages[lang][key] = additions[key];
      });
    });
  }

  function normalizeLang(lang) {
    const value = String(lang || "").toLowerCase();
    if (value.startsWith("en")) return "en";
    return "zh";
  }

  function detectLanguage() {
    const stored = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : "";
    if (SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
    return normalizeLang(global.navigator && global.navigator.language);
  }

  function t(key, lang) {
    const currentLang = SUPPORTED_LANGS.includes(lang) ? lang : detectLanguage();
    return messages[currentLang][key] || messages.zh[key] || key;
  }

  function applyLangAttr(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }

  function translatePage(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key, lang);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-title");
      el.setAttribute("title", t(key, lang));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key, lang));
    });
    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-content");
      el.setAttribute("content", t(key, lang));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-aria-label");
      el.setAttribute("aria-label", t(key, lang));
    });
    document.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      const btnLang = btn.getAttribute("data-lang-switch");
      btn.setAttribute("aria-pressed", btnLang === lang ? "true" : "false");
    });
    document.querySelectorAll("[data-lang-select]").forEach(function (selectEl) {
      selectEl.value = lang;
    });
    applyLangAttr(lang);
  }

  function setLanguage(lang, persist) {
    const normalized = normalizeLang(lang);
    if (persist !== false && global.localStorage) {
      global.localStorage.setItem(STORAGE_KEY, normalized);
    }
    translatePage(normalized);
    global.dispatchEvent(new CustomEvent("sc2tool:languagechange", { detail: { lang: normalized } }));
  }

  function initLanguage() {
    const lang = detectLanguage();
    translatePage(lang);
    document.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-lang-switch]");
      if (!btn) return;
      const langToSet = btn.getAttribute("data-lang-switch");
      setLanguage(langToSet, true);
    });
    document.addEventListener("change", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (!target.hasAttribute("data-lang-select")) return;
      setLanguage(target.value, true);
    });
  }

  global.SC2I18n = {
    t: t,
    setLanguage: setLanguage,
    detectLanguage: detectLanguage,
    translatePage: translatePage,
    addMessages: addMessages
  };

  if (Array.isArray(global.SC2I18N_PENDING_MESSAGES)) {
    global.SC2I18N_PENDING_MESSAGES.forEach(addMessages);
    global.SC2I18N_PENDING_MESSAGES = [];
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguage);
  } else {
    initLanguage();
  }
})(window);

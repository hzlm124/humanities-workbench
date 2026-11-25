/**
 * Browser half of the humanities workbench: sidebar entry plus the panel page.
 */
window.__ModuleLoader__.load({
  id: '@local/humanities-workbench',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'humanitiesWorkbench';
    const PANEL_ID = 'humanities-workbench';
    const VIEW_KEY = 'humanitiesWorkbench.view';
    const CFG_KEY = 'humanitiesWorkbench.config';
    const MODE_KEY = 'humanitiesWorkbench.mode';
const DATA = '/humanities-workbench/data.json';
const UPD = '/humanities-workbench/update';
    const CONFIGS = '/humanities-workbench/configs.json';

    const DICTS = {
      zh: { panel: '人文社科工作台', title: '人文社科工作台', overview: '概览', facts: '六事实', tensions: '张力', rules: '规则', redlines: '红线', refs: '材料' },
      en: { panel: 'Humanities desk', title: 'Humanities research desk', overview: 'Overview', facts: 'Six facts', tensions: 'Tensions', rules: 'Rules', redlines: 'Red lines', refs: 'Material' },
    };

    const SNAPSHOT = {"meta":{"subtitle":"快照 · 规则 10 条 · 参考册 18 · 2026-11-26 01:16","foot":"","headings":{"chain":"条件链（结构性必要条件，不是时间表）","facts":"事实依赖结构","inferences":"硬约束","tensions":"未解张力","rules":"执行规则 R1–R10","redlines":"红线","refs":"方法论参考册"}},"thesis":"过度决定与情势分析：结构规定可能性空间，具体结果由情势与主观抉择决定。读文本用症候阅读——在该说而没说、过度解释、范畴错位三处定位它服务的立场。","kpi":[["0","张力"],["6","事实"],["10","规则"],["5","红线"]],"chain":["谁占有资源与生产资料（产权 / 决策权 / 分配权）","占有的形式决定收益如何被抽取","抽取方式塑造劳动过程的组织","组织方式约束生产力的发展方向","生活形态与个体发展空间由此被限定"],"boundary":["个体自由：始终是相对的，受共同体规范约束","制度自身：同时承担维持与自我转化的双重任务"],"overdetermination":"经济最终决定，但从不单独出场；「最后实例永不到来」。可能性是绝对的，必然性是相对的。不能写「必然走向」，只能写「在什么情势下、由谁抉择、有多大可能」。","facts":[["① 主事实","资源与生产资料占有的实际分布（产权／决策权／分配权分开看）","最重要 · 唯一独立变量"],["② 派生机制","收益抽取的机制（利润／地租／税收／利息／平台抽成）","被①决定"],["③ 派生机制","劳动过程控制权的归属","跟①有关"],["④ 保障结构","权力不对称及其对抽取的保障","重要"],["⑤ 保障结构","强制机关的实际能力","重要"],["⑥ 主体条件","相关群体的组织化程度 × 是否被制度承认","组织化 × 制度化"]],"inferences":["②③ 不能单独承重：分配形式变化不等于生产关系变化，必须回到①。","① 变了 ②③ 会滞后：旧抽取形式常以新名义存活，滞后是常态。","⑥ 不是人数，是组织度 × 制度化：组织化而无制度化＝只有动员能力；制度化而无组织化＝空壳。"],"tensions":[],"rules":[["R1","证据分级","L0 原件（档案、统计原表、原始影像） / L1 同期出版物（报刊、公文、私人通信） / L2 事后研究（专著、论文）"],["R2","论战性著作","限用：仅当可被独立材料交叉支持；标 source_class=polemics-crossed。 / 同时作意识形态样本分析：修辞、受众、必须夸张什么、在哪里沉默。 / 不因立场拒用，也不因「敢揭露」升格。"],["R3","回忆录与口述","三级证据。必查立场、记忆距离、利益、出版背景。 / 准入：档案统计可验 或 与独立证词互证 或 与结构事实相容。 / 不用：纯规范性论断、不描述具体情况的整体评价、文学化段落当引文。"],["R4","官方文件三档","默认：事情本身大概真实，具体经过可疑。 / 等级：意图 > 执行 > 事后总结。 / 意图（讲话、决议）→ 对「想做什么」高；执行（报表、批复、会议记录）→ 对「怎么运行」较高；"],["R5","立场冲突","先报冲突（不改写材料、不静默调和），再给选项：改判断 / 改对材料的评价 / 保留冲突并标注。"],["R6","反目的论","禁「必然走向 X」。改写为情势句：在<条件>下，由<主体>作出<抉择>，X 成为可能；若<条件>改变，则走向<另一分支>。 / 趋势可以写，但必须写成在条件下被生产出来的。"],["R7","代价分析","强制三段：谁承担成本 / 通过什么机制 / 当时约束下有无替代。 / 禁止用总量数字替代机制说明。"],["R8","事实依赖结构","① 资源与生产资料占有的实际分布（产权/决策权/分配权分开看）   ← 主事实 / ② 收益抽取机制　③ 劳动过程控制权    ← ① 的派生，不得单独承重 / ④ 权力不对称对①②③的保障　⑤ 强制机关的实际能力   ← 保障结构"],["R9","概念使用","先定范畴，再定功能，最后查谱系（见 17、18 册）。 / 同一词在不同范畴间切换即为偷换，必须标出。"],["R10","虚构与史实分隔","架空设定一律标 fiction，与史实输出物理分隔（不同文件、不同小节标题）。"]],"redlines":[["红线一","非目的论，但承认趋势的条件性生成","不写「必然走向X」；趋势须在条件下生成。"],["红线二","不作单一价值前提","任何整体性贬斥若缺结构与利益分析，视为未完成论断，不采信。"],["红线三","fiction 标记","架空设定一律标 fiction，与史实输出物理分隔。"],["红线四","禁道德账本 + 学派并列","代价写谁承担／何机制／有无替代；禁止数字去语境化；学派并列呈现证据与反驳。"],["红线五","单一来源不作合法性依据","合法性判断须经明确程序，不以情绪或单一来源替代。"]],"redlineNote":"降级项：回忆录与论战著作不作红线，作方法（R1／R2）。冲突优先级：红线三 > 红线一 > 红线四 > 其余。","materials":[["0","字幕文件"],["18","参考册"]],"refs":[["01-evidence-bridge.md","01 · 证据桥接与史料批判","一切研究争议最终都落在同一处：**为什么这份材料支持这个理解？**"],["02-source-routing.md","02 · 来源路由（按材料类型）","| 层 | 材料 | 用途 | 可信度起点 |"],["03-close-reading.md","03 · 精读：四法 + 一句一注","精读不是摘要。摘要把文本压短，精读把文本**翻回它正在解决的问题**。"],["04-orchestration.md","04 · 两级编排（DSH 原生）","Misaka 的卡死来自三处：把整套契约注入每个请求、每个角色再起一个 harness、节点递归等待彼此的会话。"],["05-red-team.md","05 · 红队：只挑错","你的任务是让结论受伤，不是让它更漂亮。不要扩写、不要补充材料、不要调整文风、不要替作者辩护。"],["06-divergence.md","06 · 分歧审查：未取之路与缺口","红队问「你错在哪」，你问「你没走哪条路、你漏了什么」。"],["07-counterfactual.md","07 · 反事实与架空推演","反事实不是「随便改一下看看」。它是一条**受史料约束的推理**：改动必须小到史实仍能承重，后果必须大到值得推演。"],["08-setting-audit.md","08 · 架空设定审计","设定的问题通常不在「不符合史实」，而在**没有代价**：制度免费运转、技术免费扩散、意识形态无摩擦。"],["09-coverage.md","09 · 覆盖表与维度扫描","一张研究计划只能覆盖作者想到的东西。覆盖表的作用不是「更全面」，而是让**空白变成声明**，而不是疏忽。"],["10-deliverables.md","10 · 交付物","四种成品，各有固定骨架。不要在正文里出现流程词（节点、卡片、红队、处置、v1/v2）。"],["11-profile.md","11 · 意识形态画像：怎么读一个人，而不是怎么奉承他","画像的目的不是让输出「合口味」，而是让推演**从你的前提出发**，同时把代价说清。"],["12-source-acquisition.md","12 · 电子书获取、入库与版本校勘","研究卡在「书拿不到」上，比卡在「书读不懂」上更常见。这一册处理获取、入库、版本与检索。"],["13-marxist-analysis.md","13 · 马克思主义分析框架与立场纪律","立场不是给结论预先上色，而是决定**先问什么、按什么顺序解释、用什么标准判断解释的强弱**。"],["14-worldbuilding-marxist.md","14 · 目的导向的架空推演（马克思主义用法）","架空世界不是「换个背景讲故事」，而是一个**受约束的思想实验装置**：给定一个目标状态与一组条件，"],["15-conceptual-history.md","15 · 概念史先行","中文里大量抽象词是泊来词。**你在用别人翻译过来的范畴思考，而翻译本身带着立场。**"],["16-video-learning.md","16 · 视频作为史料：工具链与可信度","视频（讲座、访谈、课程、UP 主的概念史讲解）是**线索来源**，不是**承重证据**。"],["17-concept-analysis.md","17 · 概念分析（方法册）","先问三层，不许直接给定义："],["18-method-protocol.md","18 · 概念研究方法协议（可复用流程）","| 输入 | 产物 |"]],"profileBytes":569};

    const CSS = [
      '.hw{height:100%;overflow:auto;overflow-x:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.hw *{box-sizing:border-box}',
      '.hw-wrap{padding:26px 32px 72px}',
      '.hw-head{display:flex;align-items:center;justify-content:space-between;gap:10px 20px;flex-wrap:wrap}',
      '.hw-title{margin:0;font:600 21px/1.3 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Songti SC","Noto Serif CJK SC",serif;letter-spacing:.01em}',
      '.hw-dot{width:6px;height:6px;border-radius:50%;display:inline-block;background:var(--dsw-alias-state-idle-primary);margin-right:6px;vertical-align:1px}',
      '.hw-dot.live{background:var(--dsw-alias-state-success-primary)}',
      '.hw-dot.bad{background:var(--dsw-alias-state-error-primary)}',
      '.hw-pickbtn{appearance:none;border:none;background:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:6px 4px;min-height:30px;max-width:100%;border-bottom:1px dotted var(--dsw-alias-border-l1)}',
      '.hw-pickname{display:inline-block;max-width:9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}',
      '.hw-caret{margin-left:5px;opacity:.55;font-size:9px}',
      '.hw-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;appearance:none;border:none;background:none;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-secondary);padding:8px 10px;min-height:36px;border-radius:6px;cursor:pointer}',
      '.hw-opt:hover{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary)}',
      '.hw-opt.on{color:var(--dsw-alias-label-primary);font-weight:600}',
      '.hw-optname{min-width:0;overflow-wrap:anywhere}',
      '.hw-optmark{flex:none;font:400 10px/1 sans-serif;letter-spacing:.04em;padding:2px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);opacity:.7}',
      '.hw-ver{font-variant-numeric:tabular-nums;letter-spacing:.02em;color:var(--dsw-alias-label-primary)}',
      '.hw-tabs{display:flex;gap:26px;margin:22px 0 0;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-x:auto;scrollbar-width:none}',
      '.hw-tabs::-webkit-scrollbar{display:none}',
      '.hw-tab{appearance:none;border:none;background:none;font:inherit;font-size:13px;color:var(--dsw-alias-label-secondary);padding:0 0 9px;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px}',
      '.hw-tab:hover{color:var(--dsw-alias-label-primary)}',
      '.hw-tab[aria-selected="true"]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-tab i{font-style:normal;font-size:10.5px;margin-left:5px;opacity:.5;font-variant-numeric:tabular-nums}',
      '.hw-body{margin-top:26px}',
      '.hw-h2{font:600 13px/1.6 "Iowan Old Style",Palatino,Georgia,"Songti SC",serif;letter-spacing:.1em;margin:30px 0 10px;color:var(--dsw-alias-label-secondary)}',
      '.hw-h2:first-child{margin-top:0}',
      '.hw-lede{font:400 15px/2.0 "Songti SC","Noto Serif CJK SC",Georgia,serif;text-indent:2em;margin:0;max-width:54rem}',
      '.hw-quote{margin:16px 0 0;padding-left:13px;border-left:2px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.85;text-indent:0}',
      '.hw-stats{display:flex;gap:26px;flex-wrap:wrap;margin:18px 0 0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.hw-stats b{display:block;font:600 18px/1.35 "Iowan Old Style",Palatino,Georgia,serif;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.hw-row{display:grid;grid-template-columns:11rem 1fr;gap:22px;padding:11px 0;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.hw-row:last-child{border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.hw-k{font-size:11.5px;line-height:1.75;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.hw-v{font-size:13px;line-height:1.75;min-width:0;overflow-wrap:anywhere}',
      '.hw-note{font-size:12px;line-height:1.8;color:var(--dsw-alias-label-secondary);margin-top:4px}',
      '.hw-ul{margin:6px 0 0;padding-left:1.1em;font-size:12.5px;line-height:1.9;color:var(--dsw-alias-label-secondary)}',
      '.hw-ul li{margin:3px 0}',
      '.hw-err{color:var(--dsw-alias-state-error-primary);font-size:11.5px;margin-top:4px;max-width:22rem}',
      '.hw-titlerow{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.hw-search{appearance:none;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:5px 9px;min-height:32px;width:9rem;max-width:100%;flex:0 1 9rem}',
      '.hw-search:focus{outline:none;border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}',
      '.hw-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}',
      '.hw-notice{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:8px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);font-size:12.5px;box-shadow:0 10px 28px rgb(0 0 0 / .25);max-width:24rem}',
      '.hw-credit{font-size:11px;color:var(--dsw-alias-label-secondary);text-decoration:none;border-bottom:1px dotted var(--dsw-alias-border-l1);word-break:break-all}',
      '.hw-credit:hover{color:var(--dsw-alias-brand-primary);border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-flow{display:grid;grid-template-columns:minmax(0,1fr) 17rem;gap:30px;align-items:start;margin-top:6px}',
      '.hw-ladder{display:flex;flex-direction:column}',
      '.hw-node{position:relative;padding:8px 0 8px 30px;font-size:13px;line-height:1.75}',
      '.hw-node:before{content:"";position:absolute;left:6px;top:0;bottom:0;width:1px;background:var(--dsw-alias-border-l1)}',
      '.hw-node:first-child:before{top:16px}',
      '.hw-node:last-child:before{bottom:calc(100% - 16px)}',
      '.hw-num{position:absolute;left:0;top:11px;width:13px;height:13px;border-radius:50%;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-size:8px;line-height:11px;text-align:center;font-variant-numeric:tabular-nums}',
      '.hw-bound{border-left:2px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));padding:0 0 0 13px}',
      '.hw-boundtitle{font-size:10.5px;letter-spacing:.14em;color:var(--dsw-alias-label-secondary);margin-bottom:8px}',
      '.hw-bound p{margin:0 0 9px;font-size:12px;line-height:1.8;color:var(--dsw-alias-label-secondary)}',
      '.hw-cols{columns:2;column-gap:36px}',
      '.hw-cols>.hw-row{break-inside:avoid}',
      '@media (max-width:1100px){.hw-cols{columns:1}}',
      '@media (max-width:900px){.hw-flow{grid-template-columns:1fr;gap:18px}}',
      '@media (max-width:720px){.hw-wrap{padding:20px 16px 56px}.hw-tabs{gap:18px}.hw-row{grid-template-columns:1fr;gap:2px}}',
      '.hw-corpusbar{display:flex;gap:10px;margin:18px 0 6px}',
      '.hw-corpusbar>.hw-search{flex:1}',
      '.hw-tbl{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}',
      '.hw-tbl th,.hw-tbl td{border-bottom:1px solid var(--dsw-alias-border-l1);padding:8px 10px;text-align:left;vertical-align:top}',
      '.hw-tbl td{min-width:0;overflow-wrap:anywhere}',
      '.hw-frame{margin-top:16px}',
      '.hw-iframe{width:100%;height:calc(100vh - 240px);min-height:520px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:#fff;display:block}',
      '.hw-framebar{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:2px}',
      '.hw-framebar code{font:inherit;font-size:11px;opacity:.85;word-break:break-all}',
      '.hw-link.on{color:var(--dsw-alias-brand-primary);border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-pill{font-size:11px;line-height:1.7;padding:0 7px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.hw-pill.live{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}',
      '.hw-pill.bad{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}',
      '.hw-paneaction{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin:14px 0 4px}',
      '.hw-tools{display:flex;align-items:center;gap:2px 10px;flex-wrap:wrap;justify-content:flex-end;min-width:0;flex:1 1 auto}',
      '.hw-sep{width:1px;height:16px;background:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));flex:none}',
      '.hw-sheet{margin:10px 0 0;padding:5px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);display:grid;gap:2px;max-height:15rem;overflow-y:auto;overflow-x:hidden;width:100%;flex:1 1 100%}',
      '.hw-lamp{appearance:none;display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:3px 10px;border-radius:15px;border:1px solid var(--dsw-alias-border-l1);background:none;font:inherit;font-size:11.5px;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.hw-lamp:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}',
      '.hw-lamp.on{color:var(--dsw-alias-label-primary)}',
      '.hw-btn{appearance:none;min-height:32px;padding:5px 12px;border-radius:7px;border:1px solid var(--dsw-alias-border-l1);background:none;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-primary);cursor:pointer}',
      '.hw-btn:hover{border-color:var(--dsw-alias-brand-primary)}',
      '.hw-btn:disabled{opacity:.45;cursor:default}',
      '.hw-btn.primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
      '.hw-subhead{display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.hw-subhead h1{font:600 18px/1.3 "Iowan Old Style",Palatino,Georgia,"Songti SC",serif;margin:0}',
      '.hw-browserlede{font-size:13px;line-height:1.9;color:var(--dsw-alias-label-secondary);margin:14px 0 0;max-width:52rem}',
      '.hw-sitecard{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:11px 0;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.hw-sitecard b{font-size:13px;font-weight:600}',
      '.hw-sitecard .hw-grow{flex:1 1 8rem;min-width:0}',
      '@media (max-width:820px){.hw-head{gap:10px}}',
      '@media (max-width:560px){.hw-wrap{padding:16px 12px 48px}.hw-title{font-size:18px}.hw-tools{gap:8px 10px;font-size:11.5px}.hw-tabs{gap:16px;margin-top:16px}.hw-tab{font-size:12.5px}.hw-body{margin-top:18px}.hw-lede{font-size:14.5px;line-height:1.9}.hw-h2{font-size:12px;margin:24px 0 8px}.hw-row{grid-template-columns:1fr;gap:2px;padding:10px 0}.hw-flow{grid-template-columns:1fr;gap:14px}.hw-cols{columns:1}.hw-tbl{display:block;overflow-x:auto}.hw-tbl thead{display:none}.hw-tbl tbody,.hw-tbl tr,.hw-tbl td{display:block;width:auto}.hw-tbl tr{border-top:1px solid var(--dsw-alias-border-l1);padding:10px 0}.hw-tbl td{border:none;padding:2px 0}.hw-tbl td:before{content:attr(data-label);display:block;font-size:10.5px;letter-spacing:.08em;color:var(--dsw-alias-label-secondary);opacity:.8}.hw-notice{left:12px;right:12px;transform:none;max-width:none}.hw-iframe{min-height:360px;height:70vh}.hw-tools{width:100%;justify-content:flex-start}.hw-search{flex:1 1 6rem;width:auto}}',
    ].join('\n');

    function read(key, fallback) {
      try { return window.localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
    }
    function write(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
    }

    function PanelIcon(props) {
      const size = (props && props.size) || 20;
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M5 3.6h11.5a2.5 2.5 0 0 1 2.5 2.5v14.3H7.5A2.5 2.5 0 0 1 5 17.9z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
        h('path', { d: 'M19 20.4H7.4a2.4 2.4 0 0 1 0-4.8H19', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
        h('path', { d: 'M9 7.6h6M9 10.8h4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' })
      );
    }

    function CorpusPane() {
      const [term, setTerm] = React.useState('');
      const [state, setState] = React.useState({ busy: false, hits: [], total: 0, msg: '' });
      const run = function (value) {
        const text = String(value || '').trim();
        if (!text) { setState({ busy: false, hits: [], total: 0, msg: '' }); return; }
        setState({ busy: true, hits: [], total: 0, msg: '' });
        window.fetch('/humanities-workbench/corpus.json?q=' + encodeURIComponent(text), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (json) {
            setState({
              busy: false, hits: json.hits || [], total: json.total || 0,
              msg: json.ready === false ? (json.error || '索引未就绪，请先配置字幕目录') : '',
            });
          })
          .catch(function (e) { setState({ busy: false, hits: [], total: 0, msg: String((e && e.message) || e) }); });
      };
      return h('div', null,
        h('div', { className: 'hw-corpusbar' },
          h('input', {
            className: 'hw-search', type: 'search', value: term, placeholder: '在字幕语料里检索，回车执行',
            onChange: function (e) { setTerm(e.target.value); },
            onKeyDown: function (e) { if (e.key === 'Enter') run(term); },
          })
        ),
        state.msg ? h('p', { className: 'hw-note' }, state.msg) : null,
        state.hits.length ? h('p', { className: 'hw-note' }, '共 ' + state.total + ' 段语料，命中 ' + state.hits.length + ' 条') : null,
        state.hits.map(function (hit, i) {
          return h('div', { key: i, className: 'hw-row' },
            h('div', { className: 'hw-k' }, hit.bvid + (hit.at ? '，' + hit.at : '')),
            h('div', { className: 'hw-v' }, hit.text,
              h('div', { className: 'hw-note' }, '匹配度 ' + hit.score + '，' + hit.file))
          );
        })
      );
    }

    /**
     * The login and reading page. It renders as a page of its own: the parent
     * shows a back bar and no tabs, so nothing here competes with the main views.
     */
    function BrowserPane(props) {
      const [state, setState] = React.useState({ busy: '', error: '', note: '', data: props.browser || null });
      const data = state.data || props.browser || null;
      let alive = true;
      React.useEffect(function () { return function () { alive = false; }; }, []);
      const post = function (body) {
        return window.fetch('/humanities-workbench/browser', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
      };
      const set = function (patch) {
        if (!alive) return;
        setState(function (prev) { return Object.assign({}, prev, patch); });
      };
      const run = function (action, site) {
        set({ busy: action + (site ? ':' + site : ''), error: '', note: '' });
        post({ action: action, site: site || '' })
          .then(function (json) {
            const opened = json.opened || {};
            const verified = json.verified || null;
            let note = '';
            if (action === 'start') note = '浏览器已启动。点「自检」可以实测一次，看能不能真抓到内容。';
            if (action === 'stop') note = '已关闭。下次抓取时会自动重新打开。';
            if (action === 'verify') {
              note = verified ? (verified.ok
                ? '自检通过：读到「' + (verified.title || verified.url) + '」，' + verified.chars + ' 字，用时 ' + (Math.round((verified.ms || 0) / 100) / 10) + ' 秒。'
                : '自检没通过：' + (verified.error || '页面没有正文') + '。先确认本机能上网，再点一次。') : '';
            }
            if (action === 'login') note = opened.ok ? '窗口已打开，二维码在页面上。用手机扫一下，扫完这里会自动确认。' : '';
            if (action === 'wait') {
              const row = json.login || {};
              note = row.loggedIn ? '已登录，之后的抓取会复用这份状态。' : '还没确认到登录。窗口先别关，登录完再点一次「已登录？」。';
            }
            set({ busy: '', error: json.error || opened.error || '', note: note, data: json.browser || data });
            if (action === 'login' && opened.ok && site) {
              set({ busy: 'wait:' + site });
              post({ action: 'wait', site: site })
                .then(function (later) {
                  const row = later.login || {};
                  set({
                    busy: '', data: later.browser || data,
                    note: row.loggedIn ? '已登录，之后的抓取会复用这份状态。' : '还没确认到登录，稍后可以点「已登录？」再看。',
                  });
                })
                .catch(function () { set({ busy: '' }); });
            }
            if (props.onChanged) props.onChanged();
          })
          .catch(function (e) { set({ busy: '', error: String((e && e.message) || e) }); });
      };
      const running = Boolean(data && data.running);
      const sites = (data && data.sites) || [];
      const selfTest = (data && data.selfTest) || null;
      const statusOf = function (site) {
        if (site.login === false) return '公开可读';
        if (site.error) return '检测失败';
        if (site.loginWall === true) return '未登录';
        if (site.loginWall === false) return '已登录';
        return '未检测';
      };
      const pillOf = function (site) {
        if (site.login === false) return 'hw-pill live';
        if (site.error || site.loginWall === true) return 'hw-pill bad';
        if (site.loginWall === false) return 'hw-pill live';
        return 'hw-pill';
      };
      const stamp = function (iso) {
        if (!iso) return '';
        try { return new Date(iso).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
      };
      const selfText = !selfTest ? '还没自检过。点「自检」实测一次：它能告诉你插件到底抓不抓得到内容，而不只是浏览器开没开。'
        : (selfTest.ok ? '上次自检通过（' + stamp(selfTest.at) + '）：读到「' + (selfTest.title || selfTest.url || '一个页面') + '」，' + selfTest.chars + ' 字，用时 ' + (Math.round((selfTest.ms || 0) / 100) / 10) + ' 秒。'
          : '上次自检没通过（' + stamp(selfTest.at) + '）：' + (selfTest.error || '没有取到正文') + '。');
      const modeText = data && data.mode === 'headed' ? '可见窗口' : '无头窗口';
      return h('div', null,
        h('p', { className: 'hw-browserlede' }, '评论、动态、字幕要登录、要滚动才出来，普通抓取拿不到。插件用自己的一个浏览器配置去读，登录一次之后在后台复用，凭证只留在本机。'),
        h('div', { className: 'hw-note', style: { marginTop: '10px' } }, selfText),
        h('div', { className: 'hw-paneaction' },
          h('button', { type: 'button', className: 'hw-btn' + (running ? '' : ' primary'), disabled: Boolean(state.busy) || running, onClick: function () { run('start'); } }, state.busy === 'start' ? '启动中' : '启动'),
          h('button', { type: 'button', className: 'hw-btn', disabled: Boolean(state.busy) || !running, onClick: function () { run('stop'); } }, state.busy === 'stop' ? '关闭中' : '关闭'),
          h('button', { type: 'button', className: 'hw-btn', disabled: Boolean(state.busy), onClick: function () { run('verify'); } }, state.busy === 'verify' ? '正在试抓' : '自检'),
          h('button', { type: 'button', className: 'hw-btn', disabled: Boolean(state.busy), onClick: function () { run('probe'); } }, state.busy === 'probe' ? '逐站检测中' : '检测登录状态'),
          h('span', { className: 'hw-note' }, (running ? '运行中，' + modeText : '未启动，第一次抓取时自动打开') + (data && data.browser ? '；用的是 ' + data.browser : '')),
          data && data.loginCheckedAt ? h('span', { className: 'hw-note' }, '上次检测 ' + stamp(data.loginCheckedAt)) : null
        ),
        state.note ? h('div', { className: 'hw-note' }, state.note) : null,
        state.error ? h('div', { className: 'hw-err' }, state.error) : null,
        h('div', { style: { marginTop: '18px' } },
          h('div', { className: 'hw-h2' }, '站点'),
          sites.map(function (site) {
            const needsLogin = site.login !== false;
            return h('div', { key: site.id, className: 'hw-sitecard' },
              h('b', null, site.name),
              h('span', { className: pillOf(site), title: site.error || site.note || '' }, statusOf(site)),
              h('span', { className: 'hw-grow hw-note' }, String(site.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '')),
              h('span', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                needsLogin ? h('button', {
                  type: 'button', className: 'hw-btn primary', disabled: Boolean(state.busy),
                  onClick: function () { run('login', site.id); },
                }, state.busy === 'login:' + site.id || state.busy === 'wait:' + site.id ? '等待扫码' : '扫码登录') : null,
                needsLogin ? h('button', {
                  type: 'button', className: 'hw-btn', disabled: Boolean(state.busy),
                  onClick: function () { run('wait', site.id); },
                }, '已登录？') : h('button', {
                  type: 'button', className: 'hw-btn', disabled: Boolean(state.busy),
                  onClick: function () { run('login', site.id); },
                }, '打开')
              )
            );
          })
        ),
      );
    }

    /**
     * The configured HTML page, isolated in a sandboxed frame. It gets no
     * credentials, so every read goes through postMessage: the parent answers
     * panel / corpus / configs and nothing else.
     */
    function CustomFrame(props) {
      const frameRef = React.useRef(null);
      const live = React.useRef(props);
      live.current = props;
      const [height, setHeight] = React.useState(props.height || 0);

      React.useEffect(function () {
        const win = function () { return frameRef.current && frameRef.current.contentWindow; };
        const send = function (msg) {
          const target = win();
          if (!target) return;
          try { target.postMessage(msg, '*'); } catch (e) { /* frame went away */ }
        };
        const onMessage = function (event) {
          const target = win();
          if (!target || !event || event.source !== target) return;
          const msg = event.data;
          if (!msg || msg.hw !== 1) return;
          const id = msg.id;
          const reply = function (body) {
            send(Object.assign({ hw: 1, id: id, re: String(msg.op || '') }, body));
          };
          const op = String(msg.op || '');
          if (op === 'hello' || op === 'panel') { reply({ ok: true, data: live.current.data }); return; }
          if (op === 'resize') {
            const n = Number(msg.height);
            if (n > 0) setHeight(Math.min(Math.max(Math.round(n), 320), 8000));
            reply({ ok: true });
            return;
          }
          if (op === 'configs') { reply({ ok: true, configs: live.current.configs || [] }); return; }
          if (op === 'refresh') { reply({ ok: true }); if (live.current.onRefresh) live.current.onRefresh(); return; }
          if (op === 'open-config') { reply({ ok: true }); if (live.current.onOpen) live.current.onOpen(String(msg.config || '')); return; }
          if (op === 'notice') { reply({ ok: true }); if (live.current.onNotice) live.current.onNotice(String(msg.text || '').slice(0, 200)); return; }
          if (op === 'corpus') {
            const term = String(msg.query || '').trim();
            if (!term) { reply({ ok: true, hits: [], total: 0, ready: true }); return; }
            window.fetch('/humanities-workbench/corpus.json?q=' + encodeURIComponent(term), { cache: 'no-store' })
              .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
              .then(function (json) {
                reply({
                  ok: true, ready: json.ready !== false, total: json.total || 0,
                  hits: json.hits || [], error: json.error || '',
                });
              })
              .catch(function (e) { reply({ ok: false, error: String((e && e.message) || e) }); });
            return;
          }
          reply({ ok: false, error: 'unknown op: ' + op });
        };
        window.addEventListener('message', onMessage);
        return function () { window.removeEventListener('message', onMessage); };
      }, []);

      React.useEffect(function () {
        const target = frameRef.current && frameRef.current.contentWindow;
        if (!target) return;
        try { target.postMessage({ hw: 1, op: 'panel', data: props.data }, '*'); } catch (e) { /* not ready */ }
      }, [props.data]);

      return h('div', { className: 'hw-framewrap' },
        h('div', { className: 'hw-framebar' },
          h('span', null, '自定义前端' + (props.title ? '：' + props.title : '') + '（隔离在自己的帧里，数据由插件传入）')
        ),
        h('div', { className: 'hw-frame' },
          h('iframe', {
            ref: frameRef, className: 'hw-iframe', src: props.url, title: props.title || '自定义前端',
            sandbox: 'allow-scripts allow-forms allow-popups allow-downloads',
            referrerPolicy: 'no-referrer',
            style: height ? { height: height + 'px' } : null,
          })
        )
      );
    }

    function Picker(props) {
      const current = props.options.filter(function (o) { return o.id === props.value; })[0] || props.options[0];
      if (!current) return null;
      return h('button', {
        type: 'button', className: 'hw-pickbtn', 'aria-haspopup': 'listbox', 'aria-expanded': props.open ? 'true' : 'false',
        onClick: props.onToggle,
      }, h('span', { className: 'hw-pickname' }, current.name), h('span', { className: 'hw-caret' }, props.open ? '\u25B4' : '\u25BE'));
    }

    function Page(props) {
      const t = (props && props.t) || function (k) { return DICTS.zh[k] || k; };
      const [configs, setConfigs] = React.useState([]);
      const [configId, setConfigId] = React.useState(function () { return read(CFG_KEY, ''); });
      const [data, setData] = React.useState(null);
      const [state, setState] = React.useState({ busy: true, message: '' });
      const [view, setView] = React.useState(function () { return read(VIEW_KEY, 'overview'); });
      const [prevView, setPrevView] = React.useState('overview');
      const [q, setQ] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [mode, setMode] = React.useState(function () { return read(MODE_KEY, 'custom'); });
      const [moreOpen, setMoreOpen] = React.useState(false);
      const [switches, setSwitches] = React.useState(null);
      const [switchBusy, setSwitchBusy] = React.useState('');
      const [configOpen, setConfigOpen] = React.useState(false);
      const [upd, setUpd] = React.useState(null);
      const [updateBusy, setUpdateBusy] = React.useState(false);
      const loadUpdate = function (force) {
        setUpdateBusy(true);
        window.fetch(UPD + (force ? '?force=1' : ''), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (json) { setUpd(json || {}); })
          .catch(function (e) { setUpd({ error: (e && e.message) || '请求失败' }); })
          .then(function () { setUpdateBusy(false); });
      };
      React.useEffect(function () { loadUpdate(false); }, []);
      const hit = function (text) {
        if (!q) return true;
        return String(text || '').toLowerCase().indexOf(q.toLowerCase()) >= 0;
      };

      const load = function (id) {
        setState({ busy: true, message: '' });
        window.fetch(DATA + (id ? '?config=' + encodeURIComponent(id) : ''), { cache: 'no-store' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          })
          .then(function (json) {
            setData(json);
            if (json.switches) setSwitches(json.switches);
            if (json.config) { setConfigId(json.config.id); write(CFG_KEY, json.config.id); }
            setState({ busy: false, message: '' });
          })
          .catch(function (e) {
            setState({ busy: false, message: String((e && e.message) || e) });
            if (!data) setData(SNAPSHOT);
          });
      };

      React.useEffect(function () {
        window.fetch(CONFIGS, { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : { configs: [] }; })
          .then(function (json) { setConfigs(json.configs || []); })
          .catch(function () { setConfigs([]); });
        load(read(CFG_KEY, ''));
      }, []);

      const D = data || SNAPSHOT;
      const H = D.meta.headings;

      const all = ['overview', 'facts', 'tensions', 'rules', 'redlines', 'refs', 'terms', 'corpus'];
      const allowed = (D.config && D.config.tabs && D.config.tabs.length) ? D.config.tabs : all;
      const counts0 = { facts: D.facts.length, tensions: D.tensions.length, rules: D.rules.length, redlines: D.redlines.length, refs: D.refs.length, terms: (D.terms && D.terms.total) || 0, corpus: (D.corpus && D.corpus.ready) ? 1 : 0 };
      const tabs = all.filter(function (k) {
        if (k === 'overview') return true;
        if (k === 'corpus') return Boolean(D.corpus && D.corpus.ready);
        if (k === 'terms') return Boolean(D.terms && D.terms.total > 0);
        if (allowed.indexOf(k) < 0) return false;
        return (counts0[k] || 0) > 0;
      });
      const current = tabs.indexOf(view) >= 0 ? view : tabs[0];
      const labels = { overview: t('overview'), facts: t('facts'), tensions: t('tensions'), rules: t('rules'), redlines: t('redlines'), refs: t('refs'), terms: '术语', corpus: '语料' };
      const sections = Array.isArray(D.sections) ? D.sections : [];
      const hasSections = sections.length > 0;
      const fx = D.frontend || null;
      const showCustom = Boolean(fx && mode !== 'builtin');
      const toggleMode = function () {
        const next = showCustom ? 'builtin' : 'custom';
        setMode(next);
        write(MODE_KEY, next);
      };
      const counts = { facts: D.facts.length, tensions: D.tensions.length, rules: D.rules.length, redlines: D.redlines.length, refs: D.refs.length };

      const askWizard = function (kind, config) {
        const r = props.openWizard && props.openWizard(kind, config || null);
        if (r === 'copied') setNotice('提示词已复制，粘到新对话即可');
        if (r === 'failed') setNotice('无法打开新对话，也无法复制');
      };

      const doImport = function (file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          window.fetch('/humanities-workbench/import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ filename: file.name, text: String(reader.result || '') }),
          })
            .then(function (r) { return r.json(); })
            .then(function (json) {
              if (json.error) { setNotice('导入失败：' + json.error); return; }
              setNotice(json.kind === 'config' ? '已导入配置「' + json.name + '」' : '已存为参考文件「' + json.name + '」');
              if (json.kind === 'config') {
                window.fetch(CONFIGS, { cache: 'no-store' })
                  .then(function (r) { return r.json(); })
                  .then(function (c) { setConfigs(c.configs || []); load(json.id || json.name); })
                  .catch(function () {});
              }
            })
            .catch(function (e) { setNotice('导入失败：' + String((e && e.message) || e)); });
        };
        reader.readAsText(file, 'utf-8');
      };

      function rows(items) {
        return h('div', null, items.map(function (r, i) {
          return h('div', { key: i, className: 'hw-row' },
            h('div', { className: 'hw-k' }, r[0]),
            h('div', { className: 'hw-v' }, r[1], r[2] ? h('div', { className: 'hw-note' }, r[2]) : null)
          );
        }));
      }

      function overview() {
        return h('div', null,
          h('p', { className: 'hw-lede' }, D.thesis),
          h('div', { className: 'hw-stats' }, D.kpi.map(function (k, i) {
            return h('div', { key: i }, h('b', null, k[0]), k[1]);
          })),
          h('h2', { className: 'hw-h2' }, H.chain),
          h('div', { className: 'hw-flow' },
            h('div', { className: 'hw-ladder' }, D.chain.map(function (n, i) {
              const text = typeof n === 'string' ? n : n[0];
              return h('div', { key: i, className: 'hw-node' }, h('span', { className: 'hw-num' }, i + 1), text);
            })),
            h('aside', { className: 'hw-bound' },
              h('div', { className: 'hw-boundtitle' }, '边界条件'),
              (D.boundary || []).map(function (b, i) { return h('p', { key: i }, b); })
            )
          ),
          h('div', { className: 'hw-quote' }, D.overdetermination)
        );
      }

      function facts() {
        return h('div', null,
          h('h2', { className: 'hw-h2' }, H.facts),
          rows(D.facts),
          h('h2', { className: 'hw-h2' }, H.inferences),
          h('ul', { className: 'hw-ul' }, D.inferences.map(function (x, i) { return h('li', { key: i }, x); }))
        );
      }

      function tensions() {
        return h('div', null, h('h2', { className: 'hw-h2' }, H.tensions), rows(D.tensions));
      }

      function rules() {
        return h('div', null,
          h('h2', { className: 'hw-h2' }, H.rules),
          h('div', { className: 'hw-cols' }, D.rules.filter(function (r) { return hit(r[0]) || hit(r[1]) || hit(r[2]); }).map(function (r, i) {
            return h('div', { key: i, className: 'hw-row' },
              h('div', { className: 'hw-k' }, r[0]),
              h('div', { className: 'hw-v' }, r[1], h('div', { className: 'hw-note' }, r[2]))
            );
          }))
        );
      }

      function redlines() {
        return h('div', null, h('h2', { className: 'hw-h2' }, H.redlines), rows(D.redlines), h('div', { className: 'hw-quote' }, D.redlineNote));
      }

      function refs() {
        return h('div', null,
          h('h2', { className: 'hw-h2' }, H.refs),
          h('div', { className: 'hw-stats' }, D.materials.map(function (k, i) {
            return h('div', { key: i }, h('b', null, k[0]), k[1]);
          })),
          h('div', { className: 'hw-cols' }, D.refs.filter(function (r) { return hit(r[0]) || hit(r[1]) || hit(r[2]); }).map(function (r, i) {
            return h('div', { key: i, className: 'hw-row' },
              h('div', { className: 'hw-k' }, r[0]),
              h('div', { className: 'hw-v' }, r[1], h('div', { className: 'hw-note' }, r[2]))
            );
          }))
        );
      }

      function termCards() {
        const list = (D.terms && D.terms.list) || [];
        const shown = list.filter(function (t) { return hit(t[0]) || hit(t[1]) || hit(t[3]) || hit(t[4]); });
        return h('div', null,
          h('h2', { className: 'hw-h2' }, '术语与译名'),
          h('p', { className: 'hw-note' }, '共 ' + list.length + ' 条。中文名、原文与异译都能查；词表外的词按第 21 册四步查证，不要临时造一个顺口的译名。'),
          h('div', { className: 'hw-cols' }, shown.map(function (t, i) {
            return h('div', { key: i, className: 'hw-row' },
              h('div', { className: 'hw-k' }, t[0], t[2] ? h('div', { className: 'hw-note' }, t[2]) : null),
              h('div', { className: 'hw-v' }, t[1],
                t[3] ? h('div', { className: 'hw-note' }, '又译 ' + t[3]) : null,
                t[4] ? h('div', { className: 'hw-note' }, t[4]) : null)
            );
          }))
        );
      }

      function blockOf(spec, index) {
        if (!spec || !spec.kind) return null;
        const items = spec.items || [];
        const title = spec.title ? h('h2', { className: 'hw-h2' }, spec.title) : null;
        const wrap = function (node) { return h('div', { key: index, className: 'hw-sec' }, title, node); };
        if (spec.kind === 'heading') return h('h2', { key: index, className: 'hw-h2' }, spec.text || spec.title || '');
        if (spec.kind === 'lede' || spec.kind === 'prose') return h('p', { key: index, className: 'hw-lede' }, spec.text || '');
        if (spec.kind === 'quote') return h('div', { key: index, className: 'hw-quote' }, spec.text || '');
        if (spec.kind === 'list') return wrap(h('ul', { className: 'hw-ul' }, items.map(function (x, j) { return h('li', { key: j }, x); })));
        if (spec.kind === 'rows') return wrap(h('div', null, items.map(function (r, j) {
          return h('div', { key: j, className: 'hw-row' },
            h('div', { className: 'hw-k' }, r[0]),
            h('div', { className: 'hw-v' }, r[1], r[2] ? h('div', { className: 'hw-note' }, r[2]) : null));
        })));
        if (spec.kind === 'stats') return h('div', { key: index, className: 'hw-stats' }, items.map(function (k, j) {
          return h('div', { key: j }, h('b', null, k[0]), k[1]);
        }));
        if (spec.kind === 'chain') return wrap(h('div', { className: 'hw-flow' },
          h('div', { className: 'hw-ladder' }, items.map(function (n, j) {
            return h('div', { key: j, className: 'hw-node' }, h('span', { className: 'hw-num' }, j + 1), String(n));
          })),
          spec.aside ? h('aside', { className: 'hw-bound' },
            h('div', { className: 'hw-boundtitle' }, spec.aside.title || '边界条件'),
            (spec.aside.items || []).map(function (x, j) { return h('p', { key: j }, x); })) : null));
        if (spec.kind === 'table') return wrap(h('table', { className: 'hw-tbl' },
          h('thead', null, h('tr', null, (spec.columns || []).map(function (c, j) { return h('th', { key: j }, c); }))),
          h('tbody', null, (spec.rows || []).map(function (r, j) {
            return h('tr', { key: j }, (r || []).map(function (c, k) { return h('td', { key: k }, c); }));
          }))));
        if (spec.kind === 'cards' || spec.kind === 'cols') return wrap(h('div', { className: 'hw-cols' }, items.map(function (c, j) {
          return h('div', { key: j, className: 'hw-row' },
            h('div', { className: 'hw-k' }, c.title || c[0] || ''),
            h('div', { className: 'hw-v' }, c.text || c[1] || '', c.note ? h('div', { className: 'hw-note' }, c.note) : null));
        })));
        return null;
      }

      const showBrowserPage = view === 'browser';
      const body = showBrowserPage
        ? h(BrowserPane, {
            browser: D.browser,
            onChanged: function () { load(configId); },
            onBack: function () { setView(prevView); },
          })
        : showCustom
        ? h(CustomFrame, {
            url: fx.url, title: fx.title, height: fx.height,
            data: D, configs: configs,
            onRefresh: function () { load(configId); },
            onOpen: function (id) { load(id); },
            onNotice: function (text) { setNotice(text); },
          })
        : hasSections
        ? h('div', null, sections.map(function (spec, i) { return blockOf(spec, i); }))
        : current === 'corpus' ? h(CorpusPane, null)
        : current === 'facts' ? facts()
        : current === 'tensions' ? tensions()
        : current === 'rules' ? rules()
        : current === 'redlines' ? redlines()
        : current === 'refs' ? refs()
        : current === 'terms' ? termCards()
        : overview();

      const subPage = showBrowserPage;
      const lampOn = function (key) {
        const s = switches || (D && D.switches) || null;
        return s ? s[key] !== false : true;
      };
      const setSwitch = function (key, value) {
        if (switchBusy) return;
        setSwitchBusy(key);
        const patch = {};
        patch[key] = value;
        window.fetch('/humanities-workbench/state', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ switches: patch }),
        })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (json) {
            setSwitchBusy('');
            if (json && json.switches) setSwitches(json.switches);
            setNotice(key === 'method'
              ? (value ? '方法论与本地配置已打开：下一个回合模型就能读到这段。' : '方法论与本地配置已关闭：模型那边这一段不再出现。')
              : (value ? '语料关键词提示已打开：问到语料里出现过的词时才提示去检索。' : '语料关键词提示已关闭。'));
          })
          .catch(function (e) { setSwitchBusy(''); setNotice('切换失败：' + String((e && e.message) || e)); });
      };
      const lamp = function (key, label, title) {
        const on = lampOn(key);
        return h('button', {
          type: 'button', className: 'hw-lamp' + (on ? ' on' : ''),
          title: title, 'aria-pressed': on ? 'true' : 'false',
          disabled: switchBusy === key,
          onClick: function () { setSwitch(key, !on); },
        }, h('span', { className: 'hw-dot' + (on ? ' live' : ' bad') }), label + (on ? ' 开' : ' 关'));
      };
      const version = (data && data.version) || (D && D.version) || '';
      const updateNote = !upd ? '' : (upd.error ? '查不到上游：' + upd.error : (upd.behind ? '上游已到 ' + upd.latest : (upd.latest ? '已是最新 ' + upd.latest : '')));
      const updateLink = upd && upd.behind ? (upd.url || '') : '';
      const menu = [
        { key: 'refresh', label: '刷新', title: '重新读取当前配置的数据', disabled: state.busy, run: function () { load(configId); } },
        { key: 'update', label: updateBusy ? '检查更新中' : '检查更新', title: '向 GitHub 取最新 Release，六小时内不重复请求', disabled: updateBusy, run: function () { loadUpdate(true); } },
        { key: 'new', label: '新建配置', title: '先问一组问题，再按回答生成一套配置与配套前端', run: function () { askWizard('new', D.config); } },
        { key: 'refine', label: '完善配置', title: '读当前这套配置与最近的使用，提出增量改动，只改这一套', run: function () { askWizard('refine', D.config); } },
        { key: 'export', label: '导出', title: '把当前这套配置导出成 Markdown', run: function () { props.exportMd && props.exportMd(D, current); } },
      ];
      if (fx) menu.push({ key: 'mode', label: showCustom ? '内置视图' : '自定义前端', title: '在自定义前端与内置视图之间切换' + (fx.title ? '：' + fx.title : ''), run: toggleMode });
      const header = subPage
        ? h('div', { className: 'hw-subhead' },
            h('button', { type: 'button', className: 'hw-btn', onClick: function () { setView(prevView); } }, '← 返回'),
            h('h1', null, '登录与抓取'),
            h('span', { className: 'hw-pill' + (D.browser && D.browser.running ? ' live' : '') }, D.browser && D.browser.running ? '浏览器运行中' : '未启动')
          )
        : h('div', { className: 'hw-head' },
            h('div', { className: 'hw-titlerow' },
              h('h1', { className: 'hw-title' }, t('title')),
              h('span', { className: 'hw-ver', title: '当前安装的版本' }, 'v' + version),
              h('a', { className: 'hw-credit', href: 'https://b23.tv/mNKRdjZ', target: '_blank', rel: 'noopener noreferrer' }, '技术红茶@bilibili')
            ),
            h('div', { className: 'hw-tools' },
              configs.length > 1 ? h(Picker, {
                options: configs, value: configId || (configs[0] && configs[0].id),
                open: configOpen,
                onToggle: function () { setConfigOpen(!configOpen); setMoreOpen(false); },
                onChange: function (id) { setConfigOpen(false); load(id); },
              }) : null,
              configs.length > 1 ? h('span', { className: 'hw-sep', 'aria-hidden': 'true' }) : null,
              lamp('method', '方法论', '方法论与本地配置进不进模型上下文：绿灯进，红灯不进；点一下切换。'),
              lamp('corpus', '语料关键词', '问到本机字幕语料里出现过的词时，才提示去检索；点一下切换。'),
              h('span', { className: 'hw-sep', 'aria-hidden': 'true' }),
              h('button', { type: 'button', className: 'hw-btn', onClick: function () { setPrevView(current); setView('browser'); } }, '登录与抓取'),
              h('input', {
                className: 'hw-search', type: 'search', value: q, placeholder: '搜索', 'aria-label': '搜索本页内容',
                onChange: function (e) { setQ(e.target.value); },
              }),
              h('button', {
                type: 'button', className: 'hw-btn', 'aria-haspopup': 'menu', 'aria-expanded': moreOpen,
                title: upd && upd.behind ? '上游有 ' + upd.latest : '配置维护：刷新、新建、导入、导出、完善、检查更新',
                onClick: function () { setMoreOpen(!moreOpen); setConfigOpen(false); },
              }, '\u22EF')
            ),
            configOpen && configs.length > 1 ? h('div', { className: 'hw-sheet', role: 'listbox', 'aria-label': '配置' },
              configs.map(function (o) {
                const on = o.id === (configId || (configs[0] && configs[0].id));
                return h('button', {
                  key: o.id, type: 'button', role: 'option', 'aria-selected': on ? 'true' : 'false',
                  className: on ? 'hw-opt on' : 'hw-opt',
                  onClick: function () { setConfigOpen(false); load(o.id); },
                }, h('span', { className: 'hw-optname' }, o.name), on ? h('span', { className: 'hw-optmark' }, '当前') : null);
              })
            ) : null,
            moreOpen ? h('div', { className: 'hw-sheet', role: 'menu' },
              updateLink ? h('a', { className: 'hw-opt', href: updateLink, target: '_blank', rel: 'noopener noreferrer' }, h('span', { className: 'hw-optname' }, '上游有 ' + upd.latest + '，看更新说明')) : null,
              menu.map(function (row) {
                return h('button', {
                  key: row.key, type: 'button', role: 'menuitem', className: 'hw-opt',
                  disabled: Boolean(row.disabled), title: row.title || '',
                  onClick: function () { setMoreOpen(false); row.run(); },
                }, h('span', { className: 'hw-optname' }, row.label));
              }),
              h('label', { className: 'hw-opt', title: '导入配置：JSON、Markdown 或纯文本' },
                h('span', { className: 'hw-optname' }, '导入'),
                h('input', {
                  type: 'file', accept: '.json,.md,.txt,.markdown', style: { display: 'none' },
                  onChange: function (e) { setMoreOpen(false); doImport(e.target.files && e.target.files[0]); e.target.value = ''; },
                })
              )
            ) : null
          );
      return h('div', { className: 'hw' },
        h('style', null, CSS),
        h('div', { className: 'hw-wrap' },
          header,
          (subPage || hasSections || showCustom) ? null : h('div', { className: 'hw-tabs', role: 'tablist' }, tabs.map(function (key) {
            return h('button', {
              key: key, type: 'button', role: 'tab', className: 'hw-tab',
              'aria-selected': current === key ? 'true' : 'false',
              onClick: function () { setView(key); write(VIEW_KEY, key); },
            }, labels[key], counts[key] == null ? null : h('i', null, counts[key]));
          })),
          h('div', { className: 'hw-body', role: 'tabpanel' }, body),
          state.message ? h('div', { className: 'hw-err' }, state.message) : null,
          D.frontendError ? h('div', { className: 'hw-err' }, '自定义前端未启用：' + D.frontendError) : null,
          notice ? h('div', { className: 'hw-notice' }, notice) : null
        )
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(function () { return ctx.locale.register(NS, DICTS); }, 'humanities-workbench: dictionaries');
        const t = ctx.locale.bind(NS);

        /**
         * Two different jobs, two different prompts. Building a set starts from
         * the user's answers; refining one starts from what this set already is.
         */
        const openWizard = function (kind, config) {
          const name = (config && config.name) || '默认配置';
          const id = (config && config.id) || 'default';
          const text = kind === 'refine'
            ? [
                '完善当前这套「人文社科工作台」配置，只改这一套。',
                '配置：' + name + '，文件：~/.dsh/humanities-workbench/configs/' + id + '.json',
                '步骤：',
                '1 先读这个 JSON 与它 skillDir 下的 profile.md、rules.md、panel.json、terms.json，指出与最近使用不符的地方：没人看的栏目、没被用到的规则、缺词的术语表。',
                '2 每次只提三到五条改动，逐条说明依据，等我点头再改。',
                '3 只动这一套配置和它指向的目录，不动其它配置，也不动别的插件。',
                '4 改完用 data.json 带 config 参数验证，再报告改了什么。',
              ].join('\n')
            : [
                '新建一套「人文社科工作台」配置。配置目录：~/.dsh/humanities-workbench/configs/，当前是：' + name,
                '步骤：',
                '1 先问我五件事：研究领域与时段；常用材料类型（档案、报刊、论文、影像）；判断框架与要避开的立场；需要哪些栏目；前端怎么做（用内置排版，还是自己写一份 HTML）。',
                '2 按回答写 <id>.json，字段 id、name、skillDir、subsDir、tabs、note。要独立画像时把 humanities-research 复制到新目录，不要覆盖已有目录。',
                '3 要自定义前端就在该目录放 frontend/index.html，并在配置里写 frontend 字段；不同配置可以各自指向不同的前端。',
                '4 用 data.json 带 config 参数校验规则与参考册数量。',
                '5 报告新建了什么，不动其它配置，也不动别的插件。',
              ].join('\n');
          const ui = ctx.get('uiWorkspace');
          if (ui && typeof ui.startSession === 'function') {
            ui.startSession(undefined, { prompt: text, whenDraftExists: 'replace' });
            return 'opened';
          }
          try { window.navigator.clipboard.writeText(text); return 'copied'; } catch (e) { return 'failed'; }
        };

        const exportMd = function (D, tab) {
          const out = [];
          const push = function (s) { out.push(s); };
          push('# ' + ((D.config && D.config.name) || 'humanities') + '（' + tab + '）');
          push('');
          if (tab === 'overview') {
            push(D.thesis || '');
            push('');
            (D.chain || []).forEach(function (c, i) { push((i + 1) + '. ' + (typeof c === 'string' ? c : c[0])); });
            push('');
            (D.boundary || []).forEach(function (b) { push('> 边界条件：' + b); });
            if (D.overdetermination) { push(''); push(D.overdetermination); }
          } else if (tab === 'rules') {
            (D.rules || []).forEach(function (r) { push('## ' + r[0] + ' ' + r[1]); push(''); push(r[2] || ''); push(''); });
          } else if (tab === 'refs') {
            (D.refs || []).forEach(function (r) { push('- **' + r[0] + '** ' + r[1] + '：' + (r[2] || '')); });
          } else {
            (D[tab] || []).forEach(function (r) { push('- ' + [].concat(r).filter(Boolean).join('，')); });
          }
          const blob = new Blob([out.join('\n')], { type: 'text/markdown;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'humanities-' + tab + '.md';
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        };

        ctx.slots.inject('main', function () {
          return ctx.slots.register({
            name: 'main', key: PANEL_ID, locale: NS,
            inject: function () { return { t: t, openWizard: openWizard, exportMd: exportMd }; },
          }, Page);
        });
        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register({
            name: 'sidebar.panellist', id: PANEL_ID, order: 1,
            label: function () { return t('panel'); }, locale: NS,
          }, PanelIcon);
        });
      },
    };
  },
});

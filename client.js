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
    const DATA = '/humanities-workbench/data.json';
    const CONFIGS = '/humanities-workbench/configs.json';

    const DICTS = {
      zh: { panel: '人文社科工作台', title: '人文社科工作台', overview: '概览', facts: '六事实', tensions: '张力', rules: '规则', redlines: '红线', refs: '材料' },
      en: { panel: 'Humanities desk', title: 'Humanities research desk', overview: 'Overview', facts: 'Six facts', tensions: 'Tensions', rules: 'Rules', redlines: 'Red lines', refs: 'Material' },
    };

    const SNAPSHOT = {"meta":{"subtitle":"快照 · 规则 10 条 · 参考册 16 · 2026-11-23 13:19","foot":"","headings":{"chain":"条件链（结构性必要条件，不是时间表）","facts":"事实依赖结构","inferences":"硬约束","tensions":"未解张力","rules":"执行规则 R1–R10","redlines":"红线","refs":"方法论参考册"}},"thesis":"过度决定与情势分析：结构规定可能性空间，具体结果由情势与主观抉择决定。读文本用症候阅读——在该说而没说、过度解释、范畴错位三处定位它服务的立场。","kpi":[["0","张力"],["6","事实"],["10","规则"],["5","红线"]],"chain":["谁占有资源与生产资料（产权 / 决策权 / 分配权）","占有的形式决定收益如何被抽取","抽取方式塑造劳动过程的组织","组织方式约束生产力的发展方向","生活形态与个体发展空间由此被限定"],"boundary":["个体自由：始终是相对的，受共同体规范约束","制度自身：同时承担维持与自我转化的双重任务"],"overdetermination":"经济最终决定，但从不单独出场；「最后实例永不到来」。可能性是绝对的，必然性是相对的。不能写「必然走向」，只能写「在什么情势下、由谁抉择、有多大可能」。","facts":[["① 主事实","资源与生产资料占有的实际分布（产权／决策权／分配权分开看）","最重要 · 唯一独立变量"],["② 派生机制","收益抽取的机制（利润／地租／税收／利息／平台抽成）","被①决定"],["③ 派生机制","劳动过程控制权的归属","跟①有关"],["④ 保障结构","权力不对称及其对抽取的保障","重要"],["⑤ 保障结构","强制机关的实际能力","重要"],["⑥ 主体条件","相关群体的组织化程度 × 是否被制度承认","组织化 × 制度化"]],"inferences":["②③ 不能单独承重：分配形式变化不等于生产关系变化，必须回到①。","① 变了 ②③ 会滞后：旧抽取形式常以新名义存活，滞后是常态。","⑥ 不是人数，是组织度 × 制度化：组织化而无制度化＝只有动员能力；制度化而无组织化＝空壳。"],"tensions":[],"rules":[["R1","证据分级","L0 原件（档案、统计原表、原始影像） / L1 同期出版物（报刊、公文、私人通信） / L2 事后研究（专著、论文）"],["R2","论战性著作","限用：仅当可被独立材料交叉支持；标 source_class=polemics-crossed。 / 同时作意识形态样本分析：修辞、受众、必须夸张什么、在哪里沉默。 / 不因立场拒用，也不因「敢揭露」升格。"],["R3","回忆录与口述","三级证据。必查立场、记忆距离、利益、出版背景。 / 准入：档案统计可验 或 与独立证词互证 或 与结构事实相容。 / 不用：纯规范性论断、不描述具体情况的整体评价、文学化段落当引文。"],["R4","官方文件三档","默认：事情本身大概真实，具体经过可疑。 / 等级：意图 > 执行 > 事后总结。 / 意图（讲话、决议）→ 对「想做什么」高；执行（报表、批复、会议记录）→ 对「怎么运行」较高；"],["R5","立场冲突","先报冲突（不改写材料、不静默调和），再给选项：改判断 / 改对材料的评价 / 保留冲突并标注。"],["R6","反目的论","禁「必然走向 X」。改写为情势句：在<条件>下，由<主体>作出<抉择>，X 成为可能；若<条件>改变，则走向<另一分支>。 / 趋势可以写，但必须写成在条件下被生产出来的。"],["R7","代价分析","强制三段：谁承担成本 / 通过什么机制 / 当时约束下有无替代。 / 禁止用总量数字替代机制说明。"],["R8","事实依赖结构","① 资源与生产资料占有的实际分布（产权/决策权/分配权分开看）   ← 主事实 / ② 收益抽取机制　③ 劳动过程控制权    ← ① 的派生，不得单独承重 / ④ 权力不对称对①②③的保障　⑤ 强制机关的实际能力   ← 保障结构"],["R9","概念使用","先定范畴，再定功能，最后查谱系（见 17、18 册）。 / 同一词在不同范畴间切换即为偷换，必须标出。"],["R10","虚构与史实分隔","架空设定一律标 fiction，与史实输出物理分隔（不同文件、不同小节标题）。"]],"redlines":[["红线一","非目的论，但承认趋势的条件性生成","不写「必然走向X」；趋势须在条件下生成。"],["红线二","不作单一价值前提","任何整体性贬斥若缺结构与利益分析，视为未完成论断，不采信。"],["红线三","fiction 标记","架空设定一律标 fiction，与史实输出物理分隔。"],["红线四","禁道德账本 + 学派并列","代价写谁承担／何机制／有无替代；禁止数字去语境化；学派并列呈现证据与反驳。"],["红线五","单一来源不作合法性依据","合法性判断须经明确程序，不以情绪或单一来源替代。"]],"redlineNote":"降级项：回忆录与论战著作不作红线，作方法（R1／R2）。冲突优先级：红线三 > 红线一 > 红线四 > 其余。","materials":[["0","字幕文件"],["16","参考册"]],"refs":[["01-evidence-bridge.md","01 · 证据桥接与史料批判","一切研究争议最终都落在同一处：**为什么这份材料支持这个理解？**"],["02-source-routing.md","02 · 来源路由（按材料类型）","| 层 | 材料 | 用途 | 可信度起点 |"],["03-close-reading.md","03 · 精读：四法 + 一句一注","精读不是摘要。摘要把文本压短，精读把文本**翻回它正在解决的问题**。"],["04-orchestration.md","04 · 两级编排（DSH 原生）","Misaka 的卡死来自三处：把整套契约注入每个请求、每个角色再起一个 harness、节点递归等待彼此的会话。"],["05-red-team.md","05 · 红队：只挑错","你的任务是让结论受伤，不是让它更漂亮。不要扩写、不要补充材料、不要调整文风、不要替作者辩护。"],["06-divergence.md","06 · 分歧审查：未取之路与缺口","红队问「你错在哪」，你问「你没走哪条路、你漏了什么」。"],["07-counterfactual.md","07 · 反事实与架空推演","反事实不是「随便改一下看看」。它是一条**受史料约束的推理**：改动必须小到史实仍能承重，后果必须大到值得推演。"],["08-setting-audit.md","08 · 架空设定审计","设定的问题通常不在「不符合史实」，而在**没有代价**：制度免费运转、技术免费扩散、意识形态无摩擦。"],["09-coverage.md","09 · 覆盖表与维度扫描","一张研究计划只能覆盖作者想到的东西。覆盖表的作用不是「更全面」，而是让**空白变成声明**，而不是疏忽。"],["10-deliverables.md","10 · 交付物","四种成品，各有固定骨架。不要在正文里出现流程词（节点、卡片、红队、处置、v1/v2）。"],["11-profile.md","11 · 意识形态画像：怎么读一个人，而不是怎么奉承他","画像的目的不是让输出「合口味」，而是让推演**从你的前提出发**，同时把代价说清。"],["12-source-acquisition.md","12 · 电子书获取、入库与版本校勘","研究卡在「书拿不到」上，比卡在「书读不懂」上更常见。这一册处理获取、入库、版本与检索。"],["15-conceptual-history.md","15 · 概念史先行","中文里大量抽象词是泊来词。**你在用别人翻译过来的范畴思考，而翻译本身带着立场。**"],["16-video-learning.md","16 · 视频作为史料：工具链与可信度","视频（讲座、访谈、课程、UP 主的概念史讲解）是**线索来源**，不是**承重证据**。"],["17-concept-analysis.md","17 · 概念分析（方法册）","先问三层，不许直接给定义："],["18-method-protocol.md","18 · 概念研究方法协议（可复用流程）","| 输入 | 产物 |"]],"profileBytes":569};

    const CSS = [
      '.hw{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.hw *{box-sizing:border-box}',
      '.hw-wrap{padding:26px 32px 72px}',
      '.hw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}',
      '.hw-title{margin:0;font:600 21px/1.3 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Songti SC","Noto Serif CJK SC",serif;letter-spacing:.01em}',
      '.hw-right{display:flex;align-items:center;gap:14px;font-size:12px;color:var(--dim,var(--dsw-alias-label-secondary))}',
      '.hw-dot{width:6px;height:6px;border-radius:50%;display:inline-block;background:var(--dsw-alias-state-idle-primary);margin-right:6px;vertical-align:1px}',
      '.hw-dot.live{background:var(--dsw-alias-state-success-primary)}',
      '.hw-dot.bad{background:var(--dsw-alias-state-error-primary)}',
      '.hw-link{appearance:none;border:none;background:none;padding:0;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;border-bottom:1px dotted var(--dsw-alias-border-l1)}',
      '.hw-link:hover{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-link:disabled{opacity:.45;cursor:default}',
      '.hw-pick{position:relative}',
      '.hw-pickbtn{appearance:none;border:none;background:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:0 2px;border-bottom:1px dotted var(--dsw-alias-border-l1)}',
      '.hw-caret{margin-left:5px;opacity:.55;font-size:9px}',
      '.hw-scrim{position:fixed;inset:0;z-index:40}',
      '.hw-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:41;min-width:11rem;padding:5px;border-radius:8px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));border:1px solid var(--dsw-alias-border-l1);box-shadow:0 12px 32px rgb(0 0 0 / .28)}',
      '.hw-opt{display:block;width:100%;text-align:left;appearance:none;border:none;background:none;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-secondary);padding:6px 9px;border-radius:5px;cursor:pointer}',
      '.hw-opt:hover{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary)}',
      '.hw-opt.on{color:var(--dsw-alias-label-primary);font-weight:600}',
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
      '.hw-steps{counter-reset:s;margin:6px 0 0}',
      '.hw-step{counter-increment:s;position:relative;padding:9px 0 9px 22px;font-size:13px;line-height:1.75;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.hw-step:before{content:counter(s);position:absolute;left:0;top:10px;font-size:10.5px;color:var(--dsw-alias-label-secondary);opacity:.6;font-variant-numeric:tabular-nums}',
      '.hw-step.off{color:var(--dsw-alias-label-secondary);font-style:italic}',
      '.hw-row{display:grid;grid-template-columns:11rem 1fr;gap:22px;padding:11px 0;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.hw-row:last-child{border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.hw-k{font-size:11.5px;line-height:1.75;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.hw-v{font-size:13px;line-height:1.75}',
      '.hw-note{font-size:12px;line-height:1.8;color:var(--dsw-alias-label-secondary);margin-top:4px}',
      '.hw-ul{margin:6px 0 0;padding-left:1.1em;font-size:12.5px;line-height:1.9;color:var(--dsw-alias-label-secondary)}',
      '.hw-ul li{margin:3px 0}',
      '.hw-err{color:var(--dsw-alias-state-error-primary);font-size:11.5px;margin-top:4px;max-width:22rem}',
      '.hw-titlerow{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.hw-search{appearance:none;border:none;border-bottom:1px solid var(--dsw-alias-border-l1);background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:1px 2px;width:8rem}',
      '.hw-search:focus{outline:none;border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}',
      '.hw-check{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none}',
      '.hw-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}',
      '.hw-notice{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:8px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);font-size:12.5px;box-shadow:0 10px 28px rgb(0 0 0 / .25);max-width:24rem}',
      '.hw-credit{font-size:11px;color:var(--dsw-alias-label-secondary);text-decoration:none;border-bottom:1px dotted var(--dsw-alias-border-l1);white-space:nowrap}',
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

    function Picker(props) {
      const [open, setOpen] = React.useState(false);
      const current = props.options.filter(function (o) { return o.id === props.value; })[0] || props.options[0];
      if (!current) return null;
      return h('div', { className: 'hw-pick' },
        h('button', {
          type: 'button', className: 'hw-pickbtn', 'aria-haspopup': 'listbox', 'aria-expanded': open,
          onClick: function () { setOpen(!open); },
        }, current.name, h('span', { className: 'hw-caret' }, '\u25BE')),
        open ? h('div', { className: 'hw-scrim', onClick: function () { setOpen(false); } }) : null,
        open ? h('div', { className: 'hw-menu', role: 'listbox', onClick: function (e) { e.stopPropagation(); } },
          props.options.map(function (o) {
            return h('button', {
              key: o.id, type: 'button', role: 'option', 'aria-selected': o.id === props.value,
              className: o.id === props.value ? 'hw-opt on' : 'hw-opt',
              onClick: function () { props.onChange(o.id); setOpen(false); },
            }, o.name);
          })
        ) : null
      );
    }

    function Page(props) {
      const t = (props && props.t) || function (k) { return DICTS.zh[k] || k; };
      const [configs, setConfigs] = React.useState([]);
      const [configId, setConfigId] = React.useState(function () { return read(CFG_KEY, ''); });
      const [data, setData] = React.useState(null);
      const [state, setState] = React.useState({ busy: true, live: false, message: '' });
      const [view, setView] = React.useState(function () { return read(VIEW_KEY, 'overview'); });
      const [q, setQ] = React.useState('');
      const [autoWizard, setAutoWizard] = React.useState(function () { return read('humanitiesWorkbench.autoWizard', '1') === '1'; });
      const [notice, setNotice] = React.useState('');
      const hit = function (text) {
        if (!q) return true;
        return String(text || '').toLowerCase().indexOf(q.toLowerCase()) >= 0;
      };

      const load = function (id) {
        setState({ busy: true, live: false, message: '' });
        window.fetch(DATA + (id ? '?config=' + encodeURIComponent(id) : ''), { cache: 'no-store' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          })
          .then(function (json) {
            setData(json);
            if (json.config) { setConfigId(json.config.id); write(CFG_KEY, json.config.id); }
            setState({ busy: false, live: true, message: '' });
          })
          .catch(function (e) {
            setState({ busy: false, live: false, message: String((e && e.message) || e) });
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
      let readAt = '';
      try {
        readAt = new Date(D.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch (e) { readAt = ''; }

      const all = ['overview', 'facts', 'tensions', 'rules', 'redlines', 'refs'];
      const allowed = (D.config && D.config.tabs && D.config.tabs.length) ? D.config.tabs : all;
      const counts0 = { facts: D.facts.length, tensions: D.tensions.length, rules: D.rules.length, redlines: D.redlines.length, refs: D.refs.length };
      const tabs = all.filter(function (k) {
        if (allowed.indexOf(k) < 0) return false;
        if (k === 'overview') return true;
        return (counts0[k] || 0) > 0;
      });
      const current = tabs.indexOf(view) >= 0 ? view : tabs[0];
      const labels = { overview: t('overview'), facts: t('facts'), tensions: t('tensions'), rules: t('rules'), redlines: t('redlines'), refs: t('refs') };
      const counts = { facts: D.facts.length, tensions: D.tensions.length, rules: D.rules.length, redlines: D.redlines.length, refs: D.refs.length };

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

      const body = current === 'facts' ? facts()
        : current === 'tensions' ? tensions()
        : current === 'rules' ? rules()
        : current === 'redlines' ? redlines()
        : current === 'refs' ? refs()
        : overview();

      const status = state.busy ? '' : state.live ? ' live' : ' bad';
      const statusText = state.busy ? '读取中' : state.live ? '实时' : '快照';

      return h('div', { className: 'hw' },
        h('style', null, CSS),
        h('div', { className: 'hw-wrap' },
          h('div', { className: 'hw-head' },
            h('div', { className: 'hw-titlerow' },
              h('h1', { className: 'hw-title' }, t('title')),
              h('a', { className: 'hw-credit', href: 'https://b23.tv/mNKRdjZ', target: '_blank', rel: 'noopener noreferrer' }, '技术红茶@bilibili')
            ),
            h('div', { className: 'hw-right' },
              configs.length > 1 ? h(Picker, {
                options: configs, value: configId || (configs[0] && configs[0].id),
                onChange: function (id) { load(id); },
              }) : null,
              h('span', { title: state.message || '' }, h('span', { className: 'hw-dot' + status }), statusText + (readAt && state.live ? ' ' + readAt : '')),
              h('input', {
                className: 'hw-search', type: 'search', value: q, placeholder: '搜索',
                onChange: function (e) { setQ(e.target.value); },
              }),
              h('button', { type: 'button', className: 'hw-link', onClick: function () { load(configId); }, disabled: state.busy }, '刷新'),
              h('label', { className: 'hw-link' }, '导入',
                h('input', {
                  type: 'file', accept: '.json,.md,.txt,.markdown', style: { display: 'none' },
                  onChange: function (e) { doImport(e.target.files && e.target.files[0]); e.target.value = ''; },
                })
              ),
              h('button', { type: 'button', className: 'hw-link', onClick: function () { props.exportMd && props.exportMd(D, current); } }, '导出'),
              h('button', {
                type: 'button', className: 'hw-link',
                onClick: function () {
                  const r = props.openWizard && props.openWizard(D.config ? D.config.name : '', autoWizard);
                  if (r === 'copied') setNotice('提示词已复制，粘到新对话即可');
                  if (r === 'failed') setNotice('无法打开新对话，也无法复制');
                },
              }, '新建配置'),
              h('label', { className: 'hw-check', title: '开启后「新建配置」直接开一个新对话；关闭则只复制提示词' },
                h('input', {
                  type: 'checkbox', checked: autoWizard,
                  onChange: function (e) { setAutoWizard(e.target.checked); write('humanitiesWorkbench.autoWizard', e.target.checked ? '1' : '0'); },
                }),
                '对话改配置'
              )
            )
          ),
          h('div', { className: 'hw-tabs', role: 'tablist' }, tabs.map(function (key) {
            return h('button', {
              key: key, type: 'button', role: 'tab', className: 'hw-tab',
              'aria-selected': current === key ? 'true' : 'false',
              onClick: function () { setView(key); write(VIEW_KEY, key); },
            }, labels[key], counts[key] == null ? null : h('i', null, counts[key]));
          })),
          h('div', { className: 'hw-body', role: 'tabpanel' }, body),
          state.message ? h('div', { className: 'hw-err' }, state.message) : null,
          notice ? h('div', { className: 'hw-notice' }, notice) : null
        )
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(function () { return ctx.locale.register(NS, DICTS); }, 'humanities-workbench: dictionaries');
        const t = ctx.locale.bind(NS);

        const openWizard = function (name, auto) {
          const text = [
            '新建或修改一套「人文社科工作台」配置。',
            '配置目录：~/.dsh/humanities-workbench/configs/，当前：' + (name || '默认配置'),
            '字段：id / name / skillDir / subsDir / tabs / note。',
            '步骤：1 问我要不要独立画像目录（要就复制 humanities-research）；2 写 <id>.json；',
            '3 用 data.json?config=<id> 校验规则 21、参考册 16；4 报告改动。不要动其它插件。',
          ].join('\n');
          const ui = ctx.get('uiWorkspace');
          if (auto !== false && ui && typeof ui.startSession === 'function') {
            ui.startSession(undefined, { prompt: text, whenDraftExists: 'replace' });
            return 'opened';
          }
          try { window.navigator.clipboard.writeText(text); return 'copied'; } catch (e) { return 'failed'; }
        };

        const exportMd = function (D, tab) {
          const out = [];
          const push = function (s) { out.push(s); };
          push('# ' + ((D.config && D.config.name) || 'humanities') + ' · ' + tab);
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
            (D.refs || []).forEach(function (r) { push('- **' + r[0] + '** ' + r[1] + ' — ' + (r[2] || '')); });
          } else {
            (D[tab] || []).forEach(function (r) { push('- ' + [].concat(r).filter(Boolean).join(' · ')); });
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

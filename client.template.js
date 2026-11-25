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

    const SNAPSHOT = __DATA__;

    const CSS = [
      '.hw{height:100%;overflow:auto;overflow-x:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.hw *{box-sizing:border-box}',
      '.hw-wrap{padding:26px 32px 72px}',
      '.hw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}',
      '.hw-title{margin:0;font:600 21px/1.3 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Songti SC","Noto Serif CJK SC",serif;letter-spacing:.01em}',
      '.hw-right{display:flex;align-items:center;gap:12px;row-gap:8px;flex-wrap:wrap;justify-content:flex-end;min-width:0;font-size:12px;color:var(--dim,var(--dsw-alias-label-secondary))}',
      '.hw-dot{width:6px;height:6px;border-radius:50%;display:inline-block;background:var(--dsw-alias-state-idle-primary);margin-right:6px;vertical-align:1px}',
      '.hw-dot.live{background:var(--dsw-alias-state-success-primary)}',
      '.hw-dot.bad{background:var(--dsw-alias-state-error-primary)}',
      '.hw-link{appearance:none;display:inline-flex;align-items:center;border:none;background:none;padding:4px 0;min-height:28px;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;border-bottom:1px dotted var(--dsw-alias-border-l1)}',
      '.hw-link:hover{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-link:disabled{opacity:.45;cursor:default}',
      '.hw-pickbtn{appearance:none;border:none;background:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:6px 4px;min-height:30px;max-width:100%;border-bottom:1px dotted var(--dsw-alias-border-l1)}',
      '.hw-pickname{display:inline-block;max-width:9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}',
      '.hw-caret{margin-left:5px;opacity:.55;font-size:9px}',
      '.hw-configlist{margin:10px 0 0;padding:5px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);display:grid;gap:2px;max-height:15rem;overflow-y:auto;overflow-x:hidden}',
      '.hw-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;appearance:none;border:none;background:none;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-secondary);padding:8px 10px;min-height:36px;border-radius:6px;cursor:pointer}',
      '.hw-opt:hover{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary)}',
      '.hw-opt.on{color:var(--dsw-alias-label-primary);font-weight:600}',
      '.hw-optname{min-width:0;overflow-wrap:anywhere}',
      '.hw-optmark{flex:none;font:400 10px/1 sans-serif;letter-spacing:.04em;padding:2px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);opacity:.7}',
      '.hw-upd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.hw-ver{font-variant-numeric:tabular-nums;letter-spacing:.02em}',
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
      '.hw-v{font-size:13px;line-height:1.75;min-width:0;overflow-wrap:anywhere}',
      '.hw-note{font-size:12px;line-height:1.8;color:var(--dsw-alias-label-secondary);margin-top:4px}',
      '.hw-ul{margin:6px 0 0;padding-left:1.1em;font-size:12.5px;line-height:1.9;color:var(--dsw-alias-label-secondary)}',
      '.hw-ul li{margin:3px 0}',
      '.hw-err{color:var(--dsw-alias-state-error-primary);font-size:11.5px;margin-top:4px;max-width:22rem}',
      '.hw-titlerow{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.hw-search{appearance:none;border:none;border-bottom:1px solid var(--dsw-alias-border-l1);background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:4px 2px;min-height:30px;width:8rem}',
      '.hw-search:focus{outline:none;border-bottom-color:var(--dsw-alias-brand-primary)}',
      '.hw-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}',
      '.hw-check{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none}',
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
      '.hw-panehead{display:flex;flex-wrap:wrap;align-items:baseline;gap:14px;margin:0 0 8px}',
      '.hw-paneaction{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin:14px 0 4px}',
      '.hw-bar{display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;margin-top:14px}',
      '.hw-lamp{appearance:none;display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:3px 10px;border-radius:15px;border:1px solid var(--dsw-alias-border-l1);background:none;font:inherit;font-size:11.5px;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.hw-lamp:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}',
      '.hw-lamp.on{color:var(--dsw-alias-label-primary)}',
      '.hw-btn{appearance:none;min-height:32px;padding:5px 12px;border-radius:7px;border:1px solid var(--dsw-alias-border-l1);background:none;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-primary);cursor:pointer}',
      '.hw-btn:hover{border-color:var(--dsw-alias-brand-primary)}',
      '.hw-btn:disabled{opacity:.45;cursor:default}',
      '.hw-btn.primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
      '.hw-morebtn{display:none}',
      '.hw-more{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
      '.hw-subhead{display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.hw-subhead h1{font:600 18px/1.3 "Iowan Old Style",Palatino,Georgia,"Songti SC",serif;margin:0}',
      '.hw-browserlede{font-size:13px;line-height:1.9;color:var(--dsw-alias-label-secondary);margin:14px 0 0;max-width:52rem}',
      '.hw-sitecard{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:11px 0;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.hw-sitecard b{font-size:13px;font-weight:600}',
      '.hw-sitecard .hw-grow{flex:1 1 8rem;min-width:0}',
      '@media (min-width:821px){.hw-more{display:flex}}',
      '@media (max-width:820px){.hw-morebtn{display:inline-flex}.hw-more{display:none}.hw-more.open{display:flex;width:100%}.hw-right{justify-content:flex-start}.hw-head{gap:10px}}',
      '@media (max-width:560px){.hw-wrap{padding:16px 12px 48px}.hw-title{font-size:18px}.hw-right,.hw-bar{gap:8px 10px;font-size:11.5px}.hw-tabs{gap:16px;margin-top:16px}.hw-tab{font-size:12.5px}.hw-body{margin-top:18px}.hw-lede{font-size:14.5px;line-height:1.9}.hw-h2{font-size:12px;margin:24px 0 8px}.hw-row{grid-template-columns:1fr;gap:2px;padding:10px 0}.hw-flow{grid-template-columns:1fr;gap:14px}.hw-cols{columns:1}.hw-tbl{display:block;overflow-x:auto}.hw-tbl thead{display:none}.hw-tbl tbody,.hw-tbl tr,.hw-tbl td{display:block;width:auto}.hw-tbl tr{border-top:1px solid var(--dsw-alias-border-l1);padding:10px 0}.hw-tbl td{border:none;padding:2px 0}.hw-tbl td:before{content:attr(data-label);display:block;font-size:10.5px;letter-spacing:.08em;color:var(--dsw-alias-label-secondary);opacity:.8}.hw-notice{left:12px;right:12px;transform:none;max-width:none}.hw-iframe{min-height:360px;height:70vh}.hw-search{width:100%}}',
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
      const [state, setState] = React.useState({ busy: true, live: false, message: '' });
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
        setState({ busy: true, live: false, message: '' });
        window.fetch(DATA + (id ? '?config=' + encodeURIComponent(id) : ''), { cache: 'no-store' })
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          })
          .then(function (json) {
            setData(json);
            if (json.switches) setSwitches(json.switches);
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

      const status = state.busy ? '' : state.live ? ' live' : ' bad';
      const statusText = state.busy ? '读取中' : state.live ? '实时' : '快照';
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
      const secondary = [
        h('button', { key: 'refresh', type: 'button', className: 'hw-link', disabled: state.busy, onClick: function () { load(configId); setMoreOpen(false); } }, '刷新'),
        h('button', { key: 'new', type: 'button', className: 'hw-link', title: '新建配置：先问一组问题，再按回答生成一套配置与配套前端', onClick: function () { setMoreOpen(false); askWizard('new', D.config); } }, '新建配置'),
        h('label', { key: 'import', className: 'hw-link' }, '导入',
          h('input', {
            type: 'file', accept: '.json,.md,.txt,.markdown', style: { display: 'none' },
            onChange: function (e) { doImport(e.target.files && e.target.files[0]); e.target.value = ''; },
          })
        ),
        h('button', { key: 'export', type: 'button', className: 'hw-link', onClick: function () { props.exportMd && props.exportMd(D, current); } }, '导出'),
        h('button', { key: 'refine', type: 'button', className: 'hw-link', title: '完善配置：读当前这套配置与最近的使用，提出增量改动，只改这一套', onClick: function () { setMoreOpen(false); askWizard('refine', D.config); } }, '完善配置'),
        fx ? h('button', {
          key: 'mode', type: 'button', className: 'hw-link',
          title: '在自定义前端与内置视图之间切换' + (fx.title ? '：' + fx.title : ''),
          onClick: toggleMode,
        }, showCustom ? '内置视图' : '自定义前端') : null,
      ];
      const version = (data && data.version) || (D && D.version) || '';
      const updateNote = !upd ? '' : (upd.error ? '上游查不到：' + upd.error : (upd.behind ? '上游已到 ' + upd.latest : (upd.latest ? '已是最新 ' + upd.latest : '')));
      const updateLink = upd && upd.behind ? (upd.url || '') : '';
      const header = subPage
        ? h('div', { className: 'hw-subhead' },
            h('button', { type: 'button', className: 'hw-btn', onClick: function () { setView(prevView); } }, '← 返回'),
            h('h1', null, '登录与抓取'),
            h('span', { className: 'hw-pill' + (D.browser && D.browser.running ? ' live' : '') }, D.browser && D.browser.running ? '浏览器运行中' : '未启动')
          )
        : h('div', null,
            h('div', { className: 'hw-head' },
              h('div', { className: 'hw-titlerow' },
                h('h1', { className: 'hw-title' }, t('title')),
                h('a', { className: 'hw-credit', href: 'https://b23.tv/mNKRdjZ', target: '_blank', rel: 'noopener noreferrer' }, '技术红茶@bilibili')
              ),
              h('span', { className: 'hw-note', title: state.message || '' }, h('span', { className: 'hw-dot' + status }), statusText + (readAt && state.live ? ' ' + readAt : ''))
            ),
            h('div', { className: 'hw-bar' },
              configs.length > 1 ? h(Picker, {
                options: configs, value: configId || (configs[0] && configs[0].id),
                open: configOpen,
                onToggle: function () { setConfigOpen(!configOpen); },
                onChange: function (id) { setConfigOpen(false); load(id); },
              }) : null,
              lamp('method', '方法论', '方法论与本地配置进不进模型上下文：绿灯进，红灯不进；点一下切换。'),
              lamp('corpus', '语料关键词', '问到本机字幕语料里出现过的词时，才提示去检索；点一下切换。'),
              h('button', { type: 'button', className: 'hw-btn', onClick: function () { setPrevView(current); setView('browser'); } }, '登录与抓取'),
              h('input', {
                className: 'hw-search', type: 'search', value: q, placeholder: '搜索',
                onChange: function (e) { setQ(e.target.value); },
              }),
              h('button', {
                type: 'button', className: 'hw-btn hw-morebtn', 'aria-expanded': moreOpen,
                onClick: function () { setMoreOpen(!moreOpen); },
              }, moreOpen ? '收起' : '更多'),
              h('div', { className: 'hw-more' + (moreOpen ? ' open' : '') }, secondary)
            ),
            configOpen && configs.length > 1 ? h('div', { className: 'hw-configlist', role: 'listbox', 'aria-label': '配置' },
              configs.map(function (o) {
                const on = o.id === (configId || (configs[0] && configs[0].id));
                return h('button', {
                  key: o.id, type: 'button', role: 'option', 'aria-selected': on ? 'true' : 'false',
                  className: on ? 'hw-opt on' : 'hw-opt',
                  onClick: function () { setConfigOpen(false); load(o.id); },
                }, h('span', { className: 'hw-optname' }, o.name), on ? h('span', { className: 'hw-optmark' }, '当前') : null);
              })
            ) : null,
            h('div', { className: 'hw-upd' },
              h('span', { className: 'hw-ver' }, 'v' + version),
              h('button', { type: 'button', className: 'hw-link', disabled: updateBusy, onClick: function () { loadUpdate(true); } }, updateBusy ? '检查中' : '检查更新'),
              updateNote ? h('span', { className: 'hw-note' }, updateNote) : null,
              updateLink ? h('a', { className: 'hw-link', href: updateLink, target: '_blank', rel: 'noopener noreferrer' }, '更新说明') : null
            )
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

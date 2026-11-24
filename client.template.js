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
    const CONFIGS = '/humanities-workbench/configs.json';

    const DICTS = {
      zh: { panel: '人文社科工作台', title: '人文社科工作台', overview: '概览', facts: '六事实', tensions: '张力', rules: '规则', redlines: '红线', refs: '材料' },
      en: { panel: 'Humanities desk', title: 'Humanities research desk', overview: 'Overview', facts: 'Six facts', tensions: 'Tensions', rules: 'Rules', redlines: 'Red lines', refs: 'Material' },
    };

    const SNAPSHOT = __DATA__;

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
      '.hw-corpusbar{display:flex;gap:10px;margin:18px 0 6px}',
      '.hw-corpusbar>.hw-search{flex:1}',
      '.hw-tbl{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}',
      '.hw-tbl th,.hw-tbl td{border-bottom:1px solid var(--dsw-alias-border-l1);padding:8px 10px;text-align:left;vertical-align:top}',
      '.hw-frame{margin-top:16px}',
      '.hw-iframe{width:100%;height:calc(100vh - 240px);min-height:520px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:#fff;display:block}',
      '.hw-framebar{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:2px}',
      '.hw-framebar code{font:inherit;font-size:11px;opacity:.85;word-break:break-all}',
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
          h('span', null, '自定义前端' + (props.title ? '：' + props.title : '') + '（沙箱隔离，数据经 postMessage 传入）'),
          h('code', null, props.dir || '')
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
      const [mode, setMode] = React.useState(function () { return read(MODE_KEY, 'custom'); });
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

      const body = showCustom
        ? h(CustomFrame, {
            url: fx.url, title: fx.title, dir: fx.dir, height: fx.height,
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

      const browserLine = function (b) {
        const sites = (b.sites || []).map(function (s) { return s.name; }).join('、');
        const where = b.running ? '后台运行中（' + (b.mode === 'headless' ? '无头' : '可见窗口') + '）' : '未启动，第一次抓取时自动打开';
        return '插件自带浏览器：' + where + '；' + (b.browser || '没找到浏览器') + (b.version ? ' ' + b.version : '') +
          '；配置目录 ' + ((b.profile && b.profile.dir) || '') + '；可登录 ' + sites;
      };

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
              D.browser ? h('button', {
                type: 'button', className: 'hw-link', title: browserLine(D.browser),
                onClick: function () { setNotice(browserLine(D.browser)); },
              }, '抓取' + (D.browser.running ? '在线' : '待启')) : null,
              h('input', {
                className: 'hw-search', type: 'search', value: q, placeholder: '搜索',
                onChange: function (e) { setQ(e.target.value); },
              }),
              fx ? h('button', {
                type: 'button', className: 'hw-link', title: '在「' + (fx.title || '自定义前端') + '」与内置视图之间切换：' + (fx.dir || ''),
                onClick: toggleMode,
              }, showCustom ? '内置视图' : '自定义前端') : null,
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
          (hasSections || showCustom) ? null : h('div', { className: 'hw-tabs', role: 'tablist' }, tabs.map(function (key) {
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

        const openWizard = function (name, auto) {
          const text = [
            '新建或修改一套「人文社科工作台」配置。',
            '配置目录：~/.dsh/humanities-workbench/configs/，当前：' + (name || '默认配置'),
            '字段：id、name、skillDir、subsDir、tabs、note。',
            '步骤：1 问我要不要独立画像目录（要就复制 humanities-research）；2 写 <id>.json；',
            '3 用 data.json 带 config 参数校验规则与参考册数量；4 报告改动。不要动其它插件。',
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

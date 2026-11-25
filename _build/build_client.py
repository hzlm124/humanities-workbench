# -*- coding: utf-8 -*-
"""Generate client.js from client.template.js plus a snapshot of one skill set.

    python _build/build_client.py            # neutral set (default)
    HW_SKILL_DIR=... python _build/build_client.py
"""
import datetime, json, os, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
BUNDLE = HERE.parent
SKILL = pathlib.Path(os.environ.get('HW_SKILL_DIR') or (pathlib.Path.home() / '.dsh' / 'skills' / 'humanities-research-neutral'))
_subs = os.environ.get('HW_SUBS_DIR', '')
SUBS = pathlib.Path(_subs) if _subs else None


def read(p):
    try:
        return p.read_text(encoding='utf-8')
    except Exception:
        return ''


def parse_rules(text):
    out = []
    for m in re.finditer(r'^## (R\d+)[·\s]*(.*?)\n+(.*?)(?=^## |\Z)', text, re.S | re.M):
        rid, title, body = m.group(1), m.group(2).strip(), m.group(3).strip()
        lines = [x.strip() for x in body.split('\n') if x.strip() and not x.strip().startswith('```')]
        detail = ' / '.join(lines[:3])
        out.append([rid, title, (detail[:228] + '…') if len(detail) > 230 else detail])
    return out


def parse_refs():
    d = SKILL / 'references'
    out = []
    if not d.exists():
        return out
    for p in sorted(d.glob('*.md')):
        t = read(p)
        if not t:
            continue
        title = t.split('\n')[0].lstrip('# ').strip()
        first = ''
        for line in t.split('\n')[1:]:
            s = line.strip()
            if s and not s.startswith('>') and not s.startswith('#'):
                first = s
                break
        out.append([p.name, title, first[:150]])
    return out


panel = {}
try:
    panel = json.loads(read(SKILL / 'profile' / 'panel.json') or '{}')
except Exception:
    panel = {}

rules = read(SKILL / 'profile' / 'rules.md')
profile = read(SKILL / 'profile' / 'profile.md')
parsed = parse_rules(rules)
refs = parse_refs()
subs = sorted(SUBS.glob('*.srt')) if SUBS and SUBS.exists() else []
now = datetime.datetime.now()

kind = project = 'neutral' if 'neutral' in SKILL.name else 'personal'
# A personal set carries the user's own framework: never ship it in the bundle
# unless a local preview explicitly asks for it.
if kind == 'personal' and os.environ.get('HW_ALLOW_PERSONAL') != '1':
    sys.exit('refusing to embed the personal set ' + str(SKILL) + '; set HW_ALLOW_PERSONAL=1 for a local preview')

data = {
    'meta': {
        'subtitle': ('快照 · 规则 %d 条 · 参考册 %d · %s' % (len(parsed), len(refs), now.strftime('%Y-%m-%d %H:%M'))),
        'foot': '',
        'headings': {
            'chain': '条件链（结构性必要条件，不是时间表）',
            'facts': '事实依赖结构',
            'inferences': '硬约束',
            'tensions': '未解张力',
            'rules': '执行规则 R1–R%d' % len(parsed),
            'redlines': '红线',
            'refs': '方法论参考册',
        },
    },
    'thesis': panel.get('thesis', ''),
    'kpi': [
        [str(len(panel.get('tensions', []))), '张力'],
        [str(len(panel.get('facts', []))), '事实'],
        [str(len(parsed)), '规则'],
        [str(len(panel.get('redlines', []))), '红线'],
    ],
    'chain': panel.get('chain', []),
    'boundary': panel.get('boundary', []),
    'overdetermination': '经济最终决定，但从不单独出场；「最后实例永不到来」。可能性是绝对的，必然性是相对的。不能写「必然走向」，只能写「在什么情势下、由谁抉择、有多大可能」。',
    'facts': panel.get('facts', []),
    'inferences': panel.get('inferences', []),
    'tensions': panel.get('tensions', []),
    'rules': parsed,
    'redlines': panel.get('redlines', []),
    'redlineNote': panel.get('redlineNote', ''),
    'materials': [[str(len(subs)), '字幕文件'], [str(len(refs)), '参考册']],
    'refs': refs,
    'profileBytes': len(profile),
}

tpl = read(BUNDLE / 'client.template.js')
if '__DATA__' not in tpl:
    sys.exit('client.template.js is missing the __DATA__ placeholder')
out = tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
(BUNDLE / 'client.js').write_text(out, encoding='utf-8')
print('WROTE', BUNDLE / 'client.js', len(out), 'chars; kind=' + kind + ' rules=' + str(len(parsed)) + ' refs=' + str(len(refs)) + ' subs=' + str(len(subs)))

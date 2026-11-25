/**
 * Unit checks for the bilibili layer: id parsing, WBI signing, and the
 * shape of every parser, with fixed payloads so no network is involved.
 */
import { createHash } from 'node:crypto'
const bili = await import('../bili.mjs')

let pass = 0
const fails = []
const check = (name, ok, detail) => {
  if (ok) { pass += 1; return }
  fails.push(name + (detail === undefined ? '' : ' [' + detail + ']'))
}

// ids
check('bvid from url', bili.parseId('https://www.bilibili.com/video/BV1xx411c7mD?spm=1').bvid === 'BV1xx411c7mD')
check('av id', bili.parseId('av170001').aid === 170001)
check('cv id', bili.parseId('https://www.bilibili.com/read/cv123456').cvid === 123456)
check('space uid', bili.parseId('https://space.bilibili.com/2267573/dynamic').uid === 2267573)
check('junk refused', bili.parseId('not an id') === null)

// wbi
const nav = { data: { wbi_img: { img_url: 'https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png', sub_url: 'https://i0.hdslb.com/bfs/wbi/4932caff0ff746eab6f01bf08b70ac45.png' } } }
const mixin = bili.wbiMixin(nav)
check('mixin length', mixin.length === 32, mixin)
check('mixin deterministic', mixin === bili.wbiMixin(nav))
const query = bili.signQuery({ foo: '114', bar: '514', zab: 1919810 }, mixin, 1700000000000)
const expectQuery = 'bar=514&foo=114&wts=1700000000&zab=1919810'
check('query sorted and stamped', query.indexOf(expectQuery) === 0, query)
const wrid = query.split('w_rid=')[1]
const expectWrid = createHash('md5').update(expectQuery + mixin).digest('hex')
check('w_rid matches md5', wrid === expectWrid, wrid)
check('no mixin means plain query', bili.signQuery({ a: 1 }, '', 1700000000000) === 'a=1&wts=1700000000')
check('illegal chars stripped', bili.signQuery({ q: "a!b'c(d)e*f" }, '', 1).indexOf('q=abcdef') === 0)
check('empty nav has no mixin', bili.wbiMixin({}) === '')

// json + errors
check('json parses plain', bili.parseJson('{"code":0}').code === 0)
check('json skips leading junk', bili.parseJson('\uFEFF  null {"code":0}').code === 0)
let threw = false
try { bili.parseJson('<html>404</html>') } catch { threw = true }
check('non-json throws', threw)
check('code 0 is fine', bili.apiError({ code: 0 }) === '')
check('login code explained', /扫码登录/.test(bili.apiError({ code: -101 })))
check('risk code explained', /风控/.test(bili.apiError({ code: -352 })))
check('unknown code falls back', bili.apiError({ code: -999, message: 'boom' }) === 'boom')

// subtitles
const player = { data: { subtitle: { subtitles: [
  { lan: 'ai-zh', lan_doc: '中文（自动生成）', subtitle_url: '//aisubtitle.hdslb.com/bfs/subtitle/a.json', ai_type: 1 },
  { lan: 'en-US', lan_doc: 'English', subtitle_url: 'https://aisubtitle.hdslb.com/bfs/subtitle/b.json' },
] } } }
const subs = bili.pickSubtitleList(player)
check('subtitle list sized', subs.length === 2, subs.length)
check('protocol-relative url fixed', subs[0].url.startsWith('https://'), subs[0].url)
check('subtitle label kept', subs[0].label === '中文（自动生成）')
check('ai flag', subs[0].ai === true && subs[1].ai === false)
const parsed = bili.parseSubtitle({ body: [{ from: 0.5, to: 1.5, content: ' 第一句 ' }, { from: 1.5, to: 2, content: '第二句' }, { from: 2, to: 3, content: '  ' }] })
check('caption lines kept', parsed.lines === 2, parsed.lines)
check('caption text joined', parsed.text === '第一句\n第二句', JSON.stringify(parsed.text))
check('blank caption dropped', parsed.captions.length === 2)

// comments
const reply = { data: { page: { count: 42 }, replies: [
  { member: { uname: '甲' }, like: 7, rcount: 2, ctime: 1700000000, content: { message: '第一层' } },
  { member: { uname: '乙' }, like: 0, rcount: 0, ctime: 1700000100, content: { message: '  ' } },
] } }
const comments = bili.pickComments(reply, 10)
check('comment total', comments.total === 42, comments.total)
check('empty comment dropped', comments.items.length === 1)
check('comment fields', comments.items[0].user === '甲' && comments.items[0].like === 7 && comments.items[0].replies === 2)
check('comment time iso', comments.items[0].at.startsWith('2023-11-14'))

// dynamics
const dyn = { data: { items: [
  { id_str: '9001', type: 'DYNAMIC_TYPE_WORD', modules: { module_author: { pub_ts: 1700000000 }, module_dynamic: { desc: { text: '一条动态' } } } },
  { id_str: '9002', type: 'DYNAMIC_TYPE_AV', modules: { module_author: { pub_ts: 1700000200 }, module_dynamic: { major: { archive: { title: '视频标题', desc: '视频简介' } } } } },
  { id_str: '9003', type: 'DYNAMIC_TYPE_FORWARD', modules: { module_author: { pub_ts: 1700000300 }, module_dynamic: {} } },
] } }
const rows = bili.pickDynamic(dyn, 10)
check('dynamic rows', rows.items.length === 2, rows.items.length)
check('dynamic text', rows.items[0].text === '一条动态')
check('dynamic archive text', /视频标题/.test(rows.items[1].text) && /视频简介/.test(rows.items[1].text))
check('dynamic link', rows.items[0].link === 'https://t.bilibili.com/9001')

// article metadata
const info = { data: { title: '专栏标题', words: 1200, publish_time: 1700000000, author: { name: '作者' }, stats: { view: 10, like: 2 } } }
const meta = bili.pickArticle(info)
check('article title', meta.title === '专栏标题')
check('article stats', meta.words === 1200 && meta.views === 10 && meta.likes === 2)
check('article author', meta.author === '作者')

console.log('bili: ' + pass + '/' + (pass + fails.length) + ' checks passed')
for (const line of fails) console.log('FAIL ' + line)
process.exit(fails.length ? 1 : 0)
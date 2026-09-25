// 渲染器自检：从 index.html 抽出 mdToHtml，渲染全部 plan 文档做校验。
// 修改 index.html 的渲染器或 plan/ 文档后，运行 `node test_renderer.mjs` 确认无误。
// 阶段列表（文件名 + 期望任务数）自动从 index.html 的 STAGES 数组解析，无需手改本文件。
import { readFileSync } from 'fs';
import { Script } from 'vm';

const html = readFileSync('index.html', 'utf8');
const trackerHtml = readFileSync('tracker/index.html', 'utf8');

// 1) 抽出渲染器函数
const start = html.indexOf('function esc(');
const end = html.indexOf('/* —— 视图 —— */');
if (start < 0 || end < 0) throw new Error('无法定位渲染器代码');
const mdToHtml = new Function(html.slice(start, end) + '\nreturn mdToHtml;')();

// 2) 从 STAGES 数组解析每个阶段的 id / count / file
const arrStart = html.indexOf('const STAGES = [');
const arrEnd = html.indexOf('];', arrStart);
const arrSrc = html.slice(arrStart, arrEnd);
const files = [];
for (const m of arrSrc.matchAll(/id:\s*'([^']+)'[\s\S]*?count:\s*(\d+)[\s\S]*?file:\s*'([^']+)'/g)) {
  files.push([m[1], +m[2], m[3]]);
}
if (!files.length) throw new Error('未能从 index.html 解析出 STAGES');

let fail = 0;
const expected = [];
for (const [id, expect, file] of files) {
  const md = readFileSync(file, 'utf8');
  const out = mdToHtml(md);
  const issues = [];
  const cbs = (out.match(/class="task-cb"/g) || []).length;
  const headings = [...md.matchAll(/^### ☐ (.+)$/gm)].map(m => m[1]);
  expected.push([id, headings]);
  if (headings.length !== expect) issues.push(`Markdown 标题数 ${headings.length} != ${expect}`);
  if (cbs !== expect) issues.push(`任务数 ${cbs} != 预期 ${expect}（检查 plan 文档 ### ☐ 数量与 index.html count）`);
  if (out.includes('\x00')) issues.push('残留代码占位符');
  if (out.includes('```')) issues.push('残留代码围栏');
  const textOnly = out.replace(/<pre>[\s\S]*?<\/pre>/g, '').replace(/<code>[\s\S]*?<\/code>/g, '').replace(/<[^>]*>/g, '');
  if (/\*\*/.test(textOnly)) issues.push('残留 ** 加粗标记');
  for (const tag of ['pre', 'table', 'ul', 'ol', 'blockquote', 'li', 'p', 'h2', 'h3']) {
    const o = (out.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
    const c = (out.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (o !== c) issues.push(`<${tag}> 不配对: 开${o}/闭${c}`);
  }
  if (issues.length) { fail++; console.log(`FAIL ${id} ${file}\n  - ` + issues.join('\n  - ')); }
  else console.log(`PASS ${id} 任务${cbs} 代码块${(out.match(/<pre>/g)||[]).length} 表格${(out.match(/<table>/g)||[]).length}`);
}

// 学习页和面板必须有相同的任务与存储键。
const trackerStart = trackerHtml.indexOf('const STAGES = [');
const trackerEnd = trackerHtml.indexOf('];', trackerStart);
if (trackerStart < 0 || trackerEnd < 0) throw new Error('面板阶段列表缺失');
const trackerStages = new Function(trackerHtml.slice(trackerStart, trackerEnd + 2) + '\nreturn STAGES;')();
for (const [id, headings] of expected) {
  const s = trackerStages.find(s => s.id === id);
  if (!s || JSON.stringify(s.tasks) !== JSON.stringify(headings)) {
    fail++;
    console.log(`FAIL ${id} 面板任务与 Markdown 标题不一致`);
  }
}
const key = page => page.match(/const KEY = '([^']+)'/)?.[1];
if (!key(html) || key(html) !== key(trackerHtml)) {
  fail++;
  console.log('FAIL 学习页与面板的 localStorage 键不一致');
}
for (const [name, page] of [['学习页', html], ['面板', trackerHtml]]) {
  if (/\{\{[^}]+\}\}/.test(page)) {
    fail++;
    console.log(`FAIL ${name} 存在未替换占位符`);
  }
  for (const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    try { new Script(script[1]); }
    catch (err) { fail++; console.log(`FAIL ${name} 脚本语法: ${err.message}`); }
  }
}
console.log(fail ? `\n✗ ${fail} 个阶段未通过` : `\n✓ 全部 ${files.length} 个阶段通过`);
process.exit(fail ? 1 : 0);

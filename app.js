import { dimensions, questions, levels, industries, sizes, scenarios, freqOptions, durationOptions, riskOptions, toolOptions, metricOptions, cases, calculate, findings, opportunity, matchCases, sample } from './model.mjs';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const STORE = 'kunjie-diagnosis-v4';
const fresh = () => ({ screen: 'home', company: '', website: '', scan: null, steps: {}, industry: '', size: '', answers: {}, idx: 0, deep: { picked: [], inputs: {}, tools: [], metric: '', owner: '', consent: true, done2: false, done3: false }, plan: null, isSample: false, lead: null });
let state = load();
let advanceTimer, typeTimer, scanSource;

function load() { try { return { ...fresh(), ...JSON.parse(localStorage.getItem(STORE) || '{}') }; } catch { return fresh(); } }
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* storage unavailable: continue in memory */ } }
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const buzz = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { /* unsupported */ } };
const wait = ms => new Promise(r => setTimeout(r, ms));
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('show'), 2200); }
function go(screen, patch = {}) { clearTimeout(advanceTimer); clearTimeout(typeTimer); state = { ...state, ...patch, screen }; save(); render(); window.scrollTo(0, 0); }

/* ================= ICONS (24px line set) ================= */
const svg = (d, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const P = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M15 5l-7 7 7 7"/>', share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>', ext: '<path d="M9 5h10v10M19 5L7 17"/>',
  direction: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/>',
  workflow: '<rect x="3" y="4" width="6" height="5" rx="1.5"/><rect x="15" y="4" width="6" height="5" rx="1.5"/><rect x="9" y="15" width="6" height="5" rx="1.5"/><path d="M6 9v2.5h12V9M12 11.5V15"/>',
  knowledge: '<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/>',
  application: '<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.4-.3 4.5 1.2 5 4.3"/>',
  value: '<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>',
  service: '<path d="M4 13v-1a8 8 0 0116 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.5-2 2.5-5 2.5"/>',
  sales: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  content: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  knowledgeS: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5M8 7h7M8 11h5"/>',
  ops: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  supply: '<path d="M3 10l9-6 9 6v10H3z"/><path d="M8 20v-6h8v6"/>',
  quality: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5M8.5 11l2 2 3.5-3.5"/>',
  analytics: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17v.5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.5L16 9.5"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16 16l4.5 4.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
const I = name => svg(P[name] || '');
const scenarioIcon = { service: 'service', sales: 'sales', content: 'content', knowledge: 'knowledgeS', ops: 'ops', supply: 'supply', quality: 'quality', analytics: 'analytics' };

/* ================= HOME ================= */
function home() {
  return `<main class="screen">
    <div class="bar"><div class="brand"><img src="/assets/kunjie-logo.png" alt="鲲界科技"></div><span class="mono">企业 AI 化诊断</span></div>
    <section class="hero">
      <div class="orb-wrap" aria-hidden="true">${orbit(['官网', '全网', '画像', 'AI 可见度'], -1)}</div>
      <h1>你的公司，<br>离 AI 原生还有多远<span>？</span></h1>
      <p>输入公司名，我们会联网读取公开信息，模拟潜在客户向 AI 提问，看你的品牌会不会被推荐；再用 18 个问题定位成熟度，给出可以直接执行的 90 天方案。</p>
      <form class="field" id="start-form" autocomplete="off">
        <label for="company">公司名称</label>
        <input id="company" name="company" maxlength="60" placeholder="例如：深圳鲲界科技" value="${esc(state.isSample ? '' : state.company)}" required>
        <div class="sub"><label for="website">官网（选填，识别更准确）</label><input id="website" name="website" inputmode="url" placeholder="https://" value="${esc(state.isSample ? '' : state.website)}"></div>
      </form>
      <div class="pillars">
        <div>${I('globe')}<b>联网画像</b><span>官网与公开报道</span></div>
        <div>${I('search')}<b>AI 可见度</b><span>客户问 AI 时你在不在</span></div>
        <div>${I('flag')}<b>90 天方案</b><span>第一个试点怎么做</span></div>
      </div>
      <button class="link" data-act="sample">看一份报告示例 ${svg(P.arrow, 14)}</button>
    </section>
    <p class="home-foot">评估方法参考 OECD 中小企业 AI 准备度、NIST AI 风险管理框架等国际标准<br>你的回答仅用于生成本报告</p>
    <div class="dock"><div class="dock-inner"><button class="btn btn-primary" data-act="start">开始诊断 ${I('arrow')}</button></div></div>
  </main>`;
}

/* Orbit visual: company core + four satellites that light up as each scan stage completes. */
function orbit(labels, litCount, core = '') {
  const pos = [[50, 9], [91, 50], [50, 91], [9, 50]];
  return `<div class="orbit ${litCount >= 0 ? 'live' : ''}">
    <svg viewBox="0 0 100 100" class="orbit-lines" aria-hidden="true">
      <circle cx="50" cy="50" r="41" /><circle cx="50" cy="50" r="27" /><circle cx="50" cy="50" r="13" />
      ${pos.map(([x, y], i) => `<line x1="50" y1="50" x2="${x}" y2="${y}" class="${i < litCount ? 'on' : ''}"/>`).join('')}
    </svg>
    <div class="sweep"></div>
    <div class="core">${esc(core || '鲲')}</div>
    ${labels.map((l, i) => `<span class="sat s${i} ${i < litCount ? 'on' : ''}"><i></i>${l}</span>`).join('')}
  </div>`;
}

/* ================= SCAN ================= */
const STEP_DEFS = [
  ['entity', '识别企业主体'], ['site', '读取官网'],
  ['brand:bocha', '全网检索'], ['brand:deepseek', '全网检索 · DeepSeek'], ['brand:doubao', '全网检索 · 豆包'], ['brand:yuanbao', '全网检索 · 元宝'],
  ['profile', '交叉比对，归纳业务画像'],
  ['geo:bocha', '客户提问模拟'], ['geo:deepseek', '客户提问模拟 · DeepSeek'], ['geo:doubao', '客户提问模拟 · 豆包'], ['geo:yuanbao', '客户提问模拟 · 元宝'],
];
const hiddenStep = (id, x) => (x && ['未接入', '未运行'].includes(x.detail)) || (x?.status === 'error' && id !== 'site') || (id === 'site' && !state.website);
function scanStage(s) {
  const done = id => s[id] && s[id].status !== 'running';
  const any = prefix => Object.keys(s).some(k => k.startsWith(prefix) && done(k));
  return [state.website ? done('site') : done('entity'), any('brand:'), done('profile'), any('geo:')].filter(Boolean).length;
}
function scan() {
  const s = state.steps, visible = STEP_DEFS.filter(([id]) => !hiddenStep(id, s[id]));
  const lit = state.scan ? 4 : scanStage(s);
  return `<main class="screen">
    <div class="bar"><button class="icon-btn" data-act="home" aria-label="返回">${I('back')}</button><span class="mono">${state.scan ? '画像已生成' : '正在建立企业画像'}</span></div>
    <div class="scan-visual">${orbit(['官网', '全网', '画像', 'AI 可见度'], lit, [...state.company][0])}</div>
    <div class="scan-head"><h2>${esc(state.company)}</h2></div>
    <ul class="trace">${visible.map(([id, label]) => { const x = s[id]; return `<li class="${x ? `on ${x.status}` : ''}"><span class="st"></span><div><b>${label}</b><div class="d">${esc(x?.status === 'error' ? '暂时无法读取' : x?.detail || '排队中')}</div></div></li>`; }).join('')}</ul>
    ${state.scan ? profileCard() : ''}
    <div class="dock"><div class="dock-inner"><button class="btn btn-primary" data-act="to-questions" ${state.scan ? '' : 'disabled'}>${state.scan ? `确认画像，开始 18 问 ${I('arrow')}` : '<span class="dots"><i></i><i></i><i></i></span>正在扫描'}</button></div></div>
  </main>`;
}
function geoAsks(scan) {
  const g = Object.values(scan?.evidence || {}).find(x => x.discovery?.asks?.length);
  return g ? g.discovery : null;
}
function geoSummary(scan) {
  const d = geoAsks(scan);
  if (!d) return '暂未完成客户提问模拟';
  const mine = d.asks.reduce((n, a) => n + a.top.filter(t => t.mine).length, 0);
  return mine ? `${d.asks.length} 个客户问题中，品牌被检索到 ${mine} 次` : `${d.asks.length} 个客户问题中，品牌暂未被检索到`;
}
function profileCard() {
  const sc = state.scan, found = sc.sources?.length || sc.business;
  return `<section class="card profile">
    <div class="profile-top"><div class="mono-tile">${esc([...sc.company][0])}</div><div><h3>${esc(sc.company)}</h3><span class="mono">${found ? `${sc.sources?.length || 0} 条公开来源` : '公开信息较少'}</span></div></div>
    <dl>
      <div class="kv"><dt>业务</dt><dd>${sc.business ? esc(sc.business) : '<input id="biz" placeholder="一句话说明你们做什么，报告会更准确">'}</dd></div>
      <div class="kv"><dt>官网</dt><dd>${sc.website ? esc(sc.website.replace(/^https?:\/\//, '').replace(/\/$/, '')) : '未找到'}</dd></div>
      <div class="kv"><dt>AI 可见度</dt><dd>${esc(geoSummary(sc))}</dd></div>
      ${sc.reputation && !/证据不足/.test(sc.reputation) ? `<div class="kv"><dt>公开报道</dt><dd>${esc(sc.reputation)}</dd></div>` : ''}
    </dl>
    ${sc.ambiguous ? `<div class="hint">${I('alert')}<div>找到多家名称相近的企业${sc.candidates?.length ? `：${sc.candidates.map(c => esc(c.name + (c.location ? `（${c.location}）` : ''))).join('、')}` : ''}。补充官网后，画像会更准确。<button class="link" data-act="home">补充官网 →</button></div></div>` : ''}
  </section>`;
}
function startScan() {
  state.steps = {}; state.scan = null; render();
  const q = new URLSearchParams({ company: state.company, ...(state.website ? { website: state.website } : {}) });
  const queue = []; let pumping = false, result = null;
  const pump = () => {
    if (pumping) return; pumping = true;
    const tick = () => {
      const ev = queue.shift();
      if (!ev) { pumping = false; if (result) finish(); return; }
      state.steps = { ...state.steps, [ev.step]: ev }; patchScan(); setTimeout(tick, ev.status === 'running' ? 140 : 300);
    };
    tick();
  };
  const finish = () => {
    for (const [id] of STEP_DEFS) if (!state.steps[id] || state.steps[id].status === 'running') state.steps[id] = { step: id, status: 'skipped', detail: '未运行' };
    state.scan = result; save(); render(); buzz(14);
  };
  scanSource?.close();
  try {
    scanSource = new EventSource(`/api/scan-stream?${q}`);
    scanSource.addEventListener('step', e => { queue.push(JSON.parse(e.data)); pump(); });
    scanSource.addEventListener('result', e => { result = JSON.parse(e.data); scanSource.close(); if (!pumping) finish(); });
    scanSource.addEventListener('failure', () => { scanSource.close(); fallbackScan(); });
    scanSource.onerror = () => { if (!result) { scanSource.close(); fallbackScan(); } };
  } catch { fallbackScan(); }
  function fallbackScan() {
    fetch('/api/company-scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ company: state.company, website: state.website }) })
      .then(r => r.json()).then(r => { result = r.error ? null : r; })
      .catch(() => {})
      .finally(() => { result ||= { company: state.company, mode: 'manual', business: '', website: state.website, reputation: '', sources: [], evidence: {} }; queue.push({ step: 'entity', status: 'done', detail: `识别主体「${state.company}」` }); pump(); });
  }
}
function patchScan() { if (state.screen !== 'scan') return; const y = window.scrollY; app.innerHTML = scan(); window.scrollTo(0, y); }

/* ================= QUESTIONS ================= */
function questionScreen(dir = 'r') {
  const q = questions[state.idx], dimIdx = dimensions.findIndex(d => d.id === q.dim), picked = state.answers[q.id];
  const segs = dimensions.map(d => `<div class="seg">${questions.filter(x => x.dim === d.id).map(x => { const i = questions.indexOf(x); return `<i class="${i === state.idx ? 'cur' : state.answers[x.id] !== undefined ? 'done' : ''}"></i>`; }).join('')}</div>`).join('');
  const ctx = state.idx === 0 ? `<div class="card ctx">
      <div class="ctx-row"><span>先确认背景：行业</span><div class="chips">${industries.map(x => `<button class="chip ${state.industry === x ? 'on' : ''}" data-act="industry" data-v="${x}">${x}</button>`).join('')}</div></div>
      <div class="ctx-row"><span>团队规模</span><div class="chips">${sizes.map(x => `<button class="chip ${state.size === x ? 'on' : ''}" data-act="size" data-v="${x}">${x}</button>`).join('')}</div></div>
    </div>` : '';
  return `<main class="screen">
    <div class="qtop">
      <div class="bar"><button class="icon-btn" data-act="prev" aria-label="上一题">${I('back')}</button><span class="mono">${String(state.idx + 1).padStart(2, '0')} / ${questions.length}</span></div>
      <div class="segs">${segs}</div>
    </div>
    <div class="qstage" id="qstage"><div class="qcard in-${dir}" id="qcard">
      ${ctx}
      <div class="dim-chip">${I(q.dim)}<span>${dimensions[dimIdx].name}</span></div>
      <h2>${esc(q.title)}</h2><p class="helper">${esc(q.helper)}</p>
      <div class="opts ${picked >= 0 ? 'answered' : ''}">${q.options.map((o, i) => `<button class="opt ${picked === i ? 'sel' : ''}" data-act="answer" data-v="${i}"><span class="lvl">${[0, 1, 2, 3].map(k => `<i class="${k <= i ? 'f' : ''}"></i>`).join('')}</span><span>${esc(o)}</span><span class="ck"></span></button>`).join('')}</div>
      <div id="aside">${picked >= 0 ? `<div class="aside"><span class="mono">顾问点评</span><p>${esc(q.notes[picked])}</p></div>` : ''}</div>
      <button class="skip" data-act="answer" data-v="-1">不确定，先跳过 →</button>
    </div></div>
    <div class="dock"><div class="dock-inner"><button class="btn ${picked !== undefined ? 'btn-primary' : 'btn-ghost'}" data-act="next">${state.idx === questions.length - 1 ? '生成报告' : '下一题'} ${I('arrow')}</button></div></div>
  </main>`;
}
function answer(v, btn) {
  const q = questions[state.idx];
  state.answers = { ...state.answers, [q.id]: v }; save(); buzz(10);
  clearTimeout(advanceTimer); clearTimeout(typeTimer);
  if (v < 0) { toast('已跳过，这题不计分'); advanceTimer = setTimeout(next, 350); return; }
  const opts = app.querySelector('.opts');
  opts.classList.add('answered');
  opts.querySelectorAll('.opt').forEach(o => o.classList.toggle('sel', o === btn));
  burst(btn);
  app.querySelector('[data-act="next"]').classList.replace('btn-ghost', 'btn-primary');
  const aside = app.querySelector('#aside');
  aside.innerHTML = '<div class="aside"><span class="mono">顾问点评</span><p class="caret"></p></div>';
  const p = aside.querySelector('p'), text = q.notes[v]; let i = 0;
  const type = () => { p.textContent = text.slice(0, ++i); if (i < text.length) typeTimer = setTimeout(type, 22); else { p.classList.remove('caret'); advanceTimer = setTimeout(next, 1300); } };
  type();
}
// Small particle burst from the tapped option: visible confirmation that the answer registered.
function burst(el) {
  const r = el.getBoundingClientRect(), host = document.createElement('div');
  host.className = 'burst'; host.style.left = r.right - 30 + 'px'; host.style.top = r.top + r.height / 2 + 'px';
  for (let i = 0; i < 10; i++) { const s = document.createElement('i'); const a = (i / 10) * Math.PI * 2; s.style.setProperty('--dx', Math.cos(a) * 34 + 'px'); s.style.setProperty('--dy', Math.sin(a) * 34 + 'px'); host.appendChild(s); }
  document.body.appendChild(host); setTimeout(() => host.remove(), 700);
}
function next() {
  clearTimeout(advanceTimer); clearTimeout(typeTimer);
  if (state.idx < questions.length - 1) { state.idx++; save(); render('r'); window.scrollTo(0, 0); }
  else go('compute');
}
function prev() {
  clearTimeout(advanceTimer); clearTimeout(typeTimer);
  if (state.idx > 0) { state.idx--; save(); render('l'); window.scrollTo(0, 0); } else go('scan');
}
function bindSwipe() {
  const stage = app.querySelector('#qstage'), card = app.querySelector('#qcard'); if (!stage) return;
  let x0 = null, y0 = 0, dx = 0, locked = null;
  stage.addEventListener('touchstart', e => { if (e.target.closest('.chips')) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; locked = null; card.style.transition = 'none'; }, { passive: true });
  stage.addEventListener('touchmove', e => {
    if (x0 === null) return;
    const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
    if (locked === null && Math.abs(mx) + Math.abs(my) > 8) locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (locked !== 'x') return;
    dx = mx; const canNext = state.answers[questions[state.idx].id] !== undefined;
    const damp = (dx < 0 && !canNext) ? dx * 0.2 : dx * 0.6;
    card.style.transform = `translateX(${damp}px) rotate(${damp / 60}deg)`; card.style.opacity = String(1 - Math.min(Math.abs(damp) / 400, 0.4));
  }, { passive: true });
  stage.addEventListener('touchend', () => {
    if (x0 === null) return; x0 = null; card.style.transition = 'transform .3s var(--ease), opacity .3s';
    const canNext = state.answers[questions[state.idx].id] !== undefined;
    if (locked === 'x' && dx > 80) { buzz(); prev(); return; }
    if (locked === 'x' && dx < -80 && canNext) { buzz(); next(); return; }
    card.style.transform = ''; card.style.opacity = '';
  });
}

/* ================= COMPUTE ================= */
function compute() {
  const lines = ['汇总 18 项回答', '计算六维能力得分', '比对公开信息与 AI 可见度', `从 ${cases.length} 个落地案例中匹配同类做法`, '生成 90 天试点路线'];
  setTimeout(() => {
    const ul = app.querySelector('.trace'); if (!ul) return;
    [...ul.children].forEach((li, i) => setTimeout(() => { li.className = 'on running'; setTimeout(() => { li.className = 'on done'; buzz(4); }, 260); }, i * 320));
    setTimeout(() => go('report'), lines.length * 320 + 500);
  }, 50);
  return `<main class="screen"><div class="bar"><span class="mono">正在生成报告</span></div>
    <div class="scan-visual">${orbit(['方向', '流程', '数据', '应用'], 4, [...state.company][0])}</div>
    <ul class="trace">${lines.map(l => `<li><span class="st"></span><div><b>${l}</b></div></li>`).join('')}</ul></main>`;
}

/* ================= REPORT ================= */
const reportId = () => 'KJ-' + [...(state.company + Object.values(state.answers).join(''))].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).toUpperCase().slice(0, 6);
const today = () => new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '.');
function deepResults(r) {
  const byId = Object.fromEntries(r.dims.map(d => [d.id, d.score]));
  return state.deep.picked.map(id => { const sc = scenarios.find(s => s.id === id), input = state.deep.inputs[id] || { freq: 6, minutes: 15, risk: 1 }; return { ...sc, ...opportunity(sc, input, byId) }; })
    .sort((a, b) => (b.value + b.ready) - (a.value + a.ready));
}
function verdict(r, f, top) {
  const w = r.weakest[0], s = r.strongest;
  const wq = questions.filter(q => q.dim === w?.id && state.answers[q.id] >= 0).sort((a, b) => state.answers[a.id] - state.answers[b.id])[0];
  const b = wq ? { gap: wq.gap } : f.bottlenecks[0];
  let t = `<b>${esc(state.company)}</b>目前处于 <b>${r.level.id}「${r.level.name}」</b>阶段。`;
  if (s && w && s.id !== w.id) t += `${s.name}是现有基础，<b>${w.name}</b>是主要短板`;
  t += b ? `——${esc(b.gap)}。` : '。';
  t += top ? `建议以<b>「${top.name}」</b>作为第一个试点，每月可释放约 ${Math.round(top.savedLow)}–${Math.round(top.savedHigh)} 小时。` : '在下方选出最耗时的业务场景，即可得到第一个试点建议。';
  return t;
}
function ring(score) {
  const C = 2 * Math.PI * 64;
  return `<div class="ring"><svg viewBox="0 0 160 160" aria-hidden="true">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa6ff"/><stop offset="1" stop-color="#3f6fe6"/></linearGradient></defs>
      <circle cx="80" cy="80" r="64" class="ring-bg"/>
      ${levels.slice(1).map(l => { const a = (l.min / 100) * 2 * Math.PI - Math.PI / 2; return `<line x1="${80 + 58 * Math.cos(a)}" y1="${80 + 58 * Math.sin(a)}" x2="${80 + 70 * Math.cos(a)}" y2="${80 + 70 * Math.sin(a)}" class="ring-tick"/>`; }).join('')}
      <circle cx="80" cy="80" r="64" class="ring-fg" stroke="url(#rg)" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${C * (1 - score / 100)}"/>
    </svg><div class="ring-num"><b data-count="${score}">0</b><span>/ 100</span></div></div>`;
}
function radar(dims) {
  const cx = 150, cy = 140, R = 96, n = dims.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i / n) * 2 * Math.PI; return [cx + R * (v / 100) * Math.cos(a), cy + R * (v / 100) * Math.sin(a)]; };
  const poly = vals => vals.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
  return `<svg viewBox="0 0 300 290" class="radar" role="img" aria-label="六维能力雷达图">
    ${[25, 50, 75, 100].map(v => `<polygon points="${poly(dims.map(() => v))}" class="grid"/>`).join('')}
    ${dims.map((d, i) => { const [x, y] = pt(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="axis"/>`; }).join('')}
    <polygon points="${poly(dims.map(() => 60))}" class="bench"/>
    <g class="shape"><polygon points="${poly(dims.map(d => d.score ?? 0))}" class="area"/>
    ${dims.map((d, i) => { const [x, y] = pt(i, d.score ?? 0); return `<circle cx="${x}" cy="${y}" r="3.5" class="dot"/>`; }).join('')}</g>
    ${dims.map((d, i) => { const [x, y] = pt(i, 128); return `<text x="${x}" y="${y - 4}" text-anchor="middle" class="lbl">${d.name}</text><text x="${x}" y="${y + 12}" text-anchor="middle" class="val">${d.score ?? '—'}</text>`; }).join('')}
  </svg>`;
}
function report() {
  const r = calculate(state.answers);
  if (r.score === null) return `<main class="screen"><div class="bar"><button class="icon-btn" data-act="resume">${I('back')}</button></div><div class="compute"><h2>还差几题</h2><p class="sub-lead">至少回答 12 题，报告才足够准确（当前 ${r.answered} 题）。</p></div><div class="dock"><div class="dock-inner"><button class="btn btn-primary" data-act="resume">继续答题 ${I('arrow')}</button></div></div></main>`;
  const f = findings(state.answers), deep = state.deep.done2 ? deepResults(r) : [], top = deep[0];
  const lvIdx = levels.indexOf(r.level);
  const toc = [['s1', '结论'], ['s2', '六维'], ['s3', '发现'], ['s4', 'AI 可见度'], ['s5', '场景机会'], ['s6', '试点方案'], ['s7', '案例'], ['s8', '下一步']];
  return `<main class="screen" id="report">
    <div class="rep-bar"><button class="icon-btn" data-act="home" aria-label="首页">${I('back')}</button><span class="mono">${reportId()} · ${today()}</span><button class="icon-btn" data-act="share" aria-label="分享">${I('share')}</button></div>
    <nav class="toc">${toc.map(([id, n], i) => `<a href="#${id}" class="${i ? '' : 'on'}" data-toc="${id}">${n}</a>`).join('')}</nav>
    <header class="cover">
      <span class="mono">企业 AI 化诊断报告${state.isSample ? ' · 报告示例' : ''}</span>
      <h1>${esc(state.company)}</h1>
      <div class="meta">${state.industry ? `<span class="tag">${esc(state.industry)}</span>` : ''}${state.size ? `<span class="tag">${esc(state.size)}</span>` : ''}${state.deep.done2 ? '<span class="tag accent">含深度评估</span>' : ''}</div>
    </header>

    <section class="sec" id="s1"><div class="sec-h"><span class="n">01</span><h2>结论</h2></div>
      <div class="card hero-card">
        <div class="hero-top">${ring(r.score)}<div class="lv"><span class="mono">成熟度等级</span><b>${r.level.id}</b><em>${r.level.name}</em><p>${r.level.desc}</p></div></div>
        <div class="ladder"><div class="rungs">${levels.map((l, i) => `<i class="${i < lvIdx ? 'past' : i === lvIdx ? 'cur' : ''}"><span></span></i>`).join('')}</div>
          <div class="rung-labels">${levels.map((l, i) => `<span class="${i === lvIdx ? 'cur' : ''}">${l.name}</span>`).join('')}</div></div>
        <div class="next"><span class="mono">${lvIdx < 4 ? `迈向「${levels[lvIdx + 1].name}」的三件事` : '保持领先的三件事'}</span><ol>${r.level.next.map(x => `<li>${x}</li>`).join('')}</ol></div>
      </div>
      <p class="lead">${verdict(r, f, top)}</p>
    </section>

    <section class="sec" id="s2"><div class="sec-h"><span class="n">02</span><h2>六维能力画像</h2></div>
      <div class="card radar-card">${radar(r.dims)}<div class="legend"><span><i class="lg-area"></i>你的企业</span><span><i class="lg-bench"></i>体系化水平线</span></div></div>
      ${r.dims.map(d => { const qs = questions.filter(q => q.dim === d.id); const low = qs.filter(q => state.answers[q.id] >= 0).sort((a, b) => state.answers[a.id] - state.answers[b.id])[0];
        return `<button class="dim-row" data-act="dim"><div class="dim-top"><span class="dim-ic ${d.score < 40 ? 'low' : d.score >= 70 ? 'high' : ''}">${I(d.id)}</span><b>${d.name}</b><div class="track"><i class="${d.score < 40 ? 'low' : d.score >= 70 ? 'high' : ''}" data-w="${d.score ?? 0}"></i></div><span class="v">${d.score ?? '—'}</span></div>
        <p class="dim-note">${d.score === null ? '未作答' : d.score < 60 && low ? esc(low.gap) : '基础较好，可以支撑场景试点'}</p>
        <div class="dim-ev">${qs.map(q => `<div class="ev"><span>${esc(q.title)}</span>${state.answers[q.id] >= 0 ? esc(q.options[state.answers[q.id]]) : '跳过'}</div>`).join('')}</div></button>`; }).join('')}
      <p class="formula">点击任一维度，查看对应的回答依据</p>
    </section>

    <section class="sec" id="s3"><div class="sec-h"><span class="n">03</span><h2>关键发现</h2></div>
      ${f.bottlenecks.map((b, i) => `<div class="card find"><div class="find-h"><span class="badge warn">${I('alert')}</span><div><span class="mono">瓶颈 ${i + 1} · ${b.dim}</span><q>${esc(b.quote)}</q></div></div><p>${esc(b.gap)}。</p><div class="fix">${I('bolt')}<div><span>本周就能做</span>${esc(b.fix)}</div></div></div>`).join('')}
      ${f.risk ? `<div class="card find risk"><div class="find-h"><span class="badge bad">${I('shield')}</span><div><span class="mono">风险 · 数据与合规</span><q>${esc(f.risk.options[state.answers[f.risk.id]])}</q></div></div><p>${esc(f.risk.gap)}。建议在扩大 AI 使用前优先处理。</p><div class="fix">${I('bolt')}<div><span>本周就能做</span>${esc(f.risk.fix)}</div></div></div>` : ''}
      ${f.strengths.map(s => `<div class="card find good"><div class="find-h"><span class="badge ok">${I('check')}</span><div><span class="mono">优势 · ${s.dim}</span><q>${esc(s.quote)}</q></div></div><p>可以作为试点的支点，优先从这一侧启动。</p></div>`).join('')}
    </section>

    ${externalSection()}
    ${scenarioSection(r, deep)}
    ${pilotSection(r, f, deep)}
    ${casesSection(r)}

    <section class="sec" id="s8"><div class="sec-h"><span class="n">08</span><h2>下一步</h2></div>
      <div class="card cta">
        <div class="cta-ic">${I('calendar')}</div>
        <h3>预约 30 分钟报告解读</h3>
        <p>鲲界前线部署工程师（FDE）会结合你的真实业务流程，逐条解读这份报告，并给出第一个数字员工的落地清单。</p>
        ${state.lead ? `<div class="lead-ok">${I('check')}<span>已收到，${esc(state.lead.name)}。顾问会在 1 个工作日内与你联系。</span></div>` : `<input class="text-in" id="lead-name" placeholder="怎么称呼你" maxlength="20" autocomplete="name"><input class="text-in" id="lead-phone" placeholder="手机号" inputmode="tel" maxlength="20" autocomplete="tel"><button class="btn btn-primary" data-act="lead">预约解读 ${I('arrow')}</button>`}
      </div>
      <div class="row-btns"><button class="btn btn-ghost" data-act="copy">复制摘要</button><button class="btn btn-ghost" data-act="print">保存 PDF</button></div>
      <button class="link" data-act="restart">重新诊断</button>
      <p class="method">关于本报告：成熟度由 18 项行为题按六个维度加权计算，跳过的题目不计分。外部视角来自联网公开信息与客户提问模拟，不计入成熟度评分。评估方法参考 OECD 中小企业 AI 准备度、NIST AI 风险管理框架与 AIRI 成熟度框架，由鲲界科技结合国内中小企业实践本地化。</p>
    </section>
  </main>`;
}

function externalSection() {
  const sc = state.scan || {}, d = geoAsks(sc);
  const chat = d ? d.asks.map(a => `<div class="ask">
      <div class="bubble q">${I('user')}<span>${esc(a.question)}</span></div>
      <div class="bubble a"><span class="mono">AI 检索到的前 ${a.top.length} 个来源</span>
        <ol>${a.top.map(t => `<li class="${t.mine ? 'mine' : ''}">${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.title)}</a>` : esc(t.title)}${t.mine ? '<em>你的品牌</em>' : ''}</li>`).join('')}</ol>
      </div></div>`).join('') : '';
  const mine = d ? d.asks.reduce((n, a) => n + a.top.filter(t => t.mine).length, 0) : 0;
  return `<section class="sec" id="s4"><div class="sec-h"><span class="n">04</span><h2>AI 可见度</h2></div>
    <p class="sub-lead" style="margin:0 0 14px">潜在客户不知道你时，会直接问 AI “该选谁”。以下是我们模拟提问的结果。</p>
    ${d ? `<div class="card geo-card">
        <div class="geo-score"><div class="geo-big ${mine ? 'ok' : 'warn'}">${mine ? I('check') : I('alert')}</div><div><b>${mine ? `品牌被检索到 ${mine} 次` : '品牌暂未出现在客户提问的结果中'}</b><span>${mine ? '已有一定基础，可继续提升排名与引用质量' : '这意味着通过 AI 搜索找供应商的客户，目前很难发现你'}</span></div></div>
        ${chat}</div>` : '<div class="card empty-card">公开信息较少，暂未生成客户提问模拟。补充官网后重新诊断，可获得完整结果。</div>'}
    <div class="card facts">
      <div class="kv"><dt>业务画像</dt><dd>${esc(sc.business || '—')}</dd></div>
      <div class="kv"><dt>官网</dt><dd>${sc.website ? `<a href="${esc(sc.website)}" target="_blank" rel="noopener">${esc(sc.website.replace(/^https?:\/\//, ''))}</a>` : '未找到。主要靠平台或渠道获客的企业，可优先优化店铺与渠道页面。'}</dd></div>
      ${sc.reputation && !/证据不足/.test(sc.reputation) ? `<div class="kv"><dt>公开报道</dt><dd>${esc(sc.reputation)}</dd></div>` : ''}
    </div>
    ${sc.sources?.length ? `<details class="src"><summary>查看 ${sc.sources.length} 条公开来源</summary>${sc.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener"><span class="fav">${esc((hostOf(s.url)[0] || '·').toUpperCase())}</span><span>${esc(s.title || s.url)}<small>${esc(hostOf(s.url))}</small></span></a>`).join('')}</details>` : ''}
  </section>`;
}
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

function scenarioSection(r, deep) {
  const d = state.deep;
  const seg = (id, key, opts, label) => `<div class="seg-ctl"><span>${label}</span><div class="row">${opts.map(([t, v]) => `<button class="${(d.inputs[id]?.[key] ?? opts[1][1]) === v ? 'on' : ''}" data-act="seg" data-id="${id}" data-k="${key}" data-v="${v}">${t}</button>`).join('')}</div></div>`;
  const form = `<div class="card deep">
    <h3>${d.done2 ? '调整场景' : '哪些工作最耗时间？'}</h3><p class="sub-lead" style="margin:0">选 1–3 个，回答 3 个小问题，约 1 分钟。</p>
    <div class="sc-grid">${scenarios.map(s => `<button class="sc ${d.picked.includes(s.id) ? 'on' : ''}" data-act="pick" data-v="${s.id}"><span class="sc-ic">${I(scenarioIcon[s.id])}</span><b>${s.name}</b><span>${s.example}</span></button>`).join('')}</div>
    ${d.picked.map(id => `<div class="sc-input"><b>${I(scenarioIcon[id])}${scenarios.find(s => s.id === id).name}</b>${seg(id, 'freq', freqOptions, '发生频率（全团队）')}${seg(id, 'minutes', durationOptions, '每次耗时')}${seg(id, 'risk', riskOptions, '出错代价')}</div>`).join('')}
    <button class="btn btn-primary" data-act="done2" ${d.picked.length ? '' : 'disabled'}>生成机会矩阵 ${I('arrow')}</button></div>`;
  if (!d.done2) return `<section class="sec" id="s5"><div class="sec-h"><span class="n">05</span><h2>场景机会</h2><span class="tag accent">深度评估</span></div>${form}</section>`;
  const W = 320, Pd = 34, sx = v => Pd + v / 100 * (W - Pd - 10), sy = v => W - Pd - v / 100 * (W - Pd - 10);
  const px = v => sx(Math.max(6, Math.min(94, v))), py = v => sy(Math.max(10, Math.min(88, v)));
  const svgM = `<svg class="matrix" viewBox="0 0 ${W} ${W}" role="img" aria-label="场景机会矩阵">
    <rect x="${sx(50)}" y="${sy(100)}" width="${sx(100) - sx(50)}" height="${sy(50) - sy(100)}" fill="rgba(91,140,255,.10)" rx="6"/>
    <line x1="${sx(0)}" y1="${sy(50)}" x2="${sx(100)}" y2="${sy(50)}" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 4"/><line x1="${sx(50)}" y1="${sy(0)}" x2="${sx(50)}" y2="${sy(100)}" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 4"/>
    <line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(100)}" y2="${sy(0)}" stroke="rgba(255,255,255,.25)"/><line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0)}" y2="${sy(100)}" stroke="rgba(255,255,255,.25)"/>
    <text x="${sx(98)}" y="${sy(95)}" text-anchor="end" fill="#7aa6ff" font-size="11">优先试点</text><text x="${sx(2)}" y="${sy(95)}" fill="#858b95" font-size="11">先打基础</text>
    <text x="${sx(98)}" y="${sy(3)}" text-anchor="end" fill="#858b95" font-size="11">快速见效</text><text x="${sx(2)}" y="${sy(3)}" fill="#565c66" font-size="11">暂缓</text>
    <text x="${sx(50)}" y="${W - 8}" text-anchor="middle" fill="#858b95" font-size="10.5">落地就绪度 →</text><text x="12" y="${sy(50)}" fill="#858b95" font-size="10.5" transform="rotate(-90 12 ${sy(50)})" text-anchor="middle">业务价值 →</text>
    ${deep.map((s, i) => `<g class="pin" style="--d:${i * 0.15}s"><circle cx="${px(s.ready)}" cy="${py(s.value)}" r="${i ? 14 : 18}" fill="${i ? 'rgba(185,190,199,.12)' : 'rgba(91,140,255,.18)'}"/><circle cx="${px(s.ready)}" cy="${py(s.value)}" r="${i ? 6 : 8}" fill="${i ? '#b9bec7' : '#5b8cff'}" stroke="#0a0b0d" stroke-width="2"/><text x="${px(s.ready) + (s.ready > 60 ? -14 : 14)}" y="${py(s.value) + 4}" text-anchor="${s.ready > 60 ? 'end' : 'start'}" fill="#f1f2f4" font-size="12">${s.name}</text></g>`).join('')}
  </svg>`;
  const maxH = Math.max(...deep.map(s => s.savedHigh), 1);
  return `<section class="sec" id="s5"><div class="sec-h"><span class="n">05</span><h2>场景机会</h2><button class="tag accent" data-act="edit2">调整</button></div>
    <div class="card" style="padding:12px">${svgM}</div>
    <div class="card hours">
      <span class="mono">每月可释放的人工时（估算）</span>
      ${deep.map(s => `<div class="hbar"><div class="hbar-h"><span>${I(scenarioIcon[s.id])}${s.name}</span><b>${Math.round(s.savedLow)}–${Math.round(s.savedHigh)} 小时</b></div><div class="htrack"><i style="--lo:${s.savedLow / maxH * 100}%;--hi:${s.savedHigh / maxH * 100}%"></i></div></div>`).join('')}
      <p class="formula">按每周发生次数 × 每次耗时 × 30%–60% 可由 AI 承担的比例估算，实际以试点基线为准。</p>
    </div>
    <div id="deep2-edit" hidden>${form}</div>
  </section>`;
}

function pilotSection(r, f, deep) {
  const d = state.deep, top = deep[0];
  const weakFix = f.bottlenecks[0]?.fix || '抽 20–30 个真实任务，记录当前耗时与错误率';
  const tools = d.tools.length ? d.tools.join(' / ') : '现有协作工具';
  const road = `<div class="road">
    <div class="step"><span class="ph">${I('flag')}</span><div><span>第 1–2 周</span><b>建立基线</b><p>${esc(weakFix)}；指定负责人${d.owner ? `（${esc(d.owner)}）` : ''}，记录 20–30 个真实任务的${d.metric ? `「${esc(d.metric)}」` : '耗时与错误率'}。</p></div></div>
    <div class="step"><span class="ph">${I('bolt')}</span><div><span>第 3–6 周</span><b>小范围试点</b><p>${top ? `在「${top.name}」中` : '在一个高频、低风险的任务中'}让 AI 出初稿、人来确认，结果回写到${esc(tools)}；所有对外内容保留人工审核。</p></div></div>
    <div class="step"><span class="ph">${I('value')}</span><div><span>第 7–12 周</span><b>复盘与复制</b><p>与基线对比效果，稳定后复制到${deep[1] ? `「${deep[1].name}」` : '第二个场景'}，并把纠错记录沉淀进知识库。</p></div></div></div>`;
  const plan = state.plan?.mode === 'model' ? state.plan : null;
  const firstTask = top ? top.example.split('、')[0] : '';
  const card = d.done3 && top ? `<div class="card pilot">
      <div class="pilot-h"><span class="sc-ic big">${I(scenarioIcon[top.id])}</span><div><span class="mono">第一个试点</span><b>${top.name}</b></div></div>
      <div class="row"><span>任务</span><p>${esc(plan?.pilot || `${firstTask}：由 AI 出初稿，${d.owner || '负责人'}确认后发出。`)}</p></div>
      <div class="row"><span>工作链路</span>${plan ? `<p>${esc(plan.architecture)}</p>` : `<div class="chain"><i>${esc(firstTask)}</i><s>→</s><i class="ai">AI 生成初稿</i><s>→</s><i class="h">人工确认</i><s>→</s><i>回写 ${esc(d.tools[0] || '协作工具')}</i></div>`}</div>
      <div class="row"><span>衡量方式</span><p>${esc(plan?.baseline || `试点前记录 20–30 次「${d.metric || '处理时长'}」，试点 4 周后用同样口径对比。`)}</p></div>
      <div class="row"><span>安全边界</span><p>${esc(plan?.guardrail || '客户信息与报价只在授权范围内使用；AI 输出经人工确认后才对外发送；每周汇总错误案例。')}</p></div>
    </div>` : '';
  const form = `<div class="card deep" ${d.done3 ? 'hidden id="deep3-edit"' : ''}>
    <h3>补充 3 个实施条件</h3><p class="sub-lead" style="margin:0">用于生成你的专属试点方案。</p>
    <div class="seg-ctl"><span>现在用哪些工具</span><div class="chips">${toolOptions.map(t => `<button class="chip ${d.tools.includes(t) ? 'on' : ''}" data-act="tool" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="seg-ctl"><span>最想改善的指标</span><div class="chips">${metricOptions.map(t => `<button class="chip ${d.metric === t ? 'on' : ''}" data-act="metric" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="seg-ctl"><span>谁来负责试点</span><input class="text-in" id="owner" maxlength="20" placeholder="例如：运营负责人" value="${esc(d.owner)}"></div>
    <label class="consent"><input type="checkbox" id="consent" ${d.consent ? 'checked' : ''}>使用 AI 生成个性化方案（仅使用以上实施条件，不含联系方式）</label>
    <button class="btn btn-primary" data-act="done3">生成试点方案 ${I('arrow')}</button></div>`;
  return `<section class="sec" id="s6"><div class="sec-h"><span class="n">06</span><h2>试点方案</h2>${d.done3 ? '<button class="tag accent" data-act="edit3">调整</button>' : d.done2 ? '<span class="tag accent">深度评估</span>' : ''}</div>
    ${card}${d.done2 ? form : ''}
    <p class="sub-lead" style="margin:${d.done2 ? '22px' : '0'} 0 14px">90 天落地路线</p>${road}
  </section>`;
}

const industryHue = { '电商零售': 210, '制造': 160, '专业服务': 260, '其他': 30 };
function casesSection(r) {
  const list = matchCases({ industry: state.industry, picked: state.deep.picked, weakDims: r.weakest.map(d => d.id) }, 5);
  return `<section class="sec" id="s7"><div class="sec-h"><span class="n">07</span><h2>参考案例</h2></div>
    <p class="sub-lead" style="margin:0 0 14px">按你的场景、行业与短板，从 ${cases.length} 个公开落地案例中匹配。借鉴做法，不照搬规模。</p>
    ${list.map(c => `<a class="card case" href="${esc(c.url)}" target="_blank" rel="noopener">
      <div class="case-h"><span class="logo" style="--h:${industryHue[c.industry] ?? 210}">${esc([...c.company][0])}</span><div><h4>${esc(c.title)}</h4><span class="co">${esc(c.company)} · ${esc(c.industry)}</span></div></div>
      <div class="top">${c.same ? '<span class="tag ok">同行业</span>' : ''}${c.hit.slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <p><span>可借鉴</span>${esc(c.borrow)}</p><p><span>注意</span>${esc(c.caution)}</p>
      <div class="go"><span>${esc(c.source)}</span><span>阅读原文 ${svg(P.ext, 12)}</span></div></a>`).join('')}
    <button class="btn btn-ghost" data-act="discover">查找更多同行案例</button>
    <div id="discover-out"></div>
  </section>`;
}

/* ================= REPORT motion ================= */
function animateReport() {
  const fg = app.querySelector('.ring-fg'), num = app.querySelector('[data-count]');
  const start = () => {
    if (fg) fg.style.strokeDashoffset = fg.dataset.off;
    app.querySelectorAll('.track i').forEach(i => { i.style.width = i.dataset.w + '%'; });
    app.querySelector('.radar')?.classList.add('in');
    if (num) { const target = +num.dataset.count, t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); num.textContent = Math.round(target * e); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); setTimeout(() => { num.textContent = target; }, 1500); }
  };
  requestAnimationFrame(() => setTimeout(start, 60)); setTimeout(start, 400);
  // Sections fade in as they scroll into view; a timed fallback guarantees nothing stays hidden.
  const secs = [...app.querySelectorAll('.sec')];
  const show = s => s.classList.add('in');
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' }); secs.forEach(s => io.observe(s)); }
  setTimeout(() => secs.forEach(show), 1800);
  syncToc();
}
let tocCurrent = '';
function syncToc() {
  if (state.screen !== 'report') return;
  const secs = [...app.querySelectorAll('.sec')], cur = secs.filter(s => s.getBoundingClientRect().top < 160).pop()?.id || 's1';
  if (cur === tocCurrent && app.querySelector('.toc a.on')) return;
  tocCurrent = cur;
  app.querySelectorAll('[data-toc]').forEach(l => {
    l.classList.toggle('on', l.dataset.toc === cur);
    if (l.dataset.toc === cur) { const bar = l.parentElement; bar.scrollTo({ left: l.offsetLeft - bar.clientWidth / 2 + l.clientWidth / 2, behavior: 'smooth' }); }
  });
}
addEventListener('scroll', syncToc, { passive: true });
function rerenderReport(anchor) {
  app.innerHTML = report(); animateReport();
  app.querySelectorAll('.sec').forEach(s => s.classList.add('in'));
  if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
}
function summary() {
  const r = calculate(state.answers), f = findings(state.answers), top = state.deep.done2 ? deepResults(r)[0] : null;
  return [`【${state.company}｜企业 AI 化诊断】`, `成熟度 ${r.score}/100 · ${r.level.id} ${r.level.name}`, `主要短板：${r.weakest.map(d => d.name).join('、')}`,
    ...f.bottlenecks.map((b, i) => `${i + 1}. ${b.gap} → ${b.fix}`), top ? `建议首个试点：${top.name}（每月可释放约 ${Math.round(top.savedLow)}–${Math.round(top.savedHigh)} 小时）` : '', '— 鲲界科技 · 企业 AI 化诊断'].filter(Boolean).join('\n');
}
async function copy(text, msg) { try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast('复制失败，请长按选择文本'); } }
async function done3() {
  const d = state.deep; d.owner = app.querySelector('#owner')?.value.trim() || ''; d.consent = !!app.querySelector('#consent')?.checked; d.done3 = true; state.plan = null; save();
  const btn = app.querySelector('[data-act="done3"]'); if (btn) { btn.disabled = true; btn.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>正在生成方案'; }
  if (d.consent && !state.isSample) {
    const r = calculate(state.answers), dr = deepResults(r), top = dr[0];
    try {
      const res = await fetch('/api/ai-plan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ company: state.company, stage: r.level.name, weakDimensions: r.weakest.map(x => x.name), scenarios: dr.map(x => x.name), challenge: top ? `${top.name}：${top.example}` : '', frequency: freqOptions.find(f => f[1] === d.inputs[top?.id]?.freq)?.[0] || '', teamSize: state.size, tools: d.tools.join('、'), dataReady: r.dims.find(x => x.id === 'knowledge').score + ' 分', owner: d.owner, metric: d.metric }) });
      state.plan = await res.json();
    } catch { state.plan = null; }
  } else await wait(500);
  toast('试点方案已生成'); save(); buzz(14); rerenderReport('s6');
}
async function discover() {
  const out = app.querySelector('#discover-out'); out.innerHTML = '<p class="formula"><span class="dots"><i></i><i></i><i></i></span>正在查找</p>';
  try {
    const r = await (await fetch('/api/case-discovery', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ business: state.scan?.business || state.industry || '', scenarios: state.deep.picked.map(id => scenarios.find(s => s.id === id).name) }) })).json();
    out.innerHTML = r.candidates?.length ? `<p class="sub-lead">延伸阅读</p>${r.candidates.map(c => `<a class="card case" href="${esc(c.url)}" target="_blank" rel="noopener"><h4>${esc(c.title)}</h4><p>${esc(c.snippet)}</p><div class="go"><span>${esc(hostOf(c.url))}</span><span>阅读原文 ${svg(P.ext, 12)}</span></div></a>`).join('')}` : '<p class="formula">暂未找到更多同类案例，顾问解读时会为你补充。</p>';
  } catch { out.innerHTML = '<p class="formula">暂时无法查找，请稍后再试。</p>'; }
}
async function submitLead() {
  const name = app.querySelector('#lead-name').value.trim(), phone = app.querySelector('#lead-phone').value.replace(/\s/g, '');
  if (!name || !/^1\d{10}$/.test(phone)) { toast('请填写称呼和 11 位手机号'); return; }
  const btn = app.querySelector('[data-act="lead"]'); btn.disabled = true;
  const r = calculate(state.answers), top = state.deep.done2 ? deepResults(r)[0] : null;
  try {
    const res = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, phone, company: state.company, industry: state.industry, size: state.size, score: r.score, level: `${r.level.id} ${r.level.name}`, focus: top?.name || r.weakest[0]?.name || '' }) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error);
    state.lead = { name }; save(); buzz(16); toast('预约成功'); rerenderReport('s8');
  } catch (e) { toast(e.message || '提交失败，请稍后再试'); btn.disabled = false; }
}

/* ================= RENDER & EVENTS ================= */
function render(dir) {
  const s = state.screen;
  app.innerHTML = s === 'scan' ? scan() : s === 'questions' ? questionScreen(dir) : s === 'compute' ? compute() : s === 'report' ? report() : home();
  if (s === 'questions') bindSwipe();
  if (s === 'report') animateReport();
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, v = el.dataset.v;
  if (el.classList.contains('btn')) { const rc = el.getBoundingClientRect(), r = document.createElement('span'), size = Math.max(rc.width, rc.height) * 2; r.className = 'ripple'; Object.assign(r.style, { width: size + 'px', height: size + 'px', left: e.clientX - rc.left - size / 2 + 'px', top: e.clientY - rc.top - size / 2 + 'px' }); el.appendChild(r); setTimeout(() => r.remove(), 600); }
  const d = state.deep;
  switch (act) {
    case 'start': {
      const company = app.querySelector('#company').value.trim(), website = app.querySelector('#website').value.trim();
      if (company.length < 2) { toast('请输入公司名称'); app.querySelector('#company').focus(); return; }
      const site = website && !/^https?:\/\//.test(website) ? `https://${website}` : website;
      buzz(); const keep = state.company === company && state.website === site && state.scan && !state.isSample;
      state = keep ? state : { ...fresh(), company, website: site };
      go('scan'); if (!keep) startScan(); break;
    }
    case 'sample':
      buzz(); state = { ...fresh(), company: sample.company, industry: sample.industry, size: sample.size, website: sample.website, answers: { ...sample.answers }, isSample: true,
        scan: { company: sample.company, ...structuredClone(sample.scan) },
        deep: { ...fresh().deep, picked: [...sample.deep.picked], inputs: structuredClone(sample.deep.inputs), tools: [...sample.deep.tools], metric: sample.deep.metric, owner: sample.deep.owner, done2: true, done3: true } };
      go('compute'); break;
    case 'home': go('home'); break;
    case 'restart': state = fresh(); go('home'); break;
    case 'to-questions': {
      const biz = app.querySelector('#biz')?.value.trim(); if (biz && state.scan) state.scan = { ...state.scan, business: biz };
      go('questions', { idx: Math.min(state.idx, questions.length - 1) }); break;
    }
    case 'resume': { const i = questions.findIndex(q => state.answers[q.id] === undefined); go('questions', { idx: i >= 0 ? i : 0 }); break; }
    case 'industry': case 'size': state[act] = state[act] === v ? '' : v; save(); el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.v === state[act])); buzz(5); break;
    case 'answer': answer(Number(v), el); break;
    case 'next': if (state.answers[questions[state.idx].id] === undefined) { toast('选一项，或点“不确定”跳过'); return; } next(); break;
    case 'prev': prev(); break;
    case 'dim': el.classList.toggle('open'); buzz(4); break;
    case 'pick': { const i = d.picked.indexOf(v); if (i >= 0) d.picked.splice(i, 1); else if (d.picked.length < 3) { d.picked.push(v); d.inputs[v] ||= { freq: freqOptions[1][1], minutes: durationOptions[1][1], risk: riskOptions[1][1] }; } else { toast('最多选 3 个'); return; } save(); buzz(5); rerenderReport('s5'); if (d.done2) app.querySelector('#deep2-edit')?.removeAttribute('hidden'); break; }
    case 'seg': d.inputs[el.dataset.id] = { ...(d.inputs[el.dataset.id] || {}), [el.dataset.k]: Number(v) }; save(); buzz(4); el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); break;
    case 'done2': d.done2 = true; save(); buzz(14); toast('机会矩阵已生成'); rerenderReport('s5'); break;
    case 'edit2': app.querySelector('#deep2-edit')?.toggleAttribute('hidden'); break;
    case 'edit3': app.querySelector('#deep3-edit')?.toggleAttribute('hidden'); break;
    case 'tool': { const i = d.tools.indexOf(v); i >= 0 ? d.tools.splice(i, 1) : d.tools.push(v); save(); el.classList.toggle('on'); buzz(4); break; }
    case 'metric': d.metric = d.metric === v ? '' : v; save(); el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.v === d.metric)); buzz(4); break;
    case 'done3': done3(); break;
    case 'discover': discover(); break;
    case 'lead': submitLead(); break;
    case 'copy': copy(summary(), '摘要已复制'); break;
    case 'share': if (navigator.share) navigator.share({ title: `${state.company} AI 化诊断`, text: summary() }).catch(() => {}); else copy(summary(), '摘要已复制，可直接粘贴分享'); break;
    case 'print': window.print(); break;
  }
});
app.addEventListener('submit', e => { e.preventDefault(); app.querySelector('[data-act="start"]')?.click(); });
app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'website') { e.preventDefault(); app.querySelector('[data-act="start"]')?.click(); } });

/* ---------- pointer-following light: dot field + glow + spotlight on the touched card ---------- */
const field = document.getElementById('field'), ctx = field.getContext('2d');
let pointer = { x: -999, y: -999 }, raf = 0;
function drawField() {
  raf = 0; const dpr = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight;
  if (field.width !== w * dpr) { field.width = w * dpr; field.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const gap = 24;
  for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) {
    const dist = Math.hypot(x - pointer.x, y - pointer.y), k = Math.max(0, 1 - dist / 170);
    ctx.fillStyle = k > 0 ? `rgba(${Math.round(120 + 40 * k)},${Math.round(150 + 20 * k)},255,${0.10 + k * 0.55})` : 'rgba(255,255,255,0.06)';
    const r = 0.8 + k * 1.1; ctx.fillRect(x - r / 2, y - r / 2, r, r);
  }
}
const schedule = () => { if (!raf) raf = requestAnimationFrame(drawField); };
function onPoint(x, y, target) {
  pointer = { x, y }; schedule();
  document.body.style.setProperty('--gx', x + 'px'); document.body.style.setProperty('--gy', y + 'px');
  const el = target?.closest?.('.opt, .card'); if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', x - r.left + 'px'); el.style.setProperty('--my', y - r.top + 'px'); }
}
addEventListener('pointermove', e => onPoint(e.clientX, e.clientY, e.target), { passive: true });
addEventListener('touchmove', e => { const t = e.touches[0]; onPoint(t.clientX, t.clientY, document.elementFromPoint(t.clientX, t.clientY)); }, { passive: true });
addEventListener('touchstart', e => { const t = e.touches[0]; onPoint(t.clientX, t.clientY, e.target); }, { passive: true });
addEventListener('resize', schedule);
drawField();

if (state.screen === 'scan' && !state.scan) state.screen = 'home';
if (state.screen === 'compute') state.screen = 'report';
render();

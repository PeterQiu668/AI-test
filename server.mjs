import http from 'node:http';
import { readFile, stat, appendFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep, dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
// engine.mjs is re-imported when its file changes, so scan logic can be updated without a restart
// (a restart would drop the unlocked credentials and force the admin to unlock again).
let engineState = { mtime: 0, mod: null }, providerNames = {};
async function engine() {
  const mtime = (await stat(new URL('./engine.mjs', import.meta.url))).mtimeMs;
  if (mtime !== engineState.mtime) { engineState = { mtime, mod: await import(`./engine.mjs?v=${mtime}`) }; providerNames = engineState.mod.providerNames; if (engineState.mtime) console.log('engine loaded', new Date(mtime).toISOString()); }
  return engineState.mod;
}
await engine();
import { vaultExists, openVault, saveVault, constantEqual, vaultPath } from './vault.mjs';
// Leads hold phone numbers: kept next to the credential vault, outside the served directory.
const leadsPath = process.env.KUNJIE_LEADS_PATH || join(dirname(vaultPath), 'leads.jsonl');

const root = resolve(import.meta.dirname), port = Number(process.env.PORT || 5176);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json; charset=utf-8', '.png': 'image/png' };
const sessions = new Map(), rate = new Map();
let activeConfig = null;
function send(res, status, data, type = 'application/json; charset=utf-8') {
  // Log API outcomes only (never request bodies), so failed admin saves are diagnosable.
  if (res.req?.url?.startsWith('/api/')) console.log(`${new Date().toISOString()} ${res.req.method} ${res.req.url.split('?')[0]} → ${status}${data?.error ? ` ${data.error}` : ''} origin=${res.req.headers.origin || '-'}`);
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'" });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
function limited(ip, bucket, max) {
  const key = `${ip}:${bucket}`, now = Date.now(), values = (rate.get(key) || []).filter(x => now - x < 60_000);
  rate.set(key, [...values, now]); return values.length >= max;
}
async function bodyJson(req, max = 5000) {
  let input = '';
  for await (const chunk of req) { input += chunk; if (input.length > max) throw new Error('输入过长'); }
  try { return JSON.parse(input); } catch { throw new Error('请求格式无效'); }
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  return !origin || origin === `http://127.0.0.1:${port}` || origin === `http://localhost:${port}`;
}
function sessionOf(req) {
  const token = /(?:^|;\s*)kj_admin=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  const session = token ? sessions.get(token) : null;
  if (!session || session.expires < Date.now()) return null;
  session.expires = Date.now() + 30 * 60_000;
  return session;
}
function csrfOkay(req, session) { return session && constantEqual(req.headers['x-kj-csrf'] || '', session.csrf); }
function configView(config) {
  return { synthesis: config.synthesis || 'deepseek', providers: Object.fromEntries(Object.keys(providerNames).map(id => {
    const x = config.providers?.[id] || {};
    return [id, { enabled: !!x.enabled, configured: id === 'yuanbao' ? !!(x.secretId && x.secretKey) : !!x.key, model: x.model || '' }];
  })) };
}
async function handleApi(req, res, url) {
  const { scanCompany, generatePlan, discoverCases, testProvider } = await engine();
  const ip = req.socket.remoteAddress || 'local';
  if (req.method === 'POST' && !sameOrigin(req)) return send(res, 403, { error: '来源不匹配' });
  if (url.pathname === '/api/admin/status' && req.method === 'GET') {
    const session = sessionOf(req);
    return send(res, 200, { initialized: await vaultExists(), authenticated: !!session, csrf: session?.csrf || '', settings: session ? configView(session.config) : null, providers: providerNames });
  }
  if (url.pathname === '/api/admin/unlock' && req.method === 'POST') {
    if (limited(ip, 'unlock', 6)) return send(res, 429, { error: '尝试过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const passphrase = String(data.passphrase || '');
    if (passphrase.length < 12 || passphrase.length > 200) return send(res, 400, { error: '管理口令需要 12–200 个字符' });
    let config;
    try {
      if (await vaultExists()) config = await openVault(passphrase);
      else { config = { synthesis: 'deepseek', providers: {} }; await saveVault(passphrase, config); }
    } catch { return send(res, 401, { error: '管理口令不正确' }); }
    const token = randomBytes(32).toString('hex'), csrf = randomBytes(24).toString('hex');
    sessions.set(token, { config, passphrase, csrf, expires: Date.now() + 30 * 60_000 });
    activeConfig = config;
    res.setHeader('set-cookie', `kj_admin=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=1800`);
    return send(res, 200, { ok: true, csrf, settings: configView(config) });
  }
  if (url.pathname === '/api/admin/save' && req.method === 'POST') {
    const session = sessionOf(req);
    if (!csrfOkay(req, session)) return send(res, 403, { error: '请先解锁管理后台' });
    let data; try { data = await bodyJson(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const id = String(data.provider || '');
    if (!providerNames[id]) return send(res, 400, { error: '未知提供方' });
    const old = session.config.providers?.[id] || {};
    const next = { ...old, enabled: !!data.enabled, model: String(data.model || '').trim().slice(0, 100) };
    if (id === 'yuanbao') {
      if (data.secretId) next.secretId = String(data.secretId).trim().slice(0, 200);
      if (data.secretKey) next.secretKey = String(data.secretKey).trim().slice(0, 300);
    } else if (data.key) next.key = String(data.key).trim().slice(0, 300);
    if (next.enabled && !(id === 'yuanbao' ? next.secretId && next.secretKey : next.key)) return send(res, 400, { error: '请先填完整凭证' });
    if (next.enabled && ['doubao','openai'].includes(id) && !next.model) return send(res, 400, { error: '请填写已开通的模型 ID' });
    session.config.providers = { ...(session.config.providers || {}), [id]: next };
    if (data.synthesis && ['deepseek', 'doubao', 'openai'].includes(data.synthesis)) session.config.synthesis = data.synthesis;
    await saveVault(session.passphrase, session.config);
    activeConfig = session.config;
    return send(res, 200, { ok: true, settings: configView(session.config) });
  }
  if (url.pathname === '/api/admin/test' && req.method === 'POST') {
    const session = sessionOf(req);
    if (!csrfOkay(req, session)) return send(res, 403, { error: '请先解锁管理后台' });
    if (limited(ip, 'test', 10)) return send(res, 429, { error: '测试过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const result = await testProvider(String(data.provider || ''), session.config);
    console.log(`  test ${data.provider}: ${result.ok ? 'ok' : 'fail'} ${result.message}`);
    return send(res, 200, result);
  }
  if (url.pathname === '/api/company-scan' && req.method === 'POST') {
    if (limited(ip, 'scan', 7)) return send(res, 429, { error: '扫描过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req, 3000); } catch (e) { return send(res, 400, { error: e.message }); }
    const company = String(data.company || '').trim().slice(0, 60);
    if (company.length < 2) return send(res, 400, { error: '请输入至少两个字的企业名称' });
    let website = '';
    try { if (data.website) { const u = new URL(data.website); if (u.protocol === 'https:' && !u.username && !u.password) website = u.href; } } catch { /* no site */ }
    try { return send(res, 200, await scanCompany(company, website, activeConfig)); }
    catch { return send(res, 500, { error: '扫描服务暂不可用' }); }
  }
  if (url.pathname === '/api/scan-stream' && req.method === 'GET') {
    // Server-sent events: one event per probe so the client can show real progress, then a final "result".
    if (limited(ip, 'scan', 7)) return send(res, 429, { error: '扫描过于频繁，请稍后再试' });
    const company = String(url.searchParams.get('company') || '').trim().slice(0, 60);
    if (company.length < 2) return send(res, 400, { error: '请输入至少两个字的企业名称' });
    let website = '';
    try { const raw = url.searchParams.get('website'); if (raw) { const u = new URL(raw); if (u.protocol === 'https:' && !u.username && !u.password) website = u.href; } } catch { /* no site */ }
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', connection: 'keep-alive' });
    const emit = (type, data) => { if (!res.writableEnded) res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); };
    emit('step', { step: 'entity', status: 'done', detail: `识别主体「${company}」` });
    try { emit('result', await scanCompany(company, website, activeConfig, data => emit('step', data))); }
    catch { emit('failure', { error: '扫描服务暂不可用' }); }
    return res.end();
  }
  if (url.pathname === '/api/lead' && req.method === 'POST') {
    if (limited(ip, 'lead', 5)) return send(res, 429, { error: '提交过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req, 3000); } catch (e) { return send(res, 400, { error: e.message }); }
    const name = String(data.name || '').trim().slice(0, 20), phone = String(data.phone || '').replace(/\s/g, '');
    if (!name || !/^1\d{10}$/.test(phone)) return send(res, 400, { error: '请填写称呼和 11 位手机号' });
    const lead = { at: new Date().toISOString(), name, phone, company: String(data.company || '').slice(0, 60), industry: String(data.industry || '').slice(0, 20), size: String(data.size || '').slice(0, 20), score: Number.isFinite(data.score) ? data.score : null, level: String(data.level || '').slice(0, 20), focus: String(data.focus || '').slice(0, 60) };
    await mkdir(dirname(leadsPath), { recursive: true });
    await appendFile(leadsPath, JSON.stringify(lead) + '\n', 'utf8');
    return send(res, 200, { ok: true });
  }
  if (url.pathname === '/api/admin/leads' && req.method === 'GET') {
    if (!sessionOf(req)) return send(res, 403, { error: '请先解锁管理后台' });
    let lines = []; try { lines = (await readFile(leadsPath, 'utf8')).trim().split('\n').filter(Boolean); } catch { /* no leads yet */ }
    return send(res, 200, { leads: lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse().slice(0, 200) });
  }
  if (url.pathname === '/api/ai-plan' && req.method === 'POST') {
    if (limited(ip, 'plan', 4)) return send(res, 429, { error: '报告生成过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req, 9000); } catch (e) { return send(res, 400, { error: e.message }); }
    return send(res, 200, await generatePlan(data, activeConfig));
  }
  if (url.pathname === '/api/case-discovery' && req.method === 'POST') {
    if (limited(ip, 'cases', 3)) return send(res, 429, { error: '案例检索过于频繁，请稍后再试' });
    let data; try { data = await bodyJson(req, 4000); } catch (e) { return send(res, 400, { error: e.message }); }
    return send(res, 200, await discoverCases(data, activeConfig));
  }
  return send(res, 404, { error: '接口不存在' });
}
http.createServer(async (req, res) => {
  let url; try { url = new URL(req.url, `http://127.0.0.1:${port}`); } catch { return send(res, 400, { error: 'URL 无效' }); }
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' });
  let pathname; try { pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); } catch { return send(res, 400, { error: 'URL 无效' }); }
  if (pathname === '/admin') pathname = '/admin.html';
  const file = resolve(root, `.${pathname}`);
  if (!file.startsWith(root + sep)) return send(res, 403, { error: 'Forbidden' });
  try {
    const info = await stat(file);
    if (!info.isFile()) return send(res, 404, { error: 'Not found' });
    const bytes = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { send(res, 404, { error: 'Not found' }); }
}).listen(port, '127.0.0.1', () => console.log(`鲲界 AI 诊断 v4 http://127.0.0.1:${port}/  管理后台 /admin`));

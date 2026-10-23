const view = document.getElementById('view');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
let current = null, csrf = '';
function notice(message) { let el = document.querySelector('.notice'); if (!el) { el = document.createElement('div'); el.className = 'notice'; document.body.append(el); } el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000); }
async function call(url, body, method = 'POST') {
  const res = await fetch(url, { method, headers: { 'content-type':'application/json', 'x-kj-csrf':csrf }, body: method === 'POST' ? JSON.stringify(body) : undefined });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || '请求失败'); return data;
}
function login(initialized) {
  view.innerHTML = `<form class="panel" id="unlock"><h2>${initialized ? '解锁模型控制台' : '设置管理口令'}</h2><p>${initialized ? '输入你首次设置的口令，解锁本机凭证库。' : '首次使用需要设置至少 12 位口令。口令不会写入项目，丢失后无法解密已存凭证。'}</p><label for="passphrase">管理口令</label><input id="passphrase" name="passphrase" type="password" minlength="12" maxlength="200" autocomplete="current-password" required><button class="primary" type="submit">${initialized ? '解锁控制台' : '创建加密凭证库'} <span>↗</span></button></form><div class="note">管理后台只监听本机 127.0.0.1。真正发布小程序时，应迁移到独立 HTTPS 服务并接入管理员身份认证。</div>`;
}
const cards = [
  ['bocha','博查全网搜索（推荐）','国内全网检索，只需一个 API Key（open.bochaai.com 申请）','API Key',''],
  ['deepseek','DeepSeek','官方 Search API + 模型归纳','API Key','deepseek-flash'],
  ['doubao','豆包 / 火山方舟','Responses API + 豆包搜索工具','API Key','填写已开通联网工具的模型 ID'],
  ['yuanbao','腾讯云元宝搜索','SearchPro 检索接口','SecretId / SecretKey',''],
  ['openai','OpenAI','可选的报告归纳模型','API Key','填写你已开通的模型 ID']
];
function dashboard(settings) {
  current = settings;
  view.innerHTML = `<div class="note">搜索召回可用于品牌可见性线索；它不是 DeepSeek、豆包、元宝 App 的推荐位测试。仅在实际发起扫描时调用启用的接口，可能产生模型与搜索费用。</div>
    <div class="panel"><h2>归纳模型</h2><p>从已有搜索来源提取业务、官网和同类企业线索。请先启用对应模型。</p><label for="synthesis">主模型</label><select id="synthesis"><option value="deepseek">DeepSeek</option><option value="doubao">豆包 / 火山方舟</option><option value="openai">OpenAI</option></select></div>
    ${cards.map(([id,name,desc,credential,placeholder]) => { const x = settings.providers[id] || {}; return `<form class="panel provider" data-provider="${id}"><div class="provider-head"><h2>${name}</h2><span class="status ${x.enabled && x.configured ? 'on' : ''}">${x.enabled && x.configured ? '已启用' : x.configured ? '已配置 · 暂停' : '未配置'}</span></div><p>${desc}</p>${id === 'yuanbao' ? '<div class="split"><div><label>SecretId</label><input name="secretId" type="password" autocomplete="off" placeholder="输入腾讯云 SecretId"></div><div><label>SecretKey</label><input name="secretKey" type="password" autocomplete="off" placeholder="输入腾讯云 SecretKey"></div></div>' : `<label>${credential}</label><input name="key" type="password" autocomplete="off" placeholder="${x.configured ? '已保存；留空则沿用' : '仅在这里输入'}">`} ${['yuanbao', 'bocha'].includes(id) ? '' : `<label>模型 ID</label><input name="model" value="${escapeHtml(x.model || (id === 'deepseek' ? placeholder : ''))}" placeholder="${escapeHtml(placeholder)}">`}<label class="switch"><input name="enabled" type="checkbox" ${x.enabled ? 'checked' : ''}>启用此接口</label><button class="primary" type="submit">保存设置 →</button>${id !== 'openai' && x.enabled && x.configured ? `<button class="primary" type="button" data-test="${id}" style="margin-top:8px;opacity:.85">测试连接</button><p class="test-out" data-out="${id}"></p>` : ''}</form>`; }).join('')}`;
  document.getElementById('synthesis').value = settings.synthesis;
  view.insertAdjacentHTML('afterbegin', '<div class="panel" id="leads"><h2>预约线索</h2><p>加载中…</p></div>');
  loadLeads();
}
async function loadLeads() {
  const box = document.getElementById('leads');
  try {
    const { leads } = await call('/api/admin/leads', null, 'GET');
    box.innerHTML = `<h2>预约线索 · ${leads.length}</h2>${leads.length ? `<div class="leads">${leads.map(l => `<div class="lead-row"><div><b>${escapeHtml(l.name)}</b> ${escapeHtml(l.phone)}<span>${escapeHtml(l.company)}${l.industry ? ' · ' + escapeHtml(l.industry) : ''}${l.size ? ' · ' + escapeHtml(l.size) : ''}</span></div><div class="lead-meta"><b>${l.score ?? '—'}</b><span>${escapeHtml(l.level)}${l.focus ? ' · ' + escapeHtml(l.focus) : ''}</span><span>${new Date(l.at).toLocaleString('zh-CN', { hour12: false })}</span></div></div>`).join('')}</div>` : '<p>还没有预约。客户在报告页提交后会出现在这里。</p>'}`;
  } catch (error) { box.innerHTML = `<h2>预约线索</h2><p>${escapeHtml(error.message)}</p>`; }
}
view.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target, button = form.querySelector('button[type=submit]'); button.disabled = true;
  try {
    if (form.id === 'unlock') {
      const data = await call('/api/admin/unlock', { passphrase: new FormData(form).get('passphrase') });
      csrf = data.csrf; dashboard(data.settings); notice('管理后台已解锁');
    } else if (form.matches('.provider')) {
      const data = Object.fromEntries(new FormData(form));
      const out = await call('/api/admin/save', { ...data, provider: form.dataset.provider, enabled: form.elements.enabled.checked, synthesis: document.getElementById('synthesis').value });
      dashboard(out.settings); notice('已加密保存，接口状态已更新');
    }
  } catch (error) { notice(error.message); button.disabled = false; }
});
view.addEventListener('click', async event => {
  const button = event.target.closest('[data-test]'); if (!button) return;
  const id = button.dataset.test, out = view.querySelector(`[data-out="${id}"]`);
  button.disabled = true; out.textContent = '测试中…';
  try { const r = await call('/api/admin/test', { provider: id }); out.textContent = (r.ok ? '✓ ' : '✗ ') + r.message; out.style.color = r.ok ? '#3fd18f' : '#f06b5d'; }
  catch (error) { out.textContent = error.message; }
  button.disabled = false;
});
try { const status = await call('/api/admin/status', null, 'GET'); csrf = status.csrf; status.authenticated ? dashboard(status.settings) : login(status.initialized); } catch { login(true); }

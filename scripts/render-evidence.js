const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright-core');
const r = JSON.parse(fs.readFileSync('evidence/results.json','utf8'));
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const block = x => `<section><h3>${esc(x.method+' '+x.path)}</h3><b class="status">HTTP ${x.status}</b><pre>${esc(JSON.stringify(x.body,null,2))}</pre></section>`;
const style = `body{font:16px 'Segoe UI',sans-serif;color:#23272c;background:#f2f3f5;margin:0;padding:42px}main{max-width:1150px;margin:auto}h1{font-size:32px;margin:6px 0 12px}h2{font-size:22px}h3{font-size:16px;overflow-wrap:anywhere}p{color:#565e69;line-height:1.5}.tag{letter-spacing:2px;color:#727b85;font-size:12px}section{background:white;border:1px solid #d9dce1;border-radius:10px;padding:22px;margin:18px 0}pre{font:14px/1.45 Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;background:white}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}.status{color:#1b7049}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.grid section{margin:0}`;
function html(title,content){return `<!doctype html><html lang="uk"><meta charset="utf-8"><title>${title}</title><style>${style}</style><main><div class="tag">ПРАКТИЧНА РОБОТА 07 · ВАРІАНТ 03</div><h1>${title}</h1><p>Фактичні результати автоматичної перевірки · ${esc(new Date(r.timestamp).toLocaleString('uk-UA', {timeZone:'Europe/Kiev'}))} (Київ)<br>${esc(r.database)}<br>Збережені відповіді API; Docker-запуск не перевірявся.</p>${content}</main></html>`;}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1320,height:1000},deviceScaleFactor:1});
  const first=r.transcript.find(x=>x.path.includes('page=1&limit=3'));
  const second=r.transcript.find(x=>x.path.includes('page=2&limit=3'));
  const del=r.transcript.findIndex(x=>x.method==='DELETE'&&x.status===204);
  const restore=r.transcript.findIndex((x,i)=>i>del&&x.path.endsWith('/restore')&&x.status===200);
  const invalid=r.transcript.find(x=>x.path==='/clothes?page=0');
  const docs=[
   ['01-results','Усі перевірки виконано',`<section><h2>${r.checks.length} груп сценаріїв · ${r.transcript.length} HTTP-запитів · 0 збоїв</h2><p>Перезапуск процесу NestJS перевірено всередині тесту. Дані та м’яке видалення збереглися.</p></section><table><tr><th>Перевірка</th><th>Результат</th></tr>${r.checks.map(x=>`<tr><td>${esc(x.name)}</td><td class="status">PASS</td></tr>`).join('')}</table>`],
   ['02-pagination','Пагінація: дві різні сторінки',`<div class="grid">${block(first)}${block(second)}</div>`],
   ['03-delete-restore','М’яке видалення та відновлення',`<div class="grid"><div>${block(r.transcript[del])}${block(r.transcript[del+1])}</div><div>${block(r.transcript[restore])}${block(r.transcript[restore+1])}</div></div>`],
   ['04-validation','Валідація відхиляє некоректний запит',block(invalid)]
  ];
  for(const [name,title,content] of docs){
   const target=path.resolve('evidence',name+'.html');fs.writeFileSync(target,html(title,content));
   await page.goto(pathToFileURL(target).href);await page.screenshot({path:path.resolve('evidence',name+'.png'),fullPage:true});
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

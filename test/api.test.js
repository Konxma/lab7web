const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const { Client } = require('pg');
const { randomUUID } = require('node:crypto');

test('PostgreSQL: schema, CRUD, pagination, validation, soft delete, restore and process restart', { timeout: 60000 }, async () => {
  const database = process.env.TEST_DB_NAME;
  assert.ok(database && /(_test|_verification)$/.test(database), 'Set TEST_DB_NAME to a dedicated database ending in _test or _verification');
  const env = { ...process.env, DB_NAME: database, PORT: process.env.TEST_PORT || '3108', DB_LOGGING: 'true' };
  const base = `http://127.0.0.1:${env.PORT}`;
  const db = new Client({ host: env.DB_HOST || '127.0.0.1', port: Number(env.DB_PORT || 5432), user: env.DB_USER || 'nest_user', password: env.DB_PASSWORD || 'nest_password', database });
  const transcript = [], checks = [], ids = [];
  const marker = `QA-${Date.now()}`;
  let server, log = '';
  const check = (name, fn) => { fn(); checks.push({ name, result: 'PASS' }); };
  async function stop() {
    if (server && server.exitCode === null) { const ended = once(server, 'exit'); server.kill(); await ended; }
  }
  async function start() {
    server = spawn(process.execPath, ['dist/main.js'], { env, windowsHide: true });
    server.stdout.on('data', x => log += x); server.stderr.on('data', x => log += x);
    for (let i = 0; i < 150; i++) {
      if (server.exitCode !== null) throw new Error(log);
      try { if ((await fetch(base)).ok) return; } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Server did not start: ' + log);
  }
  async function req(method, path, body, expected = 200) {
    const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const raw = await res.text(); let result; try { result = JSON.parse(raw); } catch { result = raw; }
    transcript.push({ method, path, status: res.status, body: result });
    assert.equal(res.status, expected, JSON.stringify(result));
    return result;
  }
  try {
    await db.connect(); await start();
    const cols = (await db.query("SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name='clothes' ORDER BY ordinal_position")).rows;
    check('SQL schema: UUID, varchar lengths, decimal(10,2), enum, timestamptz', () => {
      const c = Object.fromEntries(cols.map(x => [x.column_name, x]));
      assert.equal(c.id.data_type, 'uuid'); assert.equal(c.title.character_maximum_length, 150);
      assert.equal(c.material.character_maximum_length, 80); assert.equal(c.color.character_maximum_length, 50);
      assert.equal(c.price.numeric_precision, 10); assert.equal(c.price.numeric_scale, 2);
      assert.equal(c.size.data_type, 'USER-DEFINED');
      for (const field of ['createdAt','updatedAt','deletedAt']) assert.equal(c[field].data_type, 'timestamp with time zone');
    });
    for (let i=0;i<7;i++) {
      const item = await req('POST', '/clothes', { title: `  ${marker} Одяг ${i}  `, price: 100 + i * 10 + 0.25, size: 'M', material: 'Бавовна', color: 'Синій' }, 201);
      ids.push(item.id);
      assert.match(item.id, /^[0-9a-f-]{36}$/); assert.equal(item.price, `${100+i*10}.25`); assert.equal(item.title, `${marker} Одяг ${i}`);
    }
    checks.push({name:'Create 7 rows: generated UUID, trim, exact decimal strings',result:'PASS'});
    const listPath = '/clothes?search=' + encodeURIComponent(marker);
    const first = await req('GET',listPath+'&page=1&limit=3');
    const second = await req('GET',listPath+'&page=2&limit=3');
    check('Pagination: 3 + 3 rows, total=7, totalPages=3, distinct pages',()=>{
      assert.equal(first.data.length,3);assert.equal(second.data.length,3);
      assert.deepEqual(first.meta,{total:7,page:1,limit:3,totalPages:3});
      assert.equal(new Set([...first.data,...second.data].map(x=>x.id)).size,6);
    });
    const asc=await req('GET',listPath+'&sortBy=price&order=ASC');
    check('Numeric sorting: price ASC',()=>assert.deepEqual(asc.data.map(x=>x.price),['100.25','110.25','120.25','130.25','140.25','150.25','160.25']));
    const search=await req('GET','/clothes?search='+encodeURIComponent(`${marker.toLowerCase()} одяг 3`));
    check('Case-insensitive title search (ILike)',()=>assert.equal(search.meta.total,1));
    const escaped = await req('GET', '/clothes?search='+encodeURIComponent(marker+'%'));
    check('Search treats SQL wildcard characters literally',()=>assert.equal(escaped.meta.total,0));
    const updated=await req('PATCH',`/clothes/${ids[0]}`,{price:999.99,color:'Чорний'});
    check('Update and audit timestamps',()=>{assert.equal(updated.price,'999.99');assert.equal(updated.color,'Чорний');assert.ok(new Date(updated.updatedAt)>=new Date(updated.createdAt));});
    const missing=randomUUID();
    await req('GET',`/clothes/${missing}`,undefined,404);
    await req('PATCH',`/clothes/${missing}`,{price:1},404);
    await req('DELETE',`/clothes/${missing}`,undefined,404);
    await req('PATCH',`/clothes/${missing}/restore`,undefined,404);
    checks.push({name:'Unknown UUID: GET/PATCH/DELETE/restore return 404',result:'PASS'});
    for(const path of ['/clothes/invalid','/clothes?page=0','/clothes?page=1.5','/clothes?limit=101','/clothes?sortBy=password','/clothes?order=DROP','/clothes?extra=1']) await req('GET',path,undefined,400);
    const body={title:'Одяг',price:100,size:'M',material:'Бавовна',color:'Білий'};
    for(const bad of [{...body,price:'100'},{...body,price:100000000},{...body,price:1.234},{...body,title:' '},{...body,title:'x'.repeat(151)},{...body,material:'x'.repeat(81)},{...body,color:'x'.repeat(51)},{...body,size:'XXL'},{...body,extra:true}]) await req('POST','/clothes',bad,400);
    checks.push({name:'Validation: query bounds, UUID, field limits, enum, price, whitespace and unknown fields',result:'PASS'});
    await req('DELETE',`/clothes/${ids[0]}`,undefined,204);
    await req('GET',`/clothes/${ids[0]}`,undefined,404);
    await req('DELETE',`/clothes/${ids[0]}`,undefined,404);
    const hidden=await req('GET',listPath);
    const physical=(await db.query('SELECT "deletedAt" FROM clothes WHERE id=$1',[ids[0]])).rows;
    check('Soft delete hides row but physically preserves timestamp',()=>{assert.equal(hidden.meta.total,6);assert.equal(physical.length,1);assert.ok(physical[0].deletedAt);});
    await stop(); await start();
    await req('GET',`/clothes/${ids[0]}`,undefined,404);
    const persisted=await req('GET',`/clothes/${ids[1]}`);
    check('Full NestJS process restart preserves rows and soft deletion',()=>{assert.equal(persisted.id,ids[1]);assert.equal(persisted.price,'110.25');});
    await req('PATCH',`/clothes/${ids[0]}/restore`);
    const restored=await req('GET',`/clothes/${ids[0]}`);
    check('Restore returns saved updates and clears deletedAt',()=>{assert.equal(restored.deletedAt,null);assert.equal(restored.price,'999.99');});
    await req('PATCH',`/clothes/${ids[0]}/restore`,undefined,404);
    await req('POST','/orders',{productId:ids[1],quantity:2,customerEmail:'student@example.com'},201);
    await req('DELETE',`/clothes/${ids[1]}`,undefined,204);
    await req('POST','/orders',{productId:ids[1],quantity:1,customerEmail:'student@example.com'},404);
    await req('PATCH',`/clothes/${ids[1]}/restore`);
    checks.push({name:'Previous orders integration awaits repository and rejects deleted products',result:'PASS'});
    const version=(await db.query('SELECT version()')).rows[0].version;
    const evidence={timestamp:new Date().toISOString(),database:version,marker,checks,schema:cols,transcript};
    fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/results.json',JSON.stringify(evidence,null,2));
    console.log(`${checks.length} scenario groups passed; ${transcript.length} HTTP requests; ${version}`);
  } finally {
    await stop(); fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/server.log',log);
    await db.end();
  }
});

import { authed, json } from '../_lib.js';
const EMPTY = { overrides:{}, deleted:[] };
const ID = /^[\w-]{1,40}$/;
const s = (v,n) => String(v ?? '').replace(/[<>]/g,'').slice(0,n);

export async function onRequestGet({ env }){
  if(!env.STORE) return json(EMPTY);
  return json(await env.STORE.get('data','json') || EMPTY);
}
export async function onRequestPut({ request, env }){
  if(!authed(request, env)) return json({ error:'unauthorized' }, 401);
  if(!env.STORE) return json({ error:'KV binding STORE is missing' }, 500);
  let b; try{ b = await request.json(); }catch(e){ return json({ error:'bad json' }, 400); }
  const overrides = {};
  for(const [id,p] of Object.entries(b.overrides || {})){
    if(!ID.test(id)) continue;
    const img = s(p.img, 300);
    overrides[id] = {
      id, name:s(p.name,120), category:s(p.category,60), group:s(p.group,30),
      price:Math.max(0, Math.round(+p.price || 0)),
      rating:Math.min(5, Math.max(0, +p.rating || 4.5)),
      material:s(p.material,60), color:s(p.color,60), desc:s(p.desc,600),
      img:(img.startsWith('/api/img/') || img.startsWith('https://')) ? img : ''
    };
  }
  const deleted = (b.deleted || []).filter(x => ID.test(x));
  await env.STORE.put('data', JSON.stringify({ overrides, deleted }));
  return json({ ok:true });
}

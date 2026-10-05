import { authed, json } from '../_lib.js';
export async function onRequestPost({ request, env }){
  if(!authed(request, env)) return json({ error:'unauthorized' }, 401);
  if(!env.STORE) return json({ error:'KV binding STORE is missing' }, 500);
  const type = request.headers.get('content-type') || '';
  if(!/^image\/(jpeg|png|webp)$/.test(type)) return json({ error:'only jpg/png/webp' }, 400);
  const buf = await request.arrayBuffer();
  if(buf.byteLength > 3*1024*1024) return json({ error:'image too big (max 3MB)' }, 400);
  const id = crypto.randomUUID();
  await env.STORE.put('img:'+id, buf, { metadata:{ type } });
  return json({ url:'/api/img/'+id });
}

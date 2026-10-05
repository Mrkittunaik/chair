import { authed, json } from '../_lib.js';
export async function onRequestGet({ request, env }){
  return authed(request, env) ? json({ ok:true }) : json({ error:'unauthorized' }, 401);
}

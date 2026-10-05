export function authed(request, env){
  const pin = request.headers.get('x-admin-pin') || '';
  const real = env.ADMIN_PIN || '';
  if(!real || pin.length !== real.length) return false;
  let d = 0;
  for(let i=0;i<pin.length;i++) d |= pin.charCodeAt(i) ^ real.charCodeAt(i);
  return d === 0;
}
export const json = (o, s=200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type':'application/json', 'cache-control':'no-store' }
});

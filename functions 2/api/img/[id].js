export async function onRequestGet({ params, env }){
  if(!env.STORE || !/^[\w-]{10,60}$/.test(params.id)) return new Response('not found', { status:404 });
  const { value, metadata } = await env.STORE.getWithMetadata('img:'+params.id, 'arrayBuffer');
  if(!value) return new Response('not found', { status:404 });
  return new Response(value, { headers:{
    'content-type': (metadata && metadata.type) || 'image/jpeg',
    'cache-control': 'public, max-age=31536000, immutable'
  }});
}

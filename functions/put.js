export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.arrayBuffer();

  if (body.byteLength > 3 * 1024 * 1024) {
    return json({ ok: false, msg: "地图太大，超过 3MB" }, 413);
  }

  const code = randomCode(6);
  await env.MAP_STORE.put(code, body, {
    expirationTtl: 90 * 24 * 60 * 60,
  });

  return json({ ok: true, code }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

function randomCode(len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

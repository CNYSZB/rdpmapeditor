export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return json({ ok: false, msg: "缺少 code 参数" }, 400);

  const data = await env.MAP_STORE.get(code.toUpperCase(), "arrayBuffer");
  if (!data) return json({ ok: false, msg: "分享码不存在或已过期" }, 404);

  return new Response(data, {
    headers: { ...corsHeaders(), "Content-Type": "application/octet-stream" },
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
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
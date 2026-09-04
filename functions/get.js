// 凭分享码取地图数据
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({
      ok: false,
      msg: "缺少 code 参数"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const data = await env.MAP_STORE.get(code.toUpperCase(), "arrayBuffer");

  if (!data) {
    return new Response(JSON.stringify({
      ok: false,
      msg: "分享码不存在或已过期"
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
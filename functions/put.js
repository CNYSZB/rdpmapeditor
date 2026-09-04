console.log("put.js 被调用了");

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.arrayBuffer();

    if (body.byteLength > 3 * 1024 * 1024) {
      return new Response(JSON.stringify({
        ok: false,
        msg: "地图太大，超过 3MB"
      }), {
        status: 413,
        headers: { "Content-Type": "application/json" }
      });
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    await env.MAP_STORE.put(code, body, {
      expirationTtl: 60 * 60 * 24 * 30
    });

    return new Response(JSON.stringify({
      ok: true,
      code: code
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      msg: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
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
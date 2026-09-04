// 上传地图数据 → 生成分享码
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.arrayBuffer();

    // 限制 3MB
    if (body.byteLength > 3 * 1024 * 1024) {
      return new Response(JSON.stringify({
        ok: false,
        msg: "地图太大，超过 3MB"
      }), {
        status: 413,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 生成 6 位分享码
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // 存入 KV，30 天过期
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

// 处理 OPTIONS 预检请求（CORS）
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
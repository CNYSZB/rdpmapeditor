// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// 主请求处理
export async function onRequest(context) {
  const { request, env } = context;

  // 不是 POST 请求 → 返回提示
  if (request.method !== "POST") {
    return new Response(JSON.stringify({
      ok: false,
      msg: "❌ 这个接口只接受 POST 请求",
      hint: "请使用 POST 方法上传地图数据"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 是 POST 请求，执行正常逻辑
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
      msg: err.message || "服务器内部错误"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
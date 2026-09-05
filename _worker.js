export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理跨域预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // POST /put - 上传地图数据
    if (path === '/put' && request.method === 'POST') {
      try {
        const body = await request.arrayBuffer();
        if (body.byteLength > 3 * 1024 * 1024) {
          return new Response(JSON.stringify({ ok: false, msg: '地图太大，超过 3MB' }), {
            status: 413,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // ========== 唯一码生成（6位，带冲突检测） ==========
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        let existing = null;
        let attempts = 0;
        const maxAttempts = 20;

        do {
          code = '';
          for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
          }
          // 检查这个码是否已经被占用
          existing = await env.MAP_STORE.get(code);
          attempts++;
        } while (existing !== null && attempts < maxAttempts);

        // 如果尝试了20次还没生成唯一码，返回错误
        if (existing !== null) {
          return new Response(JSON.stringify({ ok: false, msg: '生成分享码失败，请重试' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        // ================================================

        await env.MAP_STORE.put(code, body, { expirationTtl: 60 * 60 * 24 * 30 });
        return new Response(JSON.stringify({ ok: true, code }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, msg: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET /get - 下载地图数据
    if (path === '/get' && request.method === 'GET') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response(JSON.stringify({ ok: false, msg: '缺少 code 参数' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      const data = await env.MAP_STORE.get(code.toUpperCase(), 'arrayBuffer');
      if (!data) {
        return new Response(JSON.stringify({ ok: false, msg: '分享码不存在或已过期' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      return new Response(data, {
        headers: { 'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 其他请求返回 404
    return new Response('Not Found', { status: 404 });
  }
};
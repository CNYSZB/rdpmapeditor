export async function onRequestPost() {
  return new Response("Hello from /put! Your function is working.", {
    headers: { "Content-Type": "text/plain" }
  });
}

export async function onRequestGet() {
  return new Response("GET request received. Use POST to upload.", {
    headers: { "Content-Type": "text/plain" }
  });
}
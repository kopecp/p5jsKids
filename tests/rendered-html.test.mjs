import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the mathematical garden", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pl">/i);
  assert.match(html, /Matematyczny ogród/);
  assert.match(html, /Zakręć/);
  assert.match(html, /Twoje pokrętła/);
  assert.match(html, /Mandelbrot/);
  assert.match(html, /Sierpiński/);
  assert.match(html, /Fibonacci/);
  assert.match(html, /Orbity 3D/);
  assert.match(html, /Liczby pierwsze/);
  assert.match(html, /Piękne wzory/);
  assert.match(html, /Möbius Drive/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

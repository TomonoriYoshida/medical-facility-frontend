// Serves the static export (out/) the way GitHub Pages does: /about/ is
// about/index.html, /about redirects to /about/, and unknown paths get
// 404.html. No dependency, so that the end-to-end tests need nothing more.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../out/", import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

function send(response, status, file) {
  response.writeHead(status, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  const { pathname, search } = new URL(request.url ?? "/", "http://localhost");
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // A malformed escape ("%E0") must not bring the server down mid-run.
    response.writeHead(400).end();
    return;
  }
  const path = join(root, normalize(decoded).replace(/^(\.\.[/\\])+/, ""));

  if (existsSync(path) && statSync(path).isDirectory()) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${pathname}/${search}` });
      response.end();
      return;
    }
    if (existsSync(join(path, "index.html"))) {
      send(response, 200, join(path, "index.html"));
      return;
    }
  } else if (existsSync(path)) {
    send(response, 200, path);
    return;
  }

  send(response, 404, join(root, "404.html"));
}).listen(port, "127.0.0.1", () => console.log(`Serving out/ on http://127.0.0.1:${port}`));

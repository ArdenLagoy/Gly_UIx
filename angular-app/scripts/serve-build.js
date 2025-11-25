/* Minimal static server using built-in http/fs modules.
   Usage: node scripts/serve-build.js [port]
*/

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = parseInt(process.argv[2], 10) || 4200;
const host = '127.0.0.1';
const distPath = path.join(__dirname, '..', 'dist', 'angular-app');

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Server error');
      return;
    }
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.end(data);
  });
}

const mime = (p) => {
  if (p.endsWith('.html')) return 'text/html; charset=utf-8';
  if (p.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (p.endsWith('.css')) return 'text/css; charset=utf-8';
  if (p.endsWith('.json')) return 'application/json; charset=utf-8';
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
  if (p.endsWith('.svg')) return 'image/svg+xml';
  if (p.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/');
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(distPath, pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath, mime(filePath));
      return;
    }
    // fallback to index.html for SPA routes
    const index = path.join(distPath, 'index.html');
    fs.stat(index, (ie, ist) => {
      if (!ie && ist.isFile()) {
        sendFile(res, index, 'text/html; charset=utf-8');
      } else {
        res.statusCode = 404; res.end('Not found');
      }
    });
  });
});

server.listen(port, host, () => {
  console.log(`Static server running at http://${host}:${port}/`);
});

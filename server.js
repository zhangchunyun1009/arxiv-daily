const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

function proxyArxiv(query, res) {
    const arxivUrl = `https://export.arxiv.org/api/query?${query}`;
    https.get(arxivUrl, (arxivRes) => {
        let data = '';
        arxivRes.on('data', chunk => data += chunk);
        arxivRes.on('end', () => {
            res.writeHead(200, {
                'Content-Type': 'application/xml; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
    }).on('error', (e) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Arxiv API request failed: ' + e.message);
    });
}

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);

    // API proxy
    if (parsed.pathname === '/api/arxiv') {
        const query = parsed.search ? parsed.search.slice(1) : '';
        proxyArxiv(query, res);
        return;
    }

    // Static files
    let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    filePath = path.join(__dirname, 'public', filePath);
    const ext = path.extname(filePath);
    const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(content);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Arxiv 论文速递服务已启动: http://localhost:${PORT}`);
    console.log(`局域网访问: http://<你的IP>:${PORT}`);
});

const https = require('https');

module.exports = (req, res) => {
    const query = req.url.split('?').slice(1).join('?');
    const arxivUrl = `https://export.arxiv.org/api/query?${query}`;

    https.get(arxivUrl, (arxivRes) => {
        let data = '';
        arxivRes.on('data', chunk => data += chunk);
        arxivRes.on('end', () => {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(200).send(data);
        });
    }).on('error', (e) => {
        res.status(502).send('Arxiv API request failed: ' + e.message);
    });
};

const http = require('http');
const https = require('https');
const { parse } = require('url');

// Function to fetch HTML content from a URL
function fetchHTML(url, callback) {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            callback(null, data);
        });
    }).on('error', (error) => {
        callback(error, null);
    });
}

// Function to extract latest stories from Time.com
function extractStories(html) {
    const stories = [];
    const regex = /<a class="title" href="([^"]+)">([^<]+)<\/a>/g;
    let match;
    while (match = regex.exec(html)) {
        stories.push({
            title: match[2],
            link: match[1]
        });
    }
    return stories.slice(0, 6); // Get the latest 6 stories
}

// HTTP server to serve the API
const server = http.createServer((req, res) => {
    const { pathname } = parse(req.url);
    if (pathname === '/getTimeStories') {
        const url = 'https://time.com';
        fetchHTML(url, (error, html) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                const stories = extractStories(html);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stories));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

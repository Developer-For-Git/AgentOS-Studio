const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8000;
const API_KEY = process.env.OPENCODE_API_KEY || "";
const TARGET_HOST = "opencode.ai";

if (!API_KEY) {
    console.warn("[OpenCode Bridge] Warning: OPENCODE_API_KEY environment variable is not set. Requests may fail authentication.");
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Models endpoint
    if (req.url.startsWith('/v1/models') || req.url === '/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            object: "list",
            data: [
                { id: process.env.MODEL_NAME || "free-model", object: "model", owned_by: "provider" },
                { id: "claude-3-7-sonnet", object: "model", owned_by: "anthropic" },
                { id: "claude-3-5-sonnet", object: "model", owned_by: "anthropic" },
                { id: "gpt-4o", object: "model", owned_by: "openai" }
            ]
        }));
        return;
    }

    // Anthropic Messages endpoint (for Claude Code, Antigravity CLI, Claude SDK)
    if (req.url.includes('/messages')) {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));
        req.on('end', () => {
            let bodyStr = Buffer.concat(bodyChunks).toString();
            try {
                let parsed = JSON.parse(bodyStr);
                // Map to configured model if specified
                if (process.env.MODEL_NAME) {
                    parsed.model = process.env.MODEL_NAME;
                }
                bodyStr = JSON.stringify(parsed);
            } catch (e) {}

            const forwardHeaders = {
                'x-api-key': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'OpenCode/1.18.32',
                'x-opencode-client': 'cli',
                'anthropic-version': req.headers['anthropic-version'] || '2023-06-01',
                'Content-Length': Buffer.byteLength(bodyStr)
            };

            const options = {
                hostname: TARGET_HOST,
                port: 443,
                path: '/inference/anthropic/v1/messages',
                method: 'POST',
                headers: forwardHeaders
            };

            const proxyReq = https.request(options, proxyRes => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            });

            proxyReq.on('error', err => {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: { message: err.message } }));
            });

            proxyReq.write(bodyStr);
            proxyReq.end();
        });
        return;
    }

    // OpenAI Chat completions endpoint (for Aider, Cursor, VS Code, OpenAI SDK)
    if (req.url.includes('/chat/completions')) {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));
        req.on('end', () => {
            let bodyStr = Buffer.concat(bodyChunks).toString();
            try {
                let parsed = JSON.parse(bodyStr);
                if (process.env.MODEL_NAME) {
                    parsed.model = process.env.MODEL_NAME;
                }
                bodyStr = JSON.stringify(parsed);
            } catch (e) {}

            const forwardHeaders = {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'OpenCode/1.18.32',
                'x-opencode-client': 'cli',
                'Content-Length': Buffer.byteLength(bodyStr)
            };

            const options = {
                hostname: TARGET_HOST,
                port: 443,
                path: '/inference/openai/v1/chat/completions',
                method: 'POST',
                headers: forwardHeaders
            };

            const proxyReq = https.request(options, proxyRes => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            });

            proxyReq.on('error', err => {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: { message: err.message } }));
            });

            proxyReq.write(bodyStr);
            proxyReq.end();
        });
        return;
    }

    // Fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpenCode Bridge] Active on http://127.0.0.1:${PORT}`);
    console.log(`[OpenCode Bridge] Supporting Anthropic /messages & OpenAI /chat/completions`);
});

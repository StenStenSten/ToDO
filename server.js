const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.static(path.join(__dirname)));

app.use('/api', createProxyMiddleware({
    target: 'http://demo2.z-bit.ee',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', 
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Origin', 'http://demo2.z-bit.ee');
    },
    onError(err, req, res) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Something went wrong with the proxy.');
    }
}));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3131;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => res.json({ status: 'MIE Proxy Active' }));

app.post('/v1/messages', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API key' });
    }

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`MIE Proxy Server running on http://localhost:${PORT}`);
});

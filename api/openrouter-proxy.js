// api/openrouter-proxy.js

const fetch = require('node-fetch'); // Vercel has node-fetch built-in for serverless functions

module.exports = async (req, res) => {
    // Allow CORS for requests from your GitHub Pages domain
    // Replace 'https://your-github-username.github.io' with your actual GitHub Pages URL
    // Or use '*' for development, but specify your domain for production.
    res.setHeader('Access-Control-Allow-Origin', 'https://cristianlara.me');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed. Only POST requests are supported.' });
        return;
    }

    try {
        const { prompt, model } = req.body; // Expecting prompt and model from the client
        if (!prompt || !model) {
            res.status(400).json({ error: 'Missing prompt or model in request body.' });
            return;
        }

        const openRouterApiKey = process.env.OPENROUTER_API_KEY;

        if (!openRouterApiKey) {
            console.error('OPENROUTER_API_KEY is not set in Vercel environment variables.');
            res.status(500).json({ error: 'Server configuration error: API key not found.' });
            return;
        }

        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": model, // Use the model passed from the frontend
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.json();
            console.error('OpenRouter API error:', openRouterResponse.status, errorData);
            res.status(openRouterResponse.status).json({ error: 'Error from OpenRouter API', details: errorData });
            return;
        }

        const data = await openRouterResponse.json();
        res.status(200).json(data); // Send the OpenRouter response back to the client

    } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

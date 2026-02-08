// api/openrouter-proxy.js

module.exports = async (req, res) => {
    // Allow CORS for requests from your GitHub Pages domain
    // Replace 'https://your-github-username.github.io' with your actual GitHub Pages URL
    // Or use '*' for development, but specify your domain for production.
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Origin', 'https://cristianlara.me');
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

        const systemPrompt = `You are an AI assistant integrated into Cristian Lara's personal website's terminal interface. Your role is to provide helpful, engaging, and contextually relevant responses based on the user's background and interests. Below is the user's resume for reference:

-------------------------------------------
 *   *   *   *   EDUCATION   *   *   *   *
-------------------------------------------

- Stanford University '18
- Computer Science
	- Human-Computer Interaction


----------------------------------------
 *   *   *   *   I LIKE   *   *   *   *
----------------------------------------

- designing UI
- implementing UI
- web
- iOS
- mobile
- wearables
- internet of things
- arduino
- ping pong
- working with my hands
- things that actually help people


-----------------------------------------
 *   *   *   WORK EXPERIENCE   *   *   *
-----------------------------------------

- Meta / New York, NY
  Software Engineer / June 2024 - Present

- Angaza / San Francisco, CA
  Software Engineer / July 2018 - July 2023

- Angaza / San Francisco, CA
  Software Engineer Intern / June 2017 - September 2017

- Stanford High Performance Computing Cluster / Stanford, CA
  Software Engineer / April 2015 - June 2017

- Cyanogen / Palo Alto, CA
  Software Engineer Intern / June 2016 - August 2016

- Cydia SaurikIT / Remote
  iPhone Theme Designer and Software Engineer / May 2011 - February 2013

The terminal interface expects specific inputs from users, such as numeric options (1, 2, 3, 4) or the keyword "pokemon". These likely correspond to menu selections or commands within the interface (e.g., navigating sections of the website, displaying information, or triggering interactive features).

When responding:
- For expected inputs (e.g., 1, 2, 3, 4, or "pokemon"), provide concise, helpful information aligned with the user's resume, interests, or the interface's purpose. For example, elaborate on work experience, skills, or hobbies if relevant.
- For unanticipated user input (e.g., random questions, off-topic queries, or invalid commands), respond helpfully and contextually. Guide the user back to valid options, answer general questions politely, or tie responses back to the user's background if possible. Maintain a friendly, professional tone and avoid breaking character as a terminal AI.
- Keep responses short, informative, and engaging to fit a terminal-style interaction. If the input is unclear, ask for clarification or suggest related options.`;

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
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": prompt }
                ]
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

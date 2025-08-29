const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PIAPI_BASE = 'https://api.piapi.ai/api/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const LYRIA_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const PORT = process.env.PORT || 4000;
const PIAPI_API_KEY = process.env.PIAPI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const LYRIA_API_KEY = process.env.LYRIA_API_KEY || '';

function buildAuthHeaders() {
	const headers = { 'Content-Type': 'application/json' };
	if (PIAPI_API_KEY) {
		// Adjust header name if your PiAPI account uses x-api-key instead of Bearer
		headers['Authorization'] = `Bearer ${PIAPI_API_KEY}`;
		// headers['x-api-key'] = PIAPI_API_KEY;
	}
	return headers;
}

function buildGeminiHeaders() {
	return {
		'Content-Type': 'application/json',
		'X-goog-api-key': GEMINI_API_KEY
	};
}

function buildLyriaHeaders() {
	return {
		'Content-Type': 'application/json',
		'X-goog-api-key': LYRIA_API_KEY
	};
}

// Create Task (Song)
app.post('/api/piapi/tasks', async (req, res) => {
	try {
		const payload = req.body;
		const { data } = await axios.post(`${PIAPI_BASE}/task`, payload, {
			headers: buildAuthHeaders(),
			timeout: 60000,
		});
		res.json(data);
	} catch (e) {
		res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
	}
});

// Get Task (polling)
app.get('/api/piapi/tasks/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { data } = await axios.get(`${PIAPI_BASE}/task/${id}`, {
			headers: buildAuthHeaders(),
			timeout: 30000,
		});
		res.json(data);
	} catch (e) {
		res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
	}
});

// Lyria RealTime - Connect Session
app.post('/api/lyria/connect', async (req, res) => {
	try {
		const { prompt, bpm, temperature } = req.body;
		
		if (!LYRIA_API_KEY) {
			return res.status(500).json({ error: 'Lyria API key not configured' });
		}

		// Initialize Lyria RealTime session
		const sessionConfig = {
			model: 'models/lyria-realtime-exp',
			callbacks: {
				onMessage: (message) => {
					console.log('Lyria message:', message);
				},
				onError: (error) => {
					console.error('Lyria error:', error);
				},
				onClose: () => {
					console.log('Lyria session closed');
				}
			}
		};

		// Set initial prompts and config
		const sessionData = {
			weightedPrompts: [{ text: prompt || 'minimal techno', weight: 1.0 }],
			musicGenerationConfig: { 
				bpm: bpm || 90, 
				temperature: temperature || 1.0 
			}
		};

		// For now, return a mock session ID
		// In a real implementation, you'd establish the WebSocket connection
		const sessionId = `lyria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		res.json({ 
			session: sessionId,
			status: 'connected',
			config: sessionData
		});
	} catch (e) {
		console.error('Lyria connection error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

// Lyria RealTime - Update Prompt
app.post('/api/lyria/update-prompt', async (req, res) => {
	try {
		const { sessionId, prompt } = req.body;
		
		if (!LYRIA_API_KEY) {
			return res.status(500).json({ error: 'Lyria API key not configured' });
		}

		// Update the session with new prompts
		const updateData = {
			weightedPrompts: [{ text: prompt, weight: 1.0 }]
		};

		// In a real implementation, you'd send this to the active session
		console.log(`Updating session ${sessionId} with prompt: ${prompt}`);
		
		res.json({ 
			status: 'updated',
			sessionId,
			newPrompt: prompt
		});
	} catch (e) {
		console.error('Lyria update error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

// Lyria RealTime - Stop Session
app.post('/api/lyria/stop', async (req, res) => {
	try {
		const { sessionId } = req.body;
		
		// In a real implementation, you'd close the WebSocket connection
		console.log(`Stopping session ${sessionId}`);
		
		res.json({ 
			status: 'stopped',
			sessionId
		});
	} catch (e) {
		console.error('Lyria stop error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

// Gemini API - Generate Content
app.post('/api/gemini/generate', async (req, res) => {
	try {
		const { prompt, model = 'gemini-2.0-flash' } = req.body;
		
		if (!prompt) {
			return res.status(400).json({ error: 'Prompt is required' });
		}

		if (!GEMINI_API_KEY) {
			return res.status(500).json({ error: 'Gemini API key not configured' });
		}

		const payload = {
			contents: [
				{
					parts: [
						{
							text: prompt
						}
					]
				}
			]
		};

		const { data } = await axios.post(
			`${GEMINI_BASE}/models/${model}:generateContent`,
			payload,
			{
				headers: buildGeminiHeaders(),
				timeout: 30000,
			}
		);

		res.json(data);
	} catch (e) {
		console.error('Gemini API error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

// Gemini API - Generate Music Description
app.post('/api/gemini/music-description', async (req, res) => {
	try {
		const { mood, genre, instruments, duration } = req.body;
		
		if (!GEMINI_API_KEY) {
			return res.status(500).json({ error: 'Gemini API key not configured' });
		}

		const prompt = `Generate a detailed music description for a ${duration || '3-minute'} ${genre || 'lo-fi'} track with a ${mood || 'calm'} mood. 
		${instruments ? `Include these instruments: ${instruments}.` : 'Include piano, soft drums, and ambient sounds.'}
		
		The description should be suitable for AI music generation and include:
		- Tempo and rhythm style
		- Key and chord progression suggestions
		- Instrument arrangement
		- Mood and atmosphere details
		- Any specific effects or production notes
		
		Keep it concise but detailed enough for music generation.`;

		const payload = {
			contents: [
				{
					parts: [
						{
							text: prompt
						}
					]
				}
			]
		};

		const { data } = await axios.post(
			`${GEMINI_BASE}/models/gemini-2.0-flash:generateContent`,
			payload,
			{
				headers: buildGeminiHeaders(),
				timeout: 30000,
			}
		);

		// Extract the generated text from the response
		const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'calm lofi study beats, soft piano, light vinyl crackle';
		
		res.json({ 
			description: generatedText,
			fullResponse: data 
		});
	} catch (e) {
		console.error('Gemini music description error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

// Gemini API - Generate Lyrics
app.post('/api/gemini/lyrics', async (req, res) => {
	try {
		const { theme, style, mood, length = 'short' } = req.body;
		
		if (!GEMINI_API_KEY) {
			return res.status(500).json({ error: 'Gemini API key not configured' });
		}

		const prompt = `Write ${length} lyrics for a song with the following characteristics:
		- Theme: ${theme || 'general'}
		- Style: ${style || 'pop'}
		- Mood: ${mood || 'upbeat'}
		
		The lyrics should be:
		- Suitable for singing
		- Have a clear structure (verse, chorus, etc.)
		- Match the specified mood and style
		- Be original and creative
		
		Format the response as clean lyrics with line breaks.`;

		const payload = {
			contents: [
				{
					parts: [
						{
							text: prompt
						}
					]
				}
			]
		};

		const { data } = await axios.post(
			`${GEMINI_BASE}/models/gemini-2.0-flash:generateContent`,
			payload,
			{
				headers: buildGeminiHeaders(),
				timeout: 30000,
			}
		);

		const generatedLyrics = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No lyrics generated';
		
		res.json({ 
			lyrics: generatedLyrics,
			fullResponse: data 
		});
	} catch (e) {
		console.error('Gemini lyrics error:', e.response?.data || e.message);
		res.status(e.response?.status || 500).json({ 
			error: e.message, 
			details: e.response?.data 
		});
	}
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`PiAPI proxy: /api/piapi/*`);
	console.log(`Gemini API: /api/gemini/*`);
	console.log(`Lyria RealTime: /api/lyria/*`);
});


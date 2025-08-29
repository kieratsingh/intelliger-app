# API Setup Guide

This guide will help you set up the necessary API keys for the music generation features.

## Required API Keys

### 1. PiAPI (for music generation)
- **Purpose**: Generate pre-recorded music tracks
- **Get it from**: [PiAPI.ai](https://piapi.ai)
- **Usage**: Used for the "Generate New Track" feature

### 2. Google Gemini API (for text generation)
- **Purpose**: Generate music descriptions and lyrics
- **Get it from**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Usage**: Used for generating detailed music descriptions and lyrics

### 3. Google Lyria RealTime API (for live music generation)
- **Purpose**: Real-time AI music generation
- **Get it from**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Usage**: Used for the "Lyria RealTime" live music generation feature

## Setup Instructions

### Step 1: Create Environment File
Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

### Step 2: Add Your API Keys
Add the following to your `.env` file:

```env
# API Keys
PIAPI_API_KEY=your_piapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
LYRIA_API_KEY=your_lyria_api_key_here

# Server Configuration
PORT=4000
```

### Step 3: Install Dependencies
Make sure all dependencies are installed:

```bash
# In the backend directory
npm install

# In the root directory
npm install
```

### Step 4: Start the Backend Server
```bash
cd backend
npm start
```

### Step 5: Start the Frontend
```bash
# In the root directory
npm start
```

## Features Available

### 🎵 PiAPI Music Generation
- Generate pre-recorded music tracks
- Customizable prompts and styles
- Download and save generated tracks

### 🤖 Gemini AI Integration
- Generate detailed music descriptions
- Create lyrics for songs
- AI-powered music prompts

### 🎼 Lyria RealTime
- Real-time AI music generation
- Live streaming music
- Adjustable BPM and creativity settings
- Dynamic prompt updates

## Testing the APIs

### Test PiAPI
1. Go to the "Generate" tab
2. Click "Generate New Track"
3. Wait for the generation to complete

### Test Gemini
1. The backend includes endpoints for:
   - `/api/gemini/generate` - General text generation
   - `/api/gemini/music-description` - Music descriptions
   - `/api/gemini/lyrics` - Song lyrics

### Test Lyria RealTime
1. Go to the "Generate" tab
2. Click "Start Lyria RealTime"
3. Configure your music settings
4. Start live generation

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Make sure your `.env` file is in the `backend` directory
   - Check that the API key names match exactly
   - Restart the backend server after adding keys

2. **"Failed to connect" errors**
   - Verify your API keys are valid
   - Check your internet connection
   - Ensure the backend server is running

3. **CORS errors**
   - The backend includes CORS configuration
   - Make sure you're accessing from the correct URL

### Getting Help

- Check the console logs in both frontend and backend
- Verify API key permissions and quotas
- Test API endpoints directly using tools like Postman

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use different API keys for development and production
- Monitor your API usage to avoid unexpected charges

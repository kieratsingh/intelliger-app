// Example configuration file
// Copy this to .env and fill in your actual API keys

module.exports = {
  // PiAPI for music generation
  PIAPI_API_KEY: 'your_piapi_key_here',
  
  // Google Gemini API for text generation
  GEMINI_API_KEY: 'your_gemini_api_key_here',
  
  // Google Lyria RealTime API for live music generation
  LYRIA_API_KEY: 'your_lyria_api_key_here',
  
  // Server configuration
  PORT: 4000
};

// To use this:
// 1. Create a .env file in the backend directory
// 2. Add your API keys like this:
//    PIAPI_API_KEY=your_actual_piapi_key
//    GEMINI_API_KEY=your_actual_gemini_key
//    LYRIA_API_KEY=your_actual_lyria_key
//    PORT=4000

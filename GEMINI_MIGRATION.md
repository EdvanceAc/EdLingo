# Gemini API Migration Guide

This document outlines the migration from OpenRouter to Google Gemini API and Vertex AI for the EdLingo language learning application.

## Overview

We have successfully migrated from OpenRouter to Google's Gemini API with optional Vertex AI support. This provides:

- **Better Performance**: Direct integration with Google's latest AI models
- **Cost Efficiency**: Competitive pricing with Google's AI services
- **Advanced Features**: Access to Gemini's multimodal capabilities
- **Enterprise Option**: Vertex AI for production deployments

## Configuration

### 1. Gemini API (Recommended for Development)

Add to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

**Getting your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 2. Vertex AI (Optional - for Production)

Add to your `.env` file:
```env
GOOGLE_CLOUD_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=us-central1
```

**Setting up Vertex AI:**
1. Create a Google Cloud Project
2. Enable the Vertex AI API
3. Install Google Cloud CLI
4. Run: `gcloud auth application-default login`

## Testing Your Setup

Run the test script to verify your configuration:

```bash
npm run test-gemini
```

This will:
- Test your API key configuration
- Verify connectivity to Gemini API
- Test language learning specific prompts
- Check Vertex AI setup (if configured)

## Changes Made

### Files Modified:

1. **`.env`** - Updated API configuration
2. **`src/main/geminiService.js`** - New service for Gemini integration
3. **`src/main/main.js`** - Updated IPC handlers to use Gemini
4. **`src/renderer/services/aiService.js`** - Updated console messages
5. **`src/renderer/pages/Settings.jsx`** - Updated UI options and instructions
6. **`package.json`** - Added test script

### Files Added:

1. **`test-gemini.js`** - Test script for API verification
2. **`GEMINI_MIGRATION.md`** - This documentation

### Files Removed:

1. **`test-openrouter.js`** - No longer needed

## Available Models

### Gemini API Models:
- `gemini-1.5-flash` (Default) - Fast and efficient
- `gemini-1.5-pro` - More capable, higher cost
- `gemini-1.0-pro` - Legacy model

### Vertex AI Models:
- `gemini-1.5-flash-001`
- `gemini-1.5-pro-001`
- Custom fine-tuned models

## Features Supported

✅ **Text Generation** - Full conversation support
✅ **Language Learning** - Specialized prompts for education
✅ **Streaming Responses** - Real-time response generation
✅ **Error Handling** - Comprehensive error management
✅ **Fallback Mode** - Browser compatibility

## Troubleshooting

### Common Issues:

1. **API Key Invalid**
   - Verify your API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Ensure the key has proper permissions

2. **Quota Exceeded**
   - Check your usage at [Google AI Studio](https://aistudio.google.com/)
   - Consider upgrading your plan

3. **Vertex AI Authentication**
   - Run: `gcloud auth application-default login`
   - Verify your project ID is correct

4. **Network Issues**
   - Check your internet connection
   - Verify firewall settings

### Getting Help:

- Run `npm run test-gemini` for detailed diagnostics
- Check the console logs in the Electron app
- Review the error messages in the test output

## Migration Benefits

1. **Performance**: Gemini models are optimized for conversational AI
2. **Cost**: Competitive pricing with generous free tier
3. **Reliability**: Google's enterprise-grade infrastructure
4. **Features**: Access to latest AI capabilities
5. **Support**: Comprehensive documentation and community

## Next Steps

1. Test your configuration with `npm run test-gemini`
2. Start the application and test AI chat functionality
3. Monitor usage and performance
4. Consider Vertex AI for production deployments
5. Explore advanced Gemini features like multimodal inputs

---

*For more information, visit the [Gemini API documentation](https://ai.google.dev/docs) or [Vertex AI documentation](https://cloud.google.com/vertex-ai/docs).*
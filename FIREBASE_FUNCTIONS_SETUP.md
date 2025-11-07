# Firebase Cloud Functions Setup Guide

This guide explains how to set up Firebase Cloud Functions to securely handle OpenAI API calls, preventing API key exposure in the client-side code.

## Why Firebase Functions?

Previously, the OpenAI API key was exposed in the client-side React code using `REACT_APP_OPENAI_API_KEY`. This is a **security risk** because:
- Environment variables prefixed with `REACT_APP_` are bundled into the JavaScript
- Anyone can view the bundled code and extract the API key
- The API key can be misused, leading to unexpected charges

By using Firebase Cloud Functions:
- ✅ API key stays on the server (never exposed to clients)
- ✅ All API calls are authenticated (users must sign in)
- ✅ Better rate limiting and usage monitoring
- ✅ Centralized error handling

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project set up (already done)
3. Node.js 18 or higher
4. OpenAI API key

## Setup Steps

### 1. Install Firebase Functions Dependencies

```bash
cd functions
npm install
```

### 2. Configure OpenAI API Key in Firebase

**IMPORTANT:** The API key must be set in Firebase Functions config, NOT in `.env` files.

```bash
firebase functions:config:set openai.api_key="sk-your-openai-api-key-here"
```

Or if you're using the new Firebase Functions config format (Firebase CLI 10+):

```bash
# Set the environment variable directly
firebase functions:secrets:set OPENAI_API_KEY
# When prompted, paste your OpenAI API key
```

Then update `functions/index.js` to use:
```javascript
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

### 3. Deploy Functions

```bash
# From the project root
firebase deploy --only functions
```

### 4. Update Frontend Environment Variables

**Remove** `REACT_APP_OPENAI_API_KEY` from your `.env` file - it's no longer needed!

The frontend will now call Firebase Functions instead of OpenAI directly.

## Testing Locally

### Option 1: Firebase Emulators (Recommended)

```bash
# Install emulator suite
firebase init emulators

# Start emulators
firebase emulators:start
```

The functions will be available at `http://localhost:5001/your-project-id/us-central1/functionName`

### Option 2: Deploy to Firebase

Deploy the functions and test with the live deployment.

## Function Endpoints

Three Cloud Functions are available:

1. **`generateOutfit`** - Generates outfit descriptions using GPT-4
   - Input: `{ prompt: string }`
   - Output: `{ success: boolean, description: string }`

2. **`enhancePrompt`** - Enhances prompts using ChatGPT before image generation
   - Input: `{ prompt: string, outfitComponents?: object }`
   - Output: `{ success: boolean, enhancedPrompt: string }`

3. **`generateImage`** - Generates images using DALL-E 3
   - Input: `{ prompt: string, options?: { size?: string, quality?: string } }`
   - Output: `{ success: boolean, imageUrl: string }`

## Authentication

All functions require authentication. Users must be signed in to use these functions.

## Cost Considerations

- Firebase Functions: Pay per invocation (generous free tier)
- OpenAI API: Same costs as before, but now secure
- Network: Minimal additional latency (~100-200ms)

## Troubleshooting

### Function Not Found Error

If you see "Function not found" errors:
1. Make sure functions are deployed: `firebase deploy --only functions`
2. Check the function names match in `functions/index.js` and `src/services/openaiService.js`
3. Ensure Firebase project ID is correct in `firebase.json`

### Authentication Errors

If you see authentication errors:
1. Make sure users are signed in before calling functions
2. Check Firebase Authentication is enabled in Firebase Console
3. Verify the auth object is properly initialized in `firebase-config.js`

### API Key Errors

If you see "OpenAI API key is not configured":
1. Make sure you've set the config: `firebase functions:config:set openai.api_key="..."`
2. Redeploy functions after setting config: `firebase deploy --only functions`
3. Check the config in Firebase Console > Functions > Configuration

### CORS Errors

Firebase Cloud Functions handle CORS automatically. If you see CORS errors:
1. Make sure you're using `httpsCallable` from `firebase/functions`
2. Check that your Firebase project is correctly configured

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use Firebase Functions config** or secrets for API keys
3. **Enable authentication** on all functions (already done)
4. **Monitor usage** in Firebase Console
5. **Set up billing alerts** in OpenAI dashboard
6. **Rotate API keys** if they're ever exposed

## Migration Checklist

- [x] Created Firebase Functions (`functions/index.js`)
- [x] Updated frontend to use Firebase Functions (`src/services/openaiService.js`)
- [x] Removed API key from client-side code
- [x] Updated adapters to use Firebase Functions
- [ ] Set API key in Firebase Functions config
- [ ] Deployed functions to Firebase
- [ ] Removed `REACT_APP_OPENAI_API_KEY` from `.env`
- [ ] Tested outfit generation
- [ ] Tested image generation
- [ ] Updated deployment documentation

## Next Steps

1. Set the OpenAI API key in Firebase Functions config
2. Deploy the functions
3. Remove `REACT_APP_OPENAI_API_KEY` from environment variables
4. Test the application
5. Monitor usage in Firebase Console

## Support

If you encounter issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check browser console for errors
3. Verify authentication is working
4. Test functions individually using Firebase Console


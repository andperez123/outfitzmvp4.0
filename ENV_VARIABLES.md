# Environment Variables Reference

## ⚠️ IMPORTANT: API Key Security Update

**The OpenAI API key is NO LONGER stored in client-side environment variables.**

The API key is now securely stored in Firebase Cloud Functions. See `FIREBASE_FUNCTIONS_SETUP.md` for setup instructions.

## Required Variables (Client-Side)

### `REACT_APP_FIREBASE_API_KEY`
- **Description**: Firebase API key
- **Required**: Yes (for Firebase features)

### `REACT_APP_IMAGE_MODEL`
- **Description**: Image generation model to use
- **Required**: No
- **Default**: `gpt-image-latest`
- **Available Options**:
  - `gpt-image-latest` (default) - ChatGPT-enhanced image generation
  - `gpt-image-v1` - Same as latest
  - `chatgpt-image` - Alias for gpt-image-latest
  - `dall-e-3` - Legacy DALL-E 3 direct generation
  - `dalle-3` - Alias for dall-e-3

### `REACT_APP_FIREBASE_AUTH_DOMAIN`
- **Description**: Firebase authentication domain
- **Required**: Yes (for Firebase features)

### `REACT_APP_FIREBASE_PROJECT_ID`
- **Description**: Firebase project ID
- **Required**: Yes (for Firebase features)

### `REACT_APP_FIREBASE_STORAGE_BUCKET`
- **Description**: Firebase storage bucket
- **Required**: Yes (for Firebase features)

### `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- **Description**: Firebase messaging sender ID
- **Required**: Yes (for Firebase features)

### `REACT_APP_FIREBASE_APP_ID`
- **Description**: Firebase app ID
- **Required**: Yes (for Firebase features)

### `REACT_APP_FIREBASE_MEASUREMENT_ID`
- **Description**: Firebase Analytics measurement ID
- **Required**: No (optional, for analytics)

## Example .env File

```env
# ⚠️ NOTE: REACT_APP_OPENAI_API_KEY is NO LONGER NEEDED
# The API key is now stored securely in Firebase Cloud Functions
# See FIREBASE_FUNCTIONS_SETUP.md for setup instructions

# Image Generation Model (optional)
REACT_APP_IMAGE_MODEL=gpt-image-latest

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Firebase Functions Configuration

The OpenAI API key must be configured in Firebase Functions, not in the client `.env` file.

### Setting the API Key

```bash
# Using Firebase Functions config (older method)
firebase functions:config:set openai.api_key="sk-your-openai-api-key-here"

# Using Firebase Functions secrets (newer method, recommended)
firebase functions:secrets:set OPENAI_API_KEY
```

See `FIREBASE_FUNCTIONS_SETUP.md` for complete setup instructions.

## Notes

- ⚠️ **SECURITY**: All `REACT_APP_` prefixed variables are exposed to the browser
- ✅ **SOLUTION**: OpenAI API key is now stored in Firebase Cloud Functions (server-side)
- Never commit `.env` files to version control
- Never commit Firebase Functions config or secrets
- Use different API keys for development and production
- The `.env` file should be in the project root directory


# Outfitz MVP 4.0 - Local Development Setup

This guide will help you get the Outfitz project running locally for development and testing.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- Firebase project with authentication enabled
- OpenAI API key (for outfit generation)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
# Get these values from your Firebase project settings
# Go to: Firebase Console > Project Settings > General > Your apps
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=outfitz-dfd41.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=outfitz-dfd41
REACT_APP_FIREBASE_STORAGE_BUCKET=outfitz-dfd41.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# OpenAI API Configuration
# Get your API key from https://platform.openai.com/api-keys
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select or create your project
3. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Google" provider
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config values to your `.env` file

### 4. OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `REACT_APP_OPENAI_API_KEY`

## Running the Application

### Development Mode

```bash
npm start
```

This will start the development server at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── StyleGrid.js    # Main style selection component
│   ├── OutfitGenerator.js
│   ├── OutfitModal.js
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useOutfitGeneration.js
│   └── useProfile.js
├── services/           # Firebase services
├── utils/              # Utility functions
│   └── gptWrapper.js   # OpenAI API integration
└── firebase-config.js  # Firebase configuration
```

## Features

- **Style Selection**: Browse and select from various fashion styles
- **Outfit Generation**: Generate outfits using OpenAI GPT-4 and DALL-E
- **User Authentication**: Google Sign-in via Firebase
- **Saved Outfits**: Save and view your generated outfits

## Troubleshooting

### Firebase Authentication Not Working
- Ensure Google Sign-in is enabled in Firebase Console
- Check that your `.env` file has all required Firebase variables
- Verify the auth domain matches your Firebase project

### OpenAI API Errors
- Verify your API key is correct in `.env`
- Check your OpenAI account has available credits
- Ensure the API key has proper permissions

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```bash
PORT=3001 npm start
```

## Development Tips

- The app uses React 18 and Create React App
- Hot reloading is enabled in development mode
- Check the browser console for debug logs
- Firebase Analytics is optional (only initializes if measurementId is provided)

## Next Steps

Once the app is running, you can:
- Update the frontend components in `src/components/`
- Modify styling in CSS files
- Add new features and improve the UI/UX
- Test outfit generation with different styles

Happy coding! 🎨✨


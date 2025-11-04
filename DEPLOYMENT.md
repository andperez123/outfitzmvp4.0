# Deployment Guide - Outfitz MVP 4.0

This guide will help you deploy the Outfitz application to a live environment.

## Prerequisites

- GitHub repository pushed (✅ Done)
- Firebase project configured
- OpenAI API key ready
- Deployment platform account (Vercel, Netlify, or similar)

---

## Environment Variables Required

Your application needs these environment variables in your live deployment:

### Firebase Configuration
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=outfitz-dfd41.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=outfitz-dfd41
REACT_APP_FIREBASE_STORAGE_BUCKET=outfitz-dfd41.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### OpenAI Configuration
```
REACT_APP_OPENAI_API_KEY=sk-your_openai_api_key_here
```

**⚠️ Important:** Replace the OpenAI API key with your actual production key!

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Go to [Vercel](https://vercel.com/)**
   - Sign in with GitHub
   - Click "Add New Project"

2. **Import Repository**
   - Select `andperez123/outfitzmvp4.0`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Create React App**
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all Firebase variables (prefixed with `REACT_APP_`)
   - Add `REACT_APP_OPENAI_API_KEY` with your production key
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

**Vercel automatically:**
- Deploys on every push to main
- Provides HTTPS
- Handles CDN
- Auto-scaling

---

### Option 2: Netlify

1. **Go to [Netlify](https://www.netlify.com/)**
   - Sign in with GitHub
   - Click "Add new site" → "Import an existing project"

2. **Connect Repository**
   - Select `andperez123/outfitzmvp4.0`
   - Click "Connect"

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Click "Show advanced" → "New variable" to add env vars

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all Firebase and OpenAI variables
   - Make sure to add them for all contexts (Production, Deploy previews, Branch deploys)

5. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `your-project.netlify.app`

---

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `build`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No** (we'll build manually)

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Environment Variables**
   - Firebase Hosting doesn't support environment variables directly
   - You'll need to use Firebase Functions or a build-time script
   - Alternative: Use `.env.production` file (not recommended for secrets)

---

## Getting Your Environment Variables

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`outfitz-dfd41`)
3. Click the gear icon → **Project Settings**
4. Scroll to "Your apps" section
5. Click on your web app (or create one)
6. Copy the config values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "outfitz-dfd41.firebaseapp.com",
     projectId: "outfitz-dfd41",
     storageBucket: "outfitz-dfd41.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)
6. **⚠️ Important:** Use a different key for production than development
7. Set usage limits and billing alerts in OpenAI dashboard

---

## Post-Deployment Checklist

- [ ] All environment variables are set in deployment platform
- [ ] Firebase Authentication is enabled (Google provider)
- [ ] Firebase Firestore rules are configured
- [ ] OpenAI API key is set with production key
- [ ] Test the app on the live URL
- [ ] Test Google Sign-in
- [ ] Test outfit generation
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (optional)
- [ ] Configure Firebase Hosting for custom domain (if using Firebase)

---

## Firebase Hosting Configuration

If using Firebase Hosting, create `firebase.json`:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Node.js version (should be 14+)
- Check build logs for specific errors

### Environment Variables Not Working
- Make sure all variables are prefixed with `REACT_APP_`
- Restart the build after adding variables
- Clear build cache if needed

### Firebase Auth Not Working
- Verify Google Sign-in is enabled in Firebase Console
- Check that auth domain matches your Firebase project
- Verify API keys are correct

### OpenAI API Errors
- Check API key is correct
- Verify you have credits in OpenAI account
- Check API usage limits

---

## Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different API keys** for development and production
3. **Set up billing alerts** in OpenAI dashboard
4. **Configure Firebase Security Rules** for Firestore
5. **Enable Firebase App Check** for additional security (optional)

---

## Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to GitHub:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments

You can also configure custom domains in both platforms.

---

## Need Help?

- Check the [SETUP.md](./SETUP.md) for local development setup
- Review [FRONTEND_REVIEW.md](./FRONTEND_REVIEW.md) for codebase overview
- Firebase Docs: https://firebase.google.com/docs
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com


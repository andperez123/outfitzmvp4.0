# Firebase Deployment Guide - Quick Start

## Current Status
✅ Firebase config files created (`firebase.json`, `.firebaserc`)
✅ GitHub Actions workflow created (`.github/workflows/firebase-hosting.yml`)

## Option 1: Deploy via CLI (Fastest - Do This First)

### Step 1: Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser to authenticate.

### Step 3: Verify Project
```bash
firebase use outfitz-dfd41
```

### Step 4: Build and Deploy
```bash
# Install dependencies
npm ci

# Build (with environment variables from .env)
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Note:** For CLI deployment, make sure your `.env` file has all the variables. The build will use those.

Your site will be live at:
- `https://outfitz-dfd41.web.app`
- `https://outfitz-dfd41.firebaseapp.com`

---

## Option 2: Set Up GitHub Actions (Automatic Deployments)

### Step 1: Get Firebase Service Account Token

1. **Get Service Account JSON:**
   ```bash
   firebase login:ci
   ```
   This gives you a token, but for GitHub Actions, you need the service account JSON.

2. **Or get Service Account JSON from Firebase Console:**
   - Go to: https://console.firebase.google.com/project/outfitz-dfd41/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Download the JSON file

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repo: https://github.com/andperez123/outfitzmvp4.0
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Firebase Service Account:**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire contents of the service account JSON file

   **Environment Variables (for build):**
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`
   - `REACT_APP_FIREBASE_MEASUREMENT_ID`
   - `REACT_APP_OPENAI_API_KEY` (your production OpenAI key)

### Step 3: Push to Trigger Deployment

```bash
git add .
git commit -m "Add Firebase Hosting configuration"
git push origin main
```

The GitHub Action will automatically:
1. Build your app
2. Deploy to Firebase Hosting
3. Make it live on the `live` channel

### Step 4: Check Deployment Status

- Go to: https://github.com/andperez123/outfitzmvp4.0/actions
- You should see "Deploy to Firebase Hosting" workflow running
- Click on it to see the build logs

---

## Quick Deploy Right Now (CLI Method)

Run these commands in order:

```bash
# 1. Make sure you're in the project directory
cd /Volumes/AHARDRIVE/Apps/Projects/Outfitzv5.0

# 2. Install Firebase CLI (if needed)
npm install -g firebase-tools

# 3. Login (if not already)
firebase login

# 4. Set project
firebase use outfitz-dfd41

# 5. Build with your .env file
npm run build

# 6. Deploy
firebase deploy --only hosting
```

**Important:** Make sure your `.env` file has all the environment variables before building!

---

## Verify Deployment

After deployment, check:

1. **Firebase Console:**
   - https://console.firebase.google.com/project/outfitz-dfd41/hosting
   - You should see your deployment listed

2. **Live URLs:**
   - https://outfitz-dfd41.web.app
   - https://outfitz-dfd41.firebaseapp.com

3. **Test the app:**
   - Open the URL
   - Test Google Sign-in
   - Test outfit generation

---

## Troubleshooting

### "Project not found"
- Run: `firebase projects:list` to see available projects
- Run: `firebase use <project-id>` to set the correct project

### "Build fails"
- Make sure `.env` file exists with all variables
- Check that `npm run build` works locally first
- Verify all environment variables are set

### "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have access to the project in Firebase Console

### "No hosting site found"
- Go to Firebase Console → Hosting
- Click "Get started" to initialize hosting
- Then run `firebase deploy --only hosting` again

---

## Environment Variables Reminder

**For CLI deployment:** Use `.env` file (already set up locally)

**For GitHub Actions:** Add as secrets in GitHub repo settings

**Important:** Replace `REACT_APP_OPENAI_API_KEY` with your production OpenAI API key!


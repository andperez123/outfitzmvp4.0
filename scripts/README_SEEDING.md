# Curated Outfits Seeding Script

This guide explains how to seed your Firestore database with initial curated outfit data.

## Prerequisites

1. **Firebase Admin SDK Setup**
   - You need Firebase Admin credentials (service account key)
   - Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

2. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

## Setup Options

### Option 1: Service Account Key File (Recommended for Local)

1. Download your service account key JSON file from Firebase Console
2. Place it in a secure location (e.g., `scripts/serviceAccountKey.json`)
3. **Important**: Add `serviceAccountKey.json` to `.gitignore` to avoid committing credentials

4. Update `seedCuratedOutfits.js`:
   ```javascript
   const serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   ```

### Option 2: Environment Variable (Recommended for Production)

1. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./path/to/serviceAccountKey.json"
   ```

2. Update `seedCuratedOutfits.js`:
   ```javascript
   admin.initializeApp({
     credential: admin.credential.applicationDefault()
   });
   ```

## Running the Script

```bash
node scripts/seedCuratedOutfits.js
```

## What Gets Created

The script creates:

1. **Collections** in `/curated_collections`:
   - Casual Essentials
   - Business Professional
   - Date Night
   - Athleisure

2. **Outfits** in `/curated_collections/{collectionId}/outfits`:
   - Each collection contains sample outfits with products, prices, and retailer links

## Customizing the Data

Edit `scripts/seedCuratedOutfits.js` to:
- Modify collection names and descriptions
- Add/remove collections
- Customize outfit data
- Add real product images and links

## Important Notes

- ⚠️ **Never commit service account keys to Git**
- The script uses server timestamps for `createdAt` fields
- Collections are created with unique IDs
- Outfits are nested under their parent collections

## Troubleshooting

**Error: "Firebase Admin not initialized"**
- Make sure you've set up the service account credentials correctly

**Error: "Permission denied"**
- Check that your service account has Firestore Admin permissions
- Verify the service account key is valid

**Error: "Collection already exists"**
- The script will create new documents with new IDs each time
- To avoid duplicates, delete existing collections first or modify the script to check for existing data


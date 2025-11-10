# Quick Start: Seed Firestore with Outfits

This guide will help you quickly seed your Firestore database with curated collections and outfits.

## Step 1: Get Firebase Service Account Key

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/outfitz-dfd41/settings/serviceaccounts/adminsdk

2. **Generate Private Key**
   - Click **"Generate new private key"**
   - Click **"Generate key"** in the confirmation dialog
   - A JSON file will download (e.g., `outfitz-dfd41-firebase-adminsdk-xxxxx.json`)

3. **Save the Key File**
   - Rename it to: `serviceAccountKey.json`
   - Move it to: `scripts/serviceAccountKey.json`
   - ⚠️ **IMPORTANT**: This file is already in `.gitignore` - DO NOT commit it!

## Step 2: Install Firebase Admin SDK

```bash
cd /Volumes/AHARDRIVE/Apps/Projects/Outfitzv5.0
npm install firebase-admin
```

Or install it in the scripts directory:

```bash
cd scripts
npm install firebase-admin
```

## Step 3: Run the Seeding Script

```bash
cd /Volumes/AHARDRIVE/Apps/Projects/Outfitzv5.0
node scripts/seedCuratedOutfits.js
```

## What Gets Created

The script will create:

### Collections (6 total):
1. **Casual Essentials** - Everyday casual outfits
2. **Business Professional** - Work-appropriate looks
3. **Date Night** - Special occasion outfits
4. **Athleisure** - Active and comfortable wear
5. **Streetwear** - Urban street style
6. **Minimalist** - Clean and simple aesthetic

### Outfits (8 total):
- 2 Casual Essentials outfits
- 2 Business Professional outfits
- 2 Date Night outfits
- 1 Athleisure outfit
- 1 Streetwear outfit
- 1 Minimalist outfit

Each outfit includes:
- Title and description
- Hero image
- Style tags
- Components (items) with:
  - Name, image, retailer, price, and purchase link

## Verification

After running the script:

1. **Check Firebase Console**
   - Go to Firestore Database
   - You should see `curated_collections` collection with 6 documents
   - You should see `outfits` collection with 8 documents

2. **Refresh Your App**
   - The "Curated Outfits" section should appear
   - You should see collection tabs
   - Clicking a tab should show outfits
   - Clicking an outfit should show the detail page

## Troubleshooting

### "Firebase Admin not initialized"
- Make sure `serviceAccountKey.json` is in the `scripts/` directory
- Check the file path is correct
- Verify the JSON file is valid

### "Permission denied"
- Make sure you downloaded the service account key for the correct project
- Verify the key has Firestore Admin permissions (it should by default)

### "Module not found: firebase-admin"
- Run: `npm install firebase-admin`
- Make sure you're in the project root directory

### Script runs but no data appears
- Check Firebase Console to see if data was actually created
- Check browser console for errors
- Verify Firestore security rules allow public read access

## Next Steps

Once seeded:
1. ✅ Collections and outfits will appear automatically
2. ✅ Users can browse and click outfits
3. ✅ Detail pages will show full outfit information
4. ✅ Personalization will filter based on user gender

## Customizing the Data

Edit `scripts/seedCuratedOutfits.js` to:
- Add more collections
- Add more outfits
- Change outfit data
- Update images and links
- Modify prices and retailers




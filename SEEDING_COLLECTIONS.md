# Seeding Curated Collections and Outfits

This guide explains how to add curated collections and outfits to Firestore so they appear on the home page.

## Problem

If you see "No curated outfits available yet" or no outfits are showing, it means there are no collections or outfits in Firestore yet.

## Solution: Seed Data

You have two options to add collections and outfits:

### Option 1: Use Firebase Console (Quick & Easy)

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/
   - Select your project: `outfitz-dfd41`
   - Go to **Firestore Database**

2. **Create a Collection**
   - Click **Start collection**
   - Collection ID: `curated_collections`
   - Click **Next**

3. **Add Collection Document**
   - Document ID: Click **Auto-ID** (or use a custom ID like `casual-essentials`)
   - Add these fields:
     ```
     name (string): "Casual Essentials"
     description (string): "Perfect everyday outfits"
     style (string): "casual"
     gender (string): "all"
     order (number): 1
     imageUrl (string): "/images/styles/WStreetwear.png"
     ```
   - Click **Save**

4. **Add Outfits to Collection (Old Structure)**
   - Click on the collection document you just created
   - Click **Start collection** under the document
   - Collection ID: `outfits`
   - Click **Next**
   - Add outfit document:
     ```
     title (string): "Classic White Tee & Jeans"
     description (string): "A timeless combination"
     imageUrl (string): "https://via.placeholder.com/400x600"
     order (number): 1
     gender (string): "all"
     products (array):
       - name: "Classic White T-Shirt"
         price: "29.99"
         retailerName: "Amazon"
         retailerUrl: "https://www.amazon.com/s?k=white+t-shirt"
       - name: "Slim Fit Jeans"
         price: "79.99"
         retailerName: "Amazon"
         retailerUrl: "https://www.amazon.com/s?k=jeans"
     ```
   - Click **Save**

5. **Add Outfits (New Structure - Recommended)**
   - Create a top-level collection: `outfits`
   - Add outfit document:
     ```
     title (string): "Classic White Tee & Jeans"
     description (string): "A timeless combination"
     imageUrl (string): "https://via.placeholder.com/400x600"
     collectionId (string): "casual-essentials" (the ID of your collection)
     order (number): 1
     gender (string): "all"
     styleTags (array): ["casual", "everyday"]
     components (array):
       - name: "Classic White T-Shirt"
         image: "https://via.placeholder.com/200"
         retailer: "Amazon"
         price: 29.99
         link: "https://www.amazon.com/s?k=white+t-shirt"
       - name: "Slim Fit Jeans"
         image: "https://via.placeholder.com/200"
         retailer: "Amazon"
         price: 79.99
         link: "https://www.amazon.com/s?k=jeans"
     ```
   - Click **Save**

### Option 2: Use the Seeding Script (Automated)

1. **Set up Firebase Admin SDK**
   ```bash
   cd functions
   npm install firebase-admin
   ```

2. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click **Generate new private key**
   - Save the JSON file

3. **Update the Seeding Script**
   - Edit `scripts/seedCuratedOutfits.js`
   - Uncomment and configure Firebase Admin initialization
   - Update the collections and outfits data as needed

4. **Run the Script**
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json node scripts/seedCuratedOutfits.js
   ```

## Required Fields

### Collection Document
- `name` (string): Collection name
- `description` (string): Collection description
- `style` (string): Style category
- `gender` (string): "male", "female", "unisex", or "all"
- `order` (number): Display order
- `imageUrl` (string): Collection image URL

### Outfit Document (Old Structure)
- `title` (string): Outfit title
- `description` (string): Outfit description
- `imageUrl` (string): Outfit image URL
- `order` (number): Display order
- `gender` (string): "male", "female", "unisex", or "all"
- `products` (array): Array of product objects

### Outfit Document (New Structure)
- `title` (string): Outfit title
- `description` (string): Outfit description
- `imageUrl` (string): Outfit hero image URL
- `collectionId` (string): ID of parent collection
- `order` (number): Display order
- `gender` (string): "male", "female", "unisex", or "all"
- `styleTags` (array): Array of style tags
- `components` (array): Array of component objects with:
  - `name` (string)
  - `image` (string)
  - `retailer` (string)
  - `price` (number)
  - `link` (string)

## Sample Data

### Collection Example
```json
{
  "name": "Casual Essentials",
  "description": "Perfect everyday outfits for any occasion",
  "style": "casual",
  "gender": "all",
  "order": 1,
  "imageUrl": "/images/styles/WStreetwear.png"
}
```

### Outfit Example (New Structure)
```json
{
  "title": "Classic White Tee & Jeans",
  "description": "A timeless combination that works for any casual occasion",
  "imageUrl": "https://via.placeholder.com/400x600",
  "collectionId": "casual-essentials",
  "order": 1,
  "gender": "all",
  "styleTags": ["casual", "everyday"],
  "components": [
    {
      "name": "Classic White T-Shirt",
      "image": "https://via.placeholder.com/200",
      "retailer": "Amazon",
      "price": 29.99,
      "link": "https://www.amazon.com/s?k=white+t-shirt"
    },
    {
      "name": "Slim Fit Jeans",
      "image": "https://via.placeholder.com/200",
      "retailer": "Amazon",
      "price": 79.99,
      "link": "https://www.amazon.com/s?k=jeans"
    }
  ]
}
```

## Testing

After adding data:

1. **Refresh your app**
2. **Check the browser console** for any errors
3. **Verify collections appear** in the "Curated Outfits" section
4. **Click on a collection tab** to see outfits
5. **Click on an outfit card** to see the detail page

## Troubleshooting

### Collections not showing?
- Check Firestore security rules allow public read access
- Verify collections exist in `curated_collections` collection
- Check browser console for errors

### Outfits not showing?
- Verify outfits exist in the collection
- Check if `collectionId` matches (for new structure)
- Verify `order` field exists (or remove orderBy from query)
- Check browser console for errors

### Still not working?
- Check Firestore security rules: `firestore.rules`
- Verify you deployed the rules: `firebase deploy --only firestore:rules`
- Check browser console for specific error messages

## Next Steps

Once you have collections and outfits in Firestore:
1. They will automatically appear on the home page
2. Users can browse collections and outfits
3. Users can click outfits to see detail pages
4. Personalization will filter based on user gender (if set)




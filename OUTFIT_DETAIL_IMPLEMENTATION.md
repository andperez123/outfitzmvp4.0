# Outfit Detail Page Implementation

This document describes the implementation of the outfit detail page and the new Firebase structure for managing outfits.

## Overview

The implementation includes:
1. **Outfit Detail Page** - Full-page view of individual outfits
2. **Firebase Structure** - New `outfits` collection for managing outfit data
3. **Routing** - New route `/outfit/:outfitId` for detail pages
4. **Personalization** - Gender-based filtering based on user profiles
5. **Backwards Compatibility** - Supports both new and old Firebase structures

## Features

### 1. Outfit Detail Page

**Component:** `src/components/OutfitDetail.js`

**Features:**
- Displays full outfit information
- Shows hero image
- Lists all outfit components with images, prices, and purchase links
- Shows outfit description and style tags
- Displays total price
- "Use this Outfit" button to save to session
- Back navigation
- Responsive design

**Route:** `/outfit/:outfitId`

### 2. Firebase Structure

#### New Structure: Top-Level `outfits` Collection

```
outfits/
  {outfitId}/
    - title: string
    - description: string
    - gender: "male" | "female" | "unisex" | "all"
    - styleTags: string[]
    - imageUrl: string (hero image)
    - heroImage: string (alias for imageUrl)
    - collectionId: string (reference to curated_collections)
    - order: number
    - components: array
      - name: string
      - image: string
      - retailer: string
      - price: number
      - link: string (affiliate link)
    - createdAt: timestamp
    - updatedAt: timestamp
```

#### Legacy Structure: Subcollection (still supported)

```
curated_collections/
  {collectionId}/
    outfits/
      {outfitId}/
        - title: string
        - description: string
        - products: array
          - name: string
          - retailerName: string
          - price: number
          - retailerUrl: string
```

The service automatically handles both structures for backwards compatibility.

### 3. Routing

**File:** `src/App.js`

**New Route:**
```javascript
<Route path="/outfit/:outfitId" element={<OutfitDetail />} />
```

### 4. Personalization

**Implementation:** `src/components/CuratedOutfitsSection.js`

**Features:**
- Filters outfits based on user's gender preference
- Shows only matching gender outfits (male/female/unisex/all)
- Falls back to showing all outfits if no gender is set
- Automatically refreshes when user profile changes

**Logic:**
- If user has gender set → Show only matching outfits
- If no gender set → Show all outfits
- Filters apply to both new and old Firebase structures

### 5. Card Navigation

**File:** `src/components/CuratedOutfitCard.js`

**Changes:**
- Entire card is now clickable
- Clicking card navigates to `/outfit/:outfitId`
- "Shop" buttons stop event propagation (don't trigger card click)
- "Use this Outfit" button stops event propagation
- Added cursor pointer styling

## Service Functions

### Updated Functions

**File:** `src/services/curatedOutfitsService.js`

#### `fetchOutfitById(outfitId)`
- Fetches a single outfit by ID
- Supports both new (top-level) and old (subcollection) structures
- Returns outfit with collection information

#### `fetchCollectionOutfits(collectionId, filters)`
- Fetches outfits for a collection
- Supports gender filtering
- Falls back to old structure if new structure not found

#### `fetchAllCuratedOutfits(filters)`
- Fetches all outfits across collections
- Supports gender and style filtering
- Applies personalization filters

### New Functions

#### `createOutfit(outfitData)`
- Creates a new outfit in the `outfits` collection
- Used for managing outfits dynamically

#### `updateOutfit(outfitId, outfitData)`
- Updates an existing outfit
- Used for managing outfits dynamically

## Usage

### Viewing Outfit Details

1. User clicks on a curated outfit card
2. Navigates to `/outfit/:outfitId`
3. OutfitDetail component loads outfit data
4. Displays full outfit information

### Creating Outfits in Firebase

#### Using the New Structure (Recommended)

```javascript
import { createOutfit } from '../services/curatedOutfitsService';

const newOutfit = {
  title: "Summer Casual",
  description: "Perfect for a casual summer day",
  gender: "unisex",
  styleTags: ["casual", "summer"],
  imageUrl: "https://example.com/image.jpg",
  collectionId: "collection-id",
  order: 1,
  components: [
    {
      name: "Cotton T-Shirt",
      image: "https://example.com/tshirt.jpg",
      retailer: "Nike",
      price: 29.99,
      link: "https://nike.com/tshirt"
    },
    {
      name: "Denim Jeans",
      image: "https://example.com/jeans.jpg",
      retailer: "Levi's",
      price: 79.99,
      link: "https://levis.com/jeans"
    }
  ]
};

await createOutfit(newOutfit);
```

### Firebase Console Setup

1. **Create `outfits` Collection**
   - Go to Firebase Console → Firestore Database
   - Create collection: `outfits`

2. **Add Indexes** (if needed)
   - For gender filtering: `gender` field
   - For ordering: `order` field
   - For collection filtering: `collectionId` field

3. **Add Sample Outfit**
   ```json
   {
     "title": "Casual Weekend",
     "description": "Perfect for weekend outings",
     "gender": "male",
     "styleTags": ["casual", "weekend"],
     "imageUrl": "https://example.com/outfit.jpg",
     "collectionId": "your-collection-id",
     "order": 1,
     "components": [
       {
         "name": "T-Shirt",
         "image": "https://example.com/tshirt.jpg",
         "retailer": "Brand Name",
         "price": 29.99,
         "link": "https://retailer.com/product"
       }
     ],
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z"
   }
   ```

## Migration from Old Structure

The service automatically handles both structures, but you can migrate:

1. **Read outfits from old structure**
2. **Create in new structure using `createOutfit()`**
3. **Update collection references**
4. **Test thoroughly**
5. **Remove old structure once verified**

## Analytics

The implementation includes analytics tracking:

- `outfit_card_clicked` - When user clicks an outfit card
- `retailer_link_clicked` - When user clicks a retailer link
- `curated_outfit_selected` - When user saves an outfit to session

## Testing

### Manual Testing

1. **Test Outfit Detail Page**
   - Click on an outfit card
   - Verify all information displays correctly
   - Test "Shop Now" buttons
   - Test "Use this Outfit" button
   - Test back navigation

2. **Test Personalization**
   - Set user gender to "male"
   - Verify only male/unisex outfits show
   - Set user gender to "female"
   - Verify only female/unisex outfits show
   - Remove gender
   - Verify all outfits show

3. **Test Backwards Compatibility**
   - Verify old structure outfits still work
   - Verify new structure outfits work
   - Verify mixed structures work

### Firebase Structure Testing

1. **Create test outfit in new structure**
2. **Verify it appears in collections**
3. **Verify detail page loads**
4. **Verify personalization works**

## Future Enhancements

Possible future features:

1. **Save Outfit** - Allow users to save favorite outfits
2. **Generate Similar Look** - AI-powered similar outfit suggestions
3. **Share Outfit** - Share outfit links with others
4. **Outfit Reviews** - User reviews and ratings
5. **Price Alerts** - Notify users of price drops
6. **Style Recommendations** - Based on user's style preferences

## Notes

- The implementation is modular and extensible
- Supports both new and old Firebase structures
- Personalization is optional (shows all if no gender set)
- All components are responsive
- Analytics tracking is included
- Error handling is implemented throughout

## Support

If you encounter issues:

1. Check Firebase Console for collection structure
2. Verify outfit IDs are correct
3. Check browser console for errors
4. Verify user authentication (required for some features)
5. Check Firestore security rules




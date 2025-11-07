/**
 * Seeding script for Curated Outfits
 * 
 * This script populates Firestore with initial curated outfit data.
 * 
 * To run this script:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Set up Firebase Admin credentials (service account key)
 * 3. Run: node scripts/seedCuratedOutfits.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (you'll need to set up credentials)
// Option 1: Use service account key file
// const serviceAccount = require('./path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Use environment variable (recommended for production)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault()
// });

// For local development, you can also use:
// GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json node scripts/seedCuratedOutfits.js

if (!admin.apps.length) {
  console.error('Firebase Admin not initialized. Please set up credentials.');
  process.exit(1);
}

const db = admin.firestore();

// Sample curated collections data
const curatedCollections = [
  {
    name: 'Casual Essentials',
    description: 'Perfect everyday outfits for any occasion',
    style: 'casual',
    gender: 'all',
    order: 1,
    imageUrl: '/images/styles/WStreetwear.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Business Professional',
    description: 'Sharp and polished looks for the workplace',
    style: 'professional',
    gender: 'all',
    order: 2,
    imageUrl: '/images/styles/Mpreppy.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Date Night',
    description: 'Stylish outfits for special evenings',
    style: 'formal',
    gender: 'all',
    order: 3,
    imageUrl: '/images/styles/WClassicPreppy.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Athleisure',
    description: 'Comfortable and stylish active wear',
    style: 'athleisure',
    gender: 'all',
    order: 4,
    imageUrl: '/images/styles/WAthlesiure.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Sample outfits data for each collection
const outfitsData = {
  'casual-essentials': [
    {
      title: 'Classic White Tee & Jeans',
      description: 'A timeless combination that works for any casual occasion',
      imageUrl: 'https://via.placeholder.com/400x600?text=Classic+Casual',
      products: [
        {
          name: 'Classic White T-Shirt',
          price: '29.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=classic+white+t-shirt'
        },
        {
          name: 'Slim Fit Jeans',
          price: '79.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=slim+fit+jeans'
        },
        {
          name: 'White Sneakers',
          price: '89.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=white+sneakers'
        }
      ],
      order: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      title: 'Layered Fall Look',
      description: 'Perfect for transitioning seasons with a cozy cardigan',
      imageUrl: 'https://via.placeholder.com/400x600?text=Fall+Look',
      products: [
        {
          name: 'Long Sleeve Tee',
          price: '34.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=long+sleeve+tee'
        },
        {
          name: 'Chunky Cardigan',
          price: '59.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=chunky+cardigan'
        },
        {
          name: 'Dark Wash Jeans',
          price: '79.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=dark+wash+jeans'
        },
        {
          name: 'Ankle Boots',
          price: '99.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=ankle+boots'
        }
      ],
      order: 2,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  'business-professional': [
    {
      title: 'Power Suit',
      description: 'A sharp, professional look that commands attention',
      imageUrl: 'https://via.placeholder.com/400x600?text=Power+Suit',
      products: [
        {
          name: 'Blazer',
          price: '199.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=blazer'
        },
        {
          name: 'Dress Pants',
          price: '89.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=dress+pants'
        },
        {
          name: 'Dress Shirt',
          price: '49.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=dress+shirt'
        },
        {
          name: 'Oxford Shoes',
          price: '149.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=oxford+shoes'
        }
      ],
      order: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  'date-night': [
    {
      title: 'Elegant Evening',
      description: 'Sophisticated and romantic for a special night out',
      imageUrl: 'https://via.placeholder.com/400x600?text=Elegant+Evening',
      products: [
        {
          name: 'Cocktail Dress',
          price: '129.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=cocktail+dress'
        },
        {
          name: 'Heeled Sandals',
          price: '79.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=heeled+sandals'
        },
        {
          name: 'Clutch Bag',
          price: '49.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=clutch+bag'
        }
      ],
      order: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  'athleisure': [
    {
      title: 'Gym to Street',
      description: 'Comfortable and stylish for active days',
      imageUrl: 'https://via.placeholder.com/400x600?text=Gym+Street',
      products: [
        {
          name: 'Athletic T-Shirt',
          price: '24.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=athletic+t-shirt'
        },
        {
          name: 'Leggings',
          price: '39.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=leggings'
        },
        {
          name: 'Running Shoes',
          price: '119.99',
          retailerName: 'Amazon',
          retailerUrl: 'https://www.amazon.com/s?k=running+shoes'
        }
      ],
      order: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function seedCollections() {
  console.log('Starting to seed curated collections...\n');

  try {
    for (const collection of curatedCollections) {
      // Create collection document
      const collectionRef = db.collection('curated_collections').doc();
      const collectionId = collectionRef.id;
      
      await collectionRef.set({
        ...collection,
        id: collectionId
      });

      console.log(`✓ Created collection: ${collection.name} (${collectionId})`);

      // Get the collection key for outfits
      const collectionKey = collection.name.toLowerCase().replace(/\s+/g, '-');
      const outfits = outfitsData[collectionKey] || [];

      // Add outfits to this collection
      for (const outfit of outfits) {
        const outfitRef = collectionRef.collection('outfits').doc();
        await outfitRef.set({
          ...outfit,
          id: outfitRef.id
        });
        console.log(`  ✓ Added outfit: ${outfit.title}`);
      }
    }

    console.log('\n✅ Successfully seeded all curated collections and outfits!');
  } catch (error) {
    console.error('❌ Error seeding collections:', error);
    throw error;
  }
}

// Run the seeding function
seedCollections()
  .then(() => {
    console.log('\nSeeding complete. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });


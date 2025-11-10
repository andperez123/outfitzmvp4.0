/**
 * Seeding script for Curated Outfits
 * 
 * This script populates Firestore with initial curated outfit data.
 * 
 * To run this script:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Get service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 4. Run: node scripts/seedCuratedOutfits.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Option 1: Use service account key file (recommended)
// Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
// Save as: scripts/serviceAccountKey.json (make sure it's in .gitignore!)

try {
  // Try to load service account key from scripts directory
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin initialized with service account key');
} catch (error) {
  // Option 2: Use environment variable
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log('✓ Firebase Admin initialized with application default credentials');
  } catch (envError) {
    console.error('❌ Firebase Admin initialization failed!');
    console.error('Please set up Firebase Admin credentials:');
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save the JSON file as: scripts/serviceAccountKey.json');
    console.error('4. Make sure scripts/serviceAccountKey.json is in .gitignore!');
    process.exit(1);
  }
}

const db = admin.firestore();

// Curated collections data
const curatedCollections = [
  {
    name: 'Casual Essentials',
    description: 'Perfect everyday outfits for any occasion',
    style: 'casual',
    gender: 'all',
    order: 1,
    imageUrl: '/images/styles/WStreetwear.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Business Professional',
    description: 'Sharp and polished looks for the workplace',
    style: 'professional',
    gender: 'all',
    order: 2,
    imageUrl: '/images/styles/Mpreppy.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Date Night',
    description: 'Stylish outfits for special evenings',
    style: 'formal',
    gender: 'all',
    order: 3,
    imageUrl: '/images/styles/WClassicPreppy.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Athleisure',
    description: 'Comfortable and stylish active wear',
    style: 'athleisure',
    gender: 'all',
    order: 4,
    imageUrl: '/images/styles/WAthlesiure.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Streetwear',
    description: 'Urban and edgy street style',
    style: 'streetwear',
    gender: 'all',
    order: 5,
    imageUrl: '/images/styles/Mstreetwear.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Minimalist',
    description: 'Clean and simple aesthetic',
    style: 'minimal',
    gender: 'all',
    order: 6,
    imageUrl: '/images/styles/Mminimal.png',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Outfits data - using NEW structure (top-level outfits collection)
const outfitsData = [
  // Casual Essentials
  {
    collectionId: 'casual-essentials', // Will be replaced with actual collection ID
    title: 'Classic White Tee & Jeans',
    description: 'A timeless combination that works for any casual occasion. Perfect for weekend brunches, coffee dates, or running errands.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['casual', 'everyday', 'comfortable'],
    order: 1,
    components: [
      {
        name: 'Classic White T-Shirt',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Amazon',
        price: 29.99,
        link: 'https://www.amazon.com/s?k=classic+white+t-shirt'
      },
      {
        name: 'Slim Fit Jeans',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Levi\'s',
        price: 79.99,
        link: 'https://www.amazon.com/s?k=slim+fit+jeans'
      },
      {
        name: 'White Sneakers',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Nike',
        price: 89.99,
        link: 'https://www.amazon.com/s?k=white+sneakers'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    collectionId: 'casual-essentials',
    title: 'Layered Fall Look',
    description: 'Perfect for transitioning seasons with a cozy cardigan. Stay warm and stylish with this layered ensemble.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['casual', 'fall', 'layered'],
    order: 2,
    components: [
      {
        name: 'Long Sleeve Tee',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Uniqlo',
        price: 34.99,
        link: 'https://www.amazon.com/s?k=long+sleeve+tee'
      },
      {
        name: 'Chunky Cardigan',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'H&M',
        price: 59.99,
        link: 'https://www.amazon.com/s?k=chunky+cardigan'
      },
      {
        name: 'Dark Wash Jeans',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Levi\'s',
        price: 79.99,
        link: 'https://www.amazon.com/s?k=dark+wash+jeans'
      },
      {
        name: 'Ankle Boots',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Zara',
        price: 99.99,
        link: 'https://www.amazon.com/s?k=ankle+boots'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  // Business Professional
  {
    collectionId: 'business-professional',
    title: 'Power Suit',
    description: 'A sharp, professional look that commands attention. Perfect for important meetings and presentations.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['professional', 'business', 'formal'],
    order: 1,
    components: [
      {
        name: 'Blazer',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Banana Republic',
        price: 199.99,
        link: 'https://www.amazon.com/s?k=blazer'
      },
      {
        name: 'Dress Pants',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'J.Crew',
        price: 89.99,
        link: 'https://www.amazon.com/s?k=dress+pants'
      },
      {
        name: 'Dress Shirt',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Brooks Brothers',
        price: 49.99,
        link: 'https://www.amazon.com/s?k=dress+shirt'
      },
      {
        name: 'Oxford Shoes',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Allen Edmonds',
        price: 149.99,
        link: 'https://www.amazon.com/s?k=oxford+shoes'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    collectionId: 'business-professional',
    title: 'Business Casual',
    description: 'A relaxed yet professional look perfect for modern workplaces with a casual dress code.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['professional', 'casual', 'office'],
    order: 2,
    components: [
      {
        name: 'Button-Down Shirt',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Everlane',
        price: 55.00,
        link: 'https://www.amazon.com/s?k=button+down+shirt'
      },
      {
        name: 'Chino Pants',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Bonobos',
        price: 68.00,
        link: 'https://www.amazon.com/s?k=chino+pants'
      },
      {
        name: 'Loafers',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Cole Haan',
        price: 120.00,
        link: 'https://www.amazon.com/s?k=loafers'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  // Date Night
  {
    collectionId: 'date-night',
    title: 'Elegant Evening',
    description: 'Sophisticated and romantic for a special night out. Make a lasting impression with this elegant ensemble.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['formal', 'elegant', 'romantic'],
    order: 1,
    components: [
      {
        name: 'Cocktail Dress',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Reformation',
        price: 129.99,
        link: 'https://www.amazon.com/s?k=cocktail+dress'
      },
      {
        name: 'Heeled Sandals',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Steve Madden',
        price: 79.99,
        link: 'https://www.amazon.com/s?k=heeled+sandals'
      },
      {
        name: 'Clutch Bag',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Kate Spade',
        price: 49.99,
        link: 'https://www.amazon.com/s?k=clutch+bag'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    collectionId: 'date-night',
    title: 'Sharp Date Night',
    description: 'A polished look that\'s perfect for dinner dates. Sophisticated without being too formal.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['smart casual', 'date night', 'polished'],
    order: 2,
    components: [
      {
        name: 'Button-Up Shirt',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Everlane',
        price: 65.00,
        link: 'https://www.amazon.com/s?k=button+up+shirt'
      },
      {
        name: 'Dark Denim',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'AG Jeans',
        price: 180.00,
        link: 'https://www.amazon.com/s?k=dark+denim+jeans'
      },
      {
        name: 'Leather Jacket',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'AllSaints',
        price: 450.00,
        link: 'https://www.amazon.com/s?k=leather+jacket'
      },
      {
        name: 'Chelsea Boots',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Clarks',
        price: 130.00,
        link: 'https://www.amazon.com/s?k=chelsea+boots'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  // Athleisure
  {
    collectionId: 'athleisure',
    title: 'Gym to Street',
    description: 'Comfortable and stylish for active days. Transition seamlessly from workout to everyday activities.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['athleisure', 'active', 'comfortable'],
    order: 1,
    components: [
      {
        name: 'Athletic T-Shirt',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Nike',
        price: 24.99,
        link: 'https://www.amazon.com/s?k=athletic+t-shirt'
      },
      {
        name: 'Leggings',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Lululemon',
        price: 98.00,
        link: 'https://www.amazon.com/s?k=leggings'
      },
      {
        name: 'Running Shoes',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Adidas',
        price: 119.99,
        link: 'https://www.amazon.com/s?k=running+shoes'
      },
      {
        name: 'Hoodie',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Champion',
        price: 45.00,
        link: 'https://www.amazon.com/s?k=hoodie'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  // Streetwear
  {
    collectionId: 'streetwear',
    title: 'Urban Street Style',
    description: 'Edgy and contemporary streetwear look. Perfect for expressing your urban style.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['streetwear', 'urban', 'edgy'],
    order: 1,
    components: [
      {
        name: 'Oversized Hoodie',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Supreme',
        price: 148.00,
        link: 'https://www.amazon.com/s?k=oversized+hoodie'
      },
      {
        name: 'Cargo Pants',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Carhartt',
        price: 75.00,
        link: 'https://www.amazon.com/s?k=cargo+pants'
      },
      {
        name: 'High-Top Sneakers',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Vans',
        price: 65.00,
        link: 'https://www.amazon.com/s?k=high+top+sneakers'
      },
      {
        name: 'Snapback Cap',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'New Era',
        price: 35.00,
        link: 'https://www.amazon.com/s?k=snapback+cap'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  // Minimalist
  {
    collectionId: 'minimalist',
    title: 'Clean Minimal',
    description: 'Simple, clean lines with a focus on quality basics. Less is more with this minimalist approach.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    heroImage: 'https://picsum.photos/400/600?random=1',
    gender: 'all',
    styleTags: ['minimal', 'clean', 'simple'],
    order: 1,
    components: [
      {
        name: 'Basic White Tee',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Everlane',
        price: 18.00,
        link: 'https://www.amazon.com/s?k=basic+white+tee'
      },
      {
        name: 'Straight Leg Trousers',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'COS',
        price: 95.00,
        link: 'https://www.amazon.com/s?k=straight+leg+trousers'
      },
      {
        name: 'Minimalist Sneakers',
        image: 'https://picsum.photos/200/200?random=2',
        retailer: 'Common Projects',
        price: 425.00,
        link: 'https://www.amazon.com/s?k=minimalist+sneakers'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedCollections() {
  console.log('🌱 Starting to seed curated collections...\n');

  try {
    const collectionMap = new Map(); // Store collection IDs by name

    // Step 1: Create collections
    console.log('📦 Creating collections...');
    for (const collectionData of curatedCollections) {
      // Create collection document
      const collectionRef = db.collection('curated_collections').doc();
      const collectionId = collectionRef.id;
      
      const collectionKey = collectionData.name.toLowerCase().replace(/\s+/g, '-');
      
      await collectionRef.set({
        ...collectionData,
        id: collectionId
      });

      collectionMap.set(collectionKey, collectionId);
      console.log(`  ✓ Created collection: ${collectionData.name} (ID: ${collectionId})`);
    }

    // Step 2: Create outfits in top-level outfits collection
    console.log('\n👕 Creating outfits...');
    let outfitCount = 0;
    
    for (const outfitData of outfitsData) {
      const collectionKey = outfitData.collectionId;
      const actualCollectionId = collectionMap.get(collectionKey);
      
      if (!actualCollectionId) {
        console.warn(`  ⚠️  Skipping outfit "${outfitData.title}" - collection "${collectionKey}" not found`);
        continue;
      }

      // Create outfit in top-level outfits collection (NEW structure)
      const outfitRef = db.collection('outfits').doc();
      await outfitRef.set({
        ...outfitData,
        collectionId: actualCollectionId,
        id: outfitRef.id
      });

      // Also create in old structure for backwards compatibility
      const oldOutfitRef = db.collection('curated_collections').doc(actualCollectionId).collection('outfits').doc();
      await oldOutfitRef.set({
        title: outfitData.title,
        description: outfitData.description,
        imageUrl: outfitData.imageUrl,
        gender: outfitData.gender,
        order: outfitData.order,
        products: outfitData.components.map(comp => ({
          name: comp.name,
          price: comp.price.toString(),
          retailerName: comp.retailer,
          retailerUrl: comp.link
        })),
        id: oldOutfitRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      outfitCount++;
      console.log(`  ✓ Created outfit: ${outfitData.title} (in collection: ${collectionKey})`);
    }

    console.log(`\n✅ Successfully seeded ${curatedCollections.length} collections and ${outfitCount} outfits!`);
    console.log('\n📋 Summary:');
    console.log(`   - Collections created: ${curatedCollections.length}`);
    console.log(`   - Outfits created: ${outfitCount}`);
    console.log(`   - Structure: Both new (top-level) and old (subcollection) structures`);
    console.log('\n🎉 Seeding complete! Refresh your app to see the outfits.');
    
  } catch (error) {
    console.error('\n❌ Error seeding collections:', error);
    throw error;
  }
}

// Run the seeding function
seedCollections()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });

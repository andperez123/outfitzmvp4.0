/**
 * Update image URLs in existing Firestore data
 * Fixes placeholder.com URLs that don't work
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function updateImageUrls() {
  console.log('🔄 Updating image URLs in Firestore...\n');

  try {
    // Update outfits in top-level collection
    const outfitsRef = db.collection('outfits');
    const outfitsSnapshot = await outfitsRef.get();
    
    let updatedCount = 0;
    
    for (const doc of outfitsSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;

      // Fix imageUrl
      if (data.imageUrl && data.imageUrl.includes('via.placeholder.com')) {
        updates.imageUrl = 'https://picsum.photos/400/600';
        needsUpdate = true;
      }
      if (data.heroImage && data.heroImage.includes('via.placeholder.com')) {
        updates.heroImage = 'https://picsum.photos/400/600';
        needsUpdate = true;
      }

      // Fix component images - always update to ensure consistent URLs
      if (data.components && Array.isArray(data.components)) {
        updates.components = data.components.map((comp, index) => {
          // Use different random seeds for variety
          const randomSeed = Math.floor(Math.random() * 1000) + index;
          return {
            ...comp,
            image: comp.image && !comp.image.includes('picsum.photos') 
              ? `https://picsum.photos/200/200?random=${randomSeed}` 
              : (comp.image || `https://picsum.photos/200/200?random=${randomSeed}`)
          };
        });
        needsUpdate = true;
      }

      if (needsUpdate) {
        await doc.ref.update(updates);
        updatedCount++;
        console.log(`  ✓ Updated outfit: ${data.title || doc.id}`);
      }
    }

    // Update outfits in old structure (subcollections)
    const collectionsRef = db.collection('curated_collections');
    const collectionsSnapshot = await collectionsRef.get();

    for (const collectionDoc of collectionsSnapshot.docs) {
      const outfitsSubcollectionRef = collectionDoc.ref.collection('outfits');
      const outfitsSubSnapshot = await outfitsSubcollectionRef.get();

      for (const outfitDoc of outfitsSubSnapshot.docs) {
        const data = outfitDoc.data();
        const updates = {};
        let needsUpdate = false;

        if (data.imageUrl && data.imageUrl.includes('via.placeholder.com')) {
          updates.imageUrl = 'https://picsum.photos/400/600';
          needsUpdate = true;
        }

        if (data.products && Array.isArray(data.products)) {
          // Old structure uses products array
          // We can't easily update nested product images here
          // But the main imageUrl is what matters most
        }

        if (needsUpdate) {
          await outfitDoc.ref.update(updates);
          updatedCount++;
          console.log(`  ✓ Updated outfit in collection: ${data.title || outfitDoc.id}`);
        }
      }
    }

    console.log(`\n✅ Updated ${updatedCount} outfits with new image URLs`);
    console.log('🔄 Refresh your app to see the updated images');
    
  } catch (error) {
    console.error('❌ Error updating image URLs:', error);
    throw error;
  }
}

updateImageUrls()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Update failed:', error);
    process.exit(1);
  });


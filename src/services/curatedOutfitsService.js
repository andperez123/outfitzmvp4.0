import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    where,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';

/**
 * Fetch all curated collections
 */
export const fetchCuratedCollections = async () => {
    try {
        const collectionsRef = collection(db, 'curated_collections');
        const q = query(collectionsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const collections = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return collections;
    } catch (error) {
        console.error('Error fetching curated collections:', error);
        throw error;
    }
};

/**
 * Fetch a single curated collection by ID
 */
export const fetchCuratedCollection = async (collectionId) => {
    try {
        const collectionRef = doc(db, 'curated_collections', collectionId);
        const collectionDoc = await getDoc(collectionRef);
        
        if (!collectionDoc.exists()) {
            throw new Error(`Collection ${collectionId} not found`);
        }
        
        return {
            id: collectionDoc.id,
            ...collectionDoc.data()
        };
    } catch (error) {
        console.error(`Error fetching collection ${collectionId}:`, error);
        throw error;
    }
};

/**
 * Fetch outfits for a specific collection
 */
export const fetchCollectionOutfits = async (collectionId) => {
    try {
        const outfitsRef = collection(db, 'curated_collections', collectionId, 'outfits');
        const q = query(outfitsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const outfits = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return outfits;
    } catch (error) {
        console.error(`Error fetching outfits for collection ${collectionId}:`, error);
        throw error;
    }
};

/**
 * Save a user session when they select a curated outfit
 */
export const saveOutfitSession = async (userId, outfitData, collectionId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const sessionData = {
            userId,
            outfitId: outfitData.id,
            collectionId,
            outfitTitle: outfitData.title,
            outfitImageUrl: outfitData.imageUrl,
            selectedAt: serverTimestamp(),
            createdAt: serverTimestamp()
        };

        // Save to user_sessions collection
        const sessionRef = doc(collection(db, 'user_sessions'));
        await setDoc(sessionRef, sessionData);

        console.log('Outfit session saved successfully');
        return sessionRef.id;
    } catch (error) {
        console.error('Error saving outfit session:', error);
        throw error;
    }
};

/**
 * Fetch all curated outfits (across all collections) with optional filters
 */
export const fetchAllCuratedOutfits = async (filters = {}) => {
    try {
        const collections = await fetchCuratedCollections();
        const allOutfits = [];

        for (const collection of collections) {
            // Apply filters if provided
            if (filters.gender && collection.gender && collection.gender !== filters.gender && collection.gender !== 'all') {
                continue;
            }

            if (filters.style && collection.style && !collection.style.includes(filters.style)) {
                continue;
            }

            const outfits = await fetchCollectionOutfits(collection.id);
            
            // Add collection info to each outfit
            const outfitsWithCollection = outfits.map(outfit => ({
                ...outfit,
                collectionId: collection.id,
                collectionName: collection.name,
                collectionStyle: collection.style
            }));

            allOutfits.push(...outfitsWithCollection);
        }

        return allOutfits;
    } catch (error) {
        console.error('Error fetching all curated outfits:', error);
        throw error;
    }
};


import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    where,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';

/**
 * Fetch all curated collections
 */
export const fetchCuratedCollections = async () => {
    try {
        const collectionsRef = collection(db, 'curated_collections');
        
        // Try to fetch with orderBy first
        let querySnapshot;
        try {
            const q = query(collectionsRef, orderBy('order', 'asc'));
            querySnapshot = await getDocs(q);
        } catch (orderError) {
            // If orderBy fails (no order field or index), fetch without ordering
            console.warn('Could not order by "order" field, fetching all collections:', orderError);
            querySnapshot = await getDocs(collectionsRef);
        }
        
        const collections = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort client-side if orderBy failed
        if (collections.length > 0 && collections[0].order !== undefined) {
            collections.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        
        console.log(`Fetched ${collections.length} curated collections`);
        return collections;
    } catch (error) {
        console.error('Error fetching curated collections:', error);
        // Return empty array instead of throwing to prevent app crash
        console.warn('Returning empty collections array due to error');
        return [];
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
 * Now supports both subcollection and top-level outfits collection
 */
export const fetchCollectionOutfits = async (collectionId, filters = {}) => {
    try {
        let outfits = [];
        
        // Try new structure first: outfits collection with collectionId reference
        try {
            const outfitsRef = collection(db, 'outfits');
            
            // Fetch all outfits for this collection (without orderBy to avoid index requirement)
            let q = query(outfitsRef, where('collectionId', '==', collectionId));
            let querySnapshot = await getDocs(q);
            
            outfits = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Apply gender filter client-side (to avoid index requirement with 'in' query)
            if (filters.gender && outfits.length > 0) {
                outfits = outfits.filter(outfit => {
                    const outfitGender = outfit.gender || 'all';
                    return outfitGender === filters.gender || 
                           outfitGender === 'unisex' || 
                           outfitGender === 'all';
                });
            }
            
            // Sort client-side by order field
            if (outfits.length > 0) {
                outfits.sort((a, b) => (a.order || 999) - (b.order || 999));
            }
        } catch (newStructureError) {
            console.log('New structure not available, trying old structure:', newStructureError);
        }
        
        // Fallback to old structure if no outfits found in new structure
        if (outfits.length === 0) {
            try {
                const oldOutfitsRef = collection(db, 'curated_collections', collectionId, 'outfits');
                let oldQuerySnapshot;
                
                // Fetch without orderBy to avoid index requirement
                oldQuerySnapshot = await getDocs(oldOutfitsRef);
                
                outfits = oldQuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    collectionId: collectionId // Add collectionId for consistency
                }));
                
                // Sort client-side by order field
                if (outfits.length > 0) {
                    outfits.sort((a, b) => (a.order || 999) - (b.order || 999));
                }
                
                // Apply gender filter client-side for old structure
                if (filters.gender && outfits.length > 0) {
                    outfits = outfits.filter(outfit => {
                        const outfitGender = outfit.gender || 'all';
                        return outfitGender === filters.gender || 
                               outfitGender === 'unisex' || 
                               outfitGender === 'all';
                    });
                }
            } catch (oldError) {
                console.log('Old structure not found either:', oldError);
            }
        }
        
        console.log(`Found ${outfits.length} outfits for collection ${collectionId}`);
        return outfits;
    } catch (error) {
        console.error(`Error fetching outfits for collection ${collectionId}:`, error);
        // Return empty array instead of throwing to prevent app crash
        return [];
    }
};

/**
 * Fetch a single outfit by ID
 * Supports both new (top-level) and old (subcollection) structure
 */
export const fetchOutfitById = async (outfitId) => {
    try {
        // Try new structure first: top-level outfits collection
        const outfitRef = doc(db, 'outfits', outfitId);
        const outfitDoc = await getDoc(outfitRef);
        
        if (outfitDoc.exists()) {
            return {
                id: outfitDoc.id,
                ...outfitDoc.data()
            };
        }
        
        // Fallback: search in all collections (old structure)
        const collections = await fetchCuratedCollections();
        for (const collection of collections) {
            try {
                const oldOutfitRef = doc(db, 'curated_collections', collection.id, 'outfits', outfitId);
                const oldOutfitDoc = await getDoc(oldOutfitRef);
                
                if (oldOutfitDoc.exists()) {
                    return {
                        id: oldOutfitDoc.id,
                        ...oldOutfitDoc.data(),
                        collectionId: collection.id,
                        collectionName: collection.name
                    };
                }
            } catch (err) {
                // Continue searching
                continue;
            }
        }
        
        throw new Error(`Outfit ${outfitId} not found`);
    } catch (error) {
        console.error(`Error fetching outfit ${outfitId}:`, error);
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
 * Now supports gender and style filtering
 */
export const fetchAllCuratedOutfits = async (filters = {}) => {
    try {
        // Try new structure first: top-level outfits collection
        const outfitsRef = collection(db, 'outfits');
        let q = query(outfitsRef);
        
        // Apply gender filter
        if (filters.gender) {
            q = query(outfitsRef, where('gender', 'in', [filters.gender, 'unisex', 'all']));
        } else {
            q = query(outfitsRef);
        }
        
        // Note: Firestore doesn't support ordering with 'in' queries directly
        // We'll order client-side if gender filter is applied
        try {
            let querySnapshot;
            if (filters.gender) {
                querySnapshot = await getDocs(q);
            } else {
                q = query(q, orderBy('order', 'asc'));
                querySnapshot = await getDocs(q);
            }
            let outfits = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort client-side if gender filter was applied (since we can't use orderBy with 'in')
            if (filters.gender) {
                outfits.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
            
            // Apply style filter client-side if needed
            let filteredOutfits = outfits;
            if (filters.style) {
                filteredOutfits = outfits.filter(outfit => 
                    outfit.styleTags && outfit.styleTags.includes(filters.style)
                );
            }
            
            // Get collection names for outfits
            const collections = await fetchCuratedCollections();
            const collectionsMap = new Map(collections.map(c => [c.id, c]));
            
            return filteredOutfits.map(outfit => ({
                ...outfit,
                collectionName: outfit.collectionId ? collectionsMap.get(outfit.collectionId)?.name : null
            }));
        } catch (newStructureError) {
            console.log('New structure not available, using old structure:', newStructureError);
        }
        
        // Fallback to old structure
        const collections = await fetchCuratedCollections();
        const allOutfits = [];

        for (const collection of collections) {
            // Apply collection-level filters
            if (filters.gender && collection.gender && 
                collection.gender !== filters.gender && 
                collection.gender !== 'unisex' && 
                collection.gender !== 'all') {
                continue;
            }

            if (filters.style && collection.style && !collection.style.includes(filters.style)) {
                continue;
            }

            const outfits = await fetchCollectionOutfits(collection.id, filters);
            
            // Add collection info to each outfit
            const outfitsWithCollection = outfits.map(outfit => ({
                ...outfit,
                collectionId: outfit.collectionId || collection.id,
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

/**
 * Create a new outfit in the outfits collection
 * Used for managing outfits dynamically
 */
export const createOutfit = async (outfitData) => {
    try {
        const outfitsRef = collection(db, 'outfits');
        const newOutfitRef = doc(outfitsRef);
        
        const outfitToSave = {
            ...outfitData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await setDoc(newOutfitRef, outfitToSave);
        
        return {
            id: newOutfitRef.id,
            ...outfitToSave
        };
    } catch (error) {
        console.error('Error creating outfit:', error);
        throw error;
    }
};

/**
 * Update an existing outfit
 */
export const updateOutfit = async (outfitId, outfitData) => {
    try {
        const outfitRef = doc(db, 'outfits', outfitId);
        
        await updateDoc(outfitRef, {
            ...outfitData,
            updatedAt: serverTimestamp()
        });
        
        return outfitId;
    } catch (error) {
        console.error('Error updating outfit:', error);
        throw error;
    }
};


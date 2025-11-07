import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { fetchCuratedCollections, fetchCollectionOutfits, saveOutfitSession } from '../services/curatedOutfitsService';
import CuratedOutfitCard from './CuratedOutfitCard';
import './CuratedOutfitsSection.css';

const CuratedOutfitsSection = () => {
    const { user } = useProfile();
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingSession, setSavingSession] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            loadOutfits(selectedCollection.id);
        }
    }, [selectedCollection]);

    const loadCollections = async () => {
        try {
            setLoading(true);
            const fetchedCollections = await fetchCuratedCollections();
            setCollections(fetchedCollections);
            
            // Auto-select first collection if available
            if (fetchedCollections.length > 0 && !selectedCollection) {
                setSelectedCollection(fetchedCollections[0]);
            }
        } catch (err) {
            console.error('Error loading collections:', err);
            setError('Failed to load curated collections');
        } finally {
            setLoading(false);
        }
    };

    const loadOutfits = async (collectionId) => {
        try {
            setLoading(true);
            const fetchedOutfits = await fetchCollectionOutfits(collectionId);
            setOutfits(fetchedOutfits);
        } catch (err) {
            console.error('Error loading outfits:', err);
            setError('Failed to load outfits');
        } finally {
            setLoading(false);
        }
    };

    const handleUseOutfit = async (outfit, collectionId) => {
        if (!user) {
            alert('Please sign in to use this outfit');
            return;
        }

        try {
            setSavingSession(true);
            await saveOutfitSession(user.uid, outfit, collectionId);
            
            // Show success message
            alert(`Outfit "${outfit.title}" has been saved to your session!`);
        } catch (err) {
            console.error('Error saving outfit session:', err);
            alert('Failed to save outfit session. Please try again.');
        } finally {
            setSavingSession(false);
        }
    };

    if (loading && collections.length === 0) {
        return (
            <div className="curated-outfits-section">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading curated outfits...</p>
                </div>
            </div>
        );
    }

    if (error && collections.length === 0) {
        return (
            <div className="curated-outfits-section">
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={loadCollections} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (collections.length === 0) {
        return null;
    }

    return (
        <div className="curated-outfits-section">
            <div className="curated-outfits-header">
                <h2 className="section-title">Curated Outfits</h2>
                <p className="section-subtitle">Ready-to-wear outfits selected by our stylists</p>
            </div>

            {/* Collection Tabs */}
            <div className="collections-tabs">
                {collections.map((collection) => (
                    <button
                        key={collection.id}
                        className={`collection-tab ${selectedCollection?.id === collection.id ? 'active' : ''}`}
                        onClick={() => setSelectedCollection(collection)}
                    >
                        {collection.name}
                    </button>
                ))}
            </div>

            {/* Outfits Grid */}
            {loading && outfits.length === 0 ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading outfits...</p>
                </div>
            ) : error && outfits.length === 0 ? (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => loadOutfits(selectedCollection.id)} className="retry-btn">
                        Retry
                    </button>
                </div>
            ) : outfits.length === 0 ? (
                <div className="empty-state">
                    <p>No outfits available in this collection.</p>
                </div>
            ) : (
                <div className="outfits-grid">
                    {outfits.map((outfit) => (
                        <CuratedOutfitCard
                            key={outfit.id}
                            outfit={outfit}
                            collectionId={selectedCollection.id}
                            onUseOutfit={handleUseOutfit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CuratedOutfitsSection;


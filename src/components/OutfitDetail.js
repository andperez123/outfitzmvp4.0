import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { fetchOutfitById, saveOutfitSession } from '../services/curatedOutfitsService';
import { analytics } from '../firebase-config';
import { logEvent } from 'firebase/analytics';
import './OutfitDetail.css';

const OutfitDetail = () => {
    const { outfitId } = useParams();
    const navigate = useNavigate();
    const { user } = useProfile();
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingSession, setSavingSession] = useState(false);

    useEffect(() => {
        if (outfitId) {
            loadOutfit();
        }
    }, [outfitId]);

    const loadOutfit = async () => {
        try {
            setLoading(true);
            setError(null);
            const outfitData = await fetchOutfitById(outfitId);
            setOutfit(outfitData);
        } catch (err) {
            console.error('Error loading outfit:', err);
            setError('Failed to load outfit details');
        } finally {
            setLoading(false);
        }
    };

    const handleRetailerClick = (retailerName, productUrl, productName) => {
        // Track analytics event
        if (analytics) {
            try {
                logEvent(analytics, 'retailer_link_clicked', {
                    outfit_id: outfitId,
                    retailer_name: retailerName,
                    product_name: productName,
                    product_url: productUrl
                });
            } catch (error) {
                console.log('Analytics not available:', error);
            }
        }
        
        // Open retailer link in new tab
        window.open(productUrl, '_blank', 'noopener,noreferrer');
    };

    const handleUseOutfit = async () => {
        if (!user) {
            alert('Please sign in to use this outfit');
            return;
        }

        try {
            setSavingSession(true);
            await saveOutfitSession(user.uid, outfit, outfit.collectionId);
            
            // Track analytics
            if (analytics) {
                try {
                    logEvent(analytics, 'curated_outfit_selected', {
                        outfit_id: outfitId,
                        collection_id: outfit.collectionId,
                        outfit_title: outfit.title
                    });
                } catch (error) {
                    console.log('Analytics not available:', error);
                }
            }
            
            // Show success message
            alert(`Outfit "${outfit.title}" has been saved to your session!`);
        } catch (err) {
            console.error('Error saving outfit session:', err);
            alert('Failed to save outfit session. Please try again.');
        } finally {
            setSavingSession(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!outfit?.components || outfit.components.length === 0) return null;
        
        const total = outfit.components.reduce((sum, component) => {
            return sum + (parseFloat(component.price) || 0);
        }, 0);
        
        return total > 0 ? `$${total.toFixed(2)}` : null;
    };

    if (loading) {
        return (
            <div className="outfit-detail-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading outfit details...</p>
                </div>
            </div>
        );
    }

    if (error || !outfit) {
        return (
            <div className="outfit-detail-page">
                <div className="error-container">
                    <h2>Outfit Not Found</h2>
                    <p>{error || 'The outfit you\'re looking for doesn\'t exist.'}</p>
                    <button onClick={() => navigate('/')} className="back-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const totalPrice = calculateTotalPrice();

    return (
        <div className="outfit-detail-page">
            <button onClick={() => navigate(-1)} className="back-button">
                ← Back
            </button>

            <div className="outfit-detail-container">
                {/* Hero Image */}
                <div className="outfit-hero-section">
                    {outfit.imageUrl || outfit.heroImage ? (
                        <img 
                            src={outfit.imageUrl || outfit.heroImage} 
                            alt={outfit.title}
                            className="outfit-hero-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/Logo.png';
                            }}
                            loading="eager"
                        />
                    ) : (
                        <div className="outfit-hero-placeholder">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                    )}
                </div>

                {/* Outfit Info */}
                <div className="outfit-info-section">
                    <div className="outfit-header">
                        <h1 className="outfit-title">{outfit.title}</h1>
                        {outfit.collectionName && (
                            <span className="outfit-collection-badge">{outfit.collectionName}</span>
                        )}
                    </div>

                    {outfit.description && (
                        <div className="outfit-description">
                            <p>{outfit.description}</p>
                        </div>
                    )}

                    {/* Style Tags */}
                    {outfit.styleTags && outfit.styleTags.length > 0 && (
                        <div className="outfit-tags">
                            {outfit.styleTags.map((tag, index) => (
                                <span key={index} className="outfit-tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Gender Info */}
                    {outfit.gender && (
                        <div className="outfit-meta">
                            <span className="meta-label">Gender:</span>
                            <span className="meta-value">{outfit.gender}</span>
                        </div>
                    )}

                    {/* Total Price */}
                    {totalPrice && (
                        <div className="outfit-total-price">
                            <span className="total-label">Total Price:</span>
                            <span className="total-amount">{totalPrice}</span>
                        </div>
                    )}

                    {/* Components */}
                    {outfit.components && outfit.components.length > 0 && (
                        <div className="outfit-components">
                            <h2 className="components-title">Outfit Components</h2>
                            <div className="components-list">
                                {outfit.components.map((component, index) => (
                                    <div key={index} className="component-card">
                                        <div className="component-image-container">
                                            {component.image ? (
                                                <img 
                                                    src={component.image} 
                                                    alt={component.name || `Component ${index + 1}`}
                                                    className="component-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/Logo.png';
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="component-image-placeholder">
                                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                        <polyline points="21 15 16 10 5 21"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="component-info">
                                            <h3 className="component-name">
                                                {component.name || `Component ${index + 1}`}
                                            </h3>
                                            {component.retailer && (
                                                <p className="component-retailer">{component.retailer}</p>
                                            )}
                                            {component.price && (
                                                <p className="component-price">
                                                    ${parseFloat(component.price).toFixed(2)}
                                                </p>
                                            )}
                                            {component.link && (
                                                <button
                                                    className="component-shop-btn"
                                                    onClick={() => handleRetailerClick(
                                                        component.retailer || 'Retailer',
                                                        component.link,
                                                        component.name
                                                    )}
                                                >
                                                    Shop Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legacy Products Support (for backwards compatibility) */}
                    {(!outfit.components || outfit.components.length === 0) && outfit.products && outfit.products.length > 0 && (
                        <div className="outfit-components">
                            <h2 className="components-title">Outfit Components</h2>
                            <div className="components-list">
                                {outfit.products.map((product, index) => (
                                    <div key={index} className="component-card">
                                        <div className="component-info">
                                            <h3 className="component-name">{product.name}</h3>
                                            {product.retailerName && (
                                                <p className="component-retailer">{product.retailerName}</p>
                                            )}
                                            {product.price && (
                                                <p className="component-price">
                                                    ${parseFloat(product.price).toFixed(2)}
                                                </p>
                                            )}
                                            {product.retailerUrl && (
                                                <button
                                                    className="component-shop-btn"
                                                    onClick={() => handleRetailerClick(
                                                        product.retailerName || 'Retailer',
                                                        product.retailerUrl,
                                                        product.name
                                                    )}
                                                >
                                                    Shop {product.retailerName || 'Here'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="outfit-actions">
                        <button 
                            className="use-outfit-btn"
                            onClick={handleUseOutfit}
                            disabled={savingSession}
                        >
                            {savingSession ? 'Saving...' : 'Use this Outfit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutfitDetail;


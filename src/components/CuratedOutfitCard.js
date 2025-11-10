import React from 'react';
import { useNavigate } from 'react-router-dom';
import { analytics } from '../firebase-config';
import { logEvent } from 'firebase/analytics';
import './CuratedOutfitCard.css';

const CuratedOutfitCard = ({ outfit, collectionId, onUseOutfit }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Track analytics event
        if (analytics) {
            try {
                logEvent(analytics, 'outfit_card_clicked', {
                    outfit_id: outfit.id,
                    collection_id: collectionId,
                    outfit_title: outfit.title
                });
            } catch (error) {
                console.log('Analytics not available:', error);
            }
        }
        
        // Navigate to outfit detail page
        navigate(`/outfit/${outfit.id}`);
    };

    const handleRetailerClick = (e, retailerName, productUrl) => {
        // Stop event propagation to prevent card click
        e.stopPropagation();
        // Track analytics event
        if (analytics) {
            try {
                logEvent(analytics, 'retailer_link_clicked', {
                    outfit_id: outfit.id,
                    collection_id: collectionId,
                    retailer_name: retailerName,
                    product_url: productUrl
                });
            } catch (error) {
                console.log('Analytics not available:', error);
            }
        }
        
        // Open retailer link in new tab
        window.open(productUrl, '_blank', 'noopener,noreferrer');
    };

    const handleUseOutfit = () => {
        // Track analytics event
        if (analytics) {
            try {
                logEvent(analytics, 'curated_outfit_selected', {
                    outfit_id: outfit.id,
                    collection_id: collectionId,
                    outfit_title: outfit.title
                });
            } catch (error) {
                console.log('Analytics not available:', error);
            }
        }
        
        // Call parent handler
        if (onUseOutfit) {
            onUseOutfit(outfit, collectionId);
        }
    };

    const calculateTotalPrice = () => {
        if (!outfit.products || outfit.products.length === 0) return null;
        
        const total = outfit.products.reduce((sum, product) => {
            return sum + (parseFloat(product.price) || 0);
        }, 0);
        
        return total > 0 ? `$${total.toFixed(2)}` : null;
    };

    const totalPrice = calculateTotalPrice();

    return (
        <div className="curated-outfit-card" onClick={handleCardClick}>
            <div className="outfit-card-image-container">
                {outfit.imageUrl ? (
                    <img 
                        src={outfit.imageUrl} 
                        alt={outfit.title} 
                        className="outfit-card-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/Logo.png';
                        }}
                        loading="lazy"
                    />
                ) : (
                    <div className="outfit-card-placeholder">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                )}
            </div>

            <div className="outfit-card-content">
                <h3 className="outfit-card-title">{outfit.title}</h3>
                
                {outfit.description && (
                    <p className="outfit-card-description">{outfit.description}</p>
                )}

                {outfit.products && outfit.products.length > 0 && (
                    <div className="outfit-card-products">
                        <h4 className="products-title">Products</h4>
                        <div className="products-list">
                            {outfit.products.map((product, index) => (
                                <div key={index} className="product-item">
                                    <div className="product-info">
                                        <span className="product-name">{product.name}</span>
                                        {product.price && (
                                            <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                                        )}
                                    </div>
                                    {product.retailerUrl && (
                                        <button
                                            className="product-link-btn"
                                            onClick={(e) => handleRetailerClick(e, product.retailerName || 'Unknown', product.retailerUrl)}
                                        >
                                            Shop {product.retailerName || 'Here'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {totalPrice && (
                    <div className="outfit-card-total">
                        <span className="total-label">Total Price:</span>
                        <span className="total-amount">{totalPrice}</span>
                    </div>
                )}

                <button 
                    className="use-outfit-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUseOutfit();
                    }}
                >
                    Use this Outfit
                </button>
            </div>
        </div>
    );
};

export default CuratedOutfitCard;


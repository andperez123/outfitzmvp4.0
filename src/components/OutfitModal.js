import React from 'react';
import './OutfitModal.css';

const OutfitModal = ({ generatedOutfit, handleCloseModal, gender }) => {
    const handleAmazonSearch = (searchQuery) => {
        const baseUrl = 'https://www.amazon.com/s';
        const genderPrefix = gender === 'male' ? "men's" : gender === 'female' ? "women's" : "";
        const formattedQuery = encodeURIComponent(`${genderPrefix} ${searchQuery}`.trim());
        const searchUrl = `${baseUrl}?k=${formattedQuery}`;
        
        try {
            window.open(searchUrl, '_blank');
        } catch (error) {
            console.error('Error opening window:', error);
        }
    };

    const outfitItems = [
        {
            title: 'Top',
            description: generatedOutfit.components?.top || '',
            shortDesc: generatedOutfit.components?.shortTopDescription || '',
            searchQuery: generatedOutfit.components?.shortTopDescription || ''
        },
        {
            title: 'Bottom',
            description: generatedOutfit.components?.bottom || '',
            shortDesc: generatedOutfit.components?.shortBottomDescription || '',
            searchQuery: generatedOutfit.components?.shortBottomDescription || ''
        },
        {
            title: 'Shoes',
            description: generatedOutfit.components?.shoes || '',
            shortDesc: generatedOutfit.components?.shortShoesDescription || '',
            searchQuery: generatedOutfit.components?.shortShoesDescription || ''
        },
        {
            title: 'Accessory',
            description: generatedOutfit.components?.accessory || '',
            shortDesc: generatedOutfit.components?.shortAccessoryDescription || '',
            searchQuery: generatedOutfit.components?.shortAccessoryDescription || ''
        }
    ];

    return (
        <div className="modern-modal-overlay" onClick={handleCloseModal}>
            <div className="modern-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-content">
                        <h2 className="modal-title">{generatedOutfit.title || 'Your Outfit'}</h2>
                        <button className="modern-close-button" onClick={handleCloseModal} aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Image Section */}
                <div className="modal-image-section">
                    {generatedOutfit.imageUrl === 'pending' ? (
                        <div className="image-loading-container">
                            <div className="loading-spinner-small"></div>
                            <p className="loading-text">Generating your outfit image...</p>
                        </div>
                    ) : generatedOutfit.imageUrl ? (
                        <div className="image-wrapper">
                            <img 
                                src={generatedOutfit.imageUrl} 
                                alt={generatedOutfit.title || "Generated Outfit"} 
                                className="outfit-image"
                            />
                        </div>
                    ) : null}
                </div>

                {/* Outfit Items Grid */}
                <div className="outfit-items-section">
                    <div className="outfit-items-grid">
                        {outfitItems.map((item, index) => (
                            <div key={index} className="outfit-item-card">
                                <div className="item-header">
                                    <h3 className="item-title">{item.title}</h3>
                                </div>
                                <div className="item-content">
                                    <p className="item-description">{item.description}</p>
                                    {item.shortDesc && (
                                        <div className="item-actions">
                                            <button 
                                                className="item-short-desc"
                                                onClick={() => handleAmazonSearch(item.searchQuery)}
                                            >
                                                {item.shortDesc}
                                            </button>
                                            <button 
                                                className="shop-button"
                                                onClick={() => handleAmazonSearch(item.searchQuery)}
                                            >
                                                <span>Shop on Amazon</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutfitModal;

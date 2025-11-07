import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StyleGrid.css';
import { useOutfitGeneration } from '../hooks/useOutfitGeneration';
import { useProfile } from '../hooks/useProfile';
import { auth } from '../firebase-config';
import OutfitModal from './OutfitModal';
import ErrorBoundary from './ErrorBoundary';
import OutfitGenerator from './OutfitGenerator';
import CuratedOutfitsSection from './CuratedOutfitsSection';

const StyleGrid = () => {
  const navigate = useNavigate();
  const [outfitDescription, setOutfitDescription] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const {
    user,
    handleGoogleSignIn,
    gender,
    bodyType,
    ethnicity,
    height,
    hairType,
    presentation,
    styleTags,
    colors,
    budget,
    location
  } = useProfile();

  const {
    isLoading,
    error,
    generatedOutfit,
    isOutfitVisible,
    handleSubmit: handleOutfitSubmit,
    handleCloseModal
  } = useOutfitGeneration();

  // All available curated collections
  const allCuratedCollections = [
    {
      id: 'date-night',
      title: 'Date Night',
      description: 'Polished & Effortless',
      image: '/images/styles/WClassicPreppy.png',
      style: 'Classic/Preppy',
      gender: 'all',
      tags: ['classic', 'preppy', 'formal', 'elegant']
    },
    {
      id: 'work-mode',
      title: 'Work Mode',
      description: 'Tailored & Sharp',
      image: '/images/styles/Mpreppy.png',
      style: 'Classic/Preppy',
      gender: 'all',
      tags: ['classic', 'preppy', 'business', 'professional']
    },
    {
      id: 'casual',
      title: 'Casual Vibes',
      description: 'Relaxed & Comfortable',
      image: '/images/styles/WStreetwear.png',
      style: 'Casual/Streetwear',
      gender: 'all',
      tags: ['casual', 'streetwear', 'relaxed']
    },
    {
      id: 'athleisure',
      title: 'Athleisure',
      description: 'Sleek & Athletic',
      image: '/images/styles/WAthlesiure.png',
      style: 'Athleisure',
      gender: 'all',
      tags: ['athleisure', 'athletic', 'sporty']
    },
    {
      id: 'minimal',
      title: 'Minimal',
      description: 'Clean & Simple',
      image: '/images/styles/Mminimal.png',
      style: 'Minimal',
      gender: 'all',
      tags: ['minimal', 'simple', 'clean']
    },
    {
      id: 'vintage',
      title: 'Vintage',
      description: 'Retro & Timeless',
      image: '/images/styles/Mvintage.png',
      style: 'Vintage',
      gender: 'all',
      tags: ['vintage', 'retro', 'classic']
    },
    {
      id: 'streetwear',
      title: 'Streetwear',
      description: 'Urban & Edgy',
      image: '/images/styles/Mstreetwear.png',
      style: 'Streetwear',
      gender: 'all',
      tags: ['streetwear', 'urban', 'edgy']
    },
    {
      id: 'boho',
      title: 'Boho',
      description: 'Free & Flowing',
      image: '/images/styles/Mboho.png',
      style: 'Boho',
      gender: 'all',
      tags: ['boho', 'bohemian', 'free-spirited']
    }
  ];

  // Filter curated collections based on user profile
  const getFilteredCollections = () => {
    if (!user || !gender) {
      // Show all collections if user not logged in or no gender set
      return allCuratedCollections;
    }

    let filtered = allCuratedCollections;

    // Filter by gender preference if available
    // (Collections marked as 'all' are always shown)

    // Filter by style tags if user has preferences
    if (styleTags && styleTags.length > 0) {
      const userTags = styleTags.map(tag => tag.toLowerCase());
      filtered = filtered.filter(collection => {
        // Check if any collection tags match user's style tags
        return collection.tags.some(tag => 
          userTags.some(userTag => 
            tag.includes(userTag) || userTag.includes(tag)
          )
        );
      });

      // If filtering resulted in empty array, show all collections
      if (filtered.length === 0) {
        filtered = allCuratedCollections;
      }
    }

    return filtered;
  };

  const curatedCollections = getFilteredCollections();

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!outfitDescription.trim()) {
      return;
    }

    // Use saved profile data if available, otherwise use empty strings (will be filtered out)
    handleOutfitSubmit({
      gender: gender || '',
      bodyType: bodyType || '',
      ethnicity: ethnicity || '',
      height: height || '',
      hairType: hairType || '',
      presentation: presentation || '',
      styleTags: styleTags || [],
      colors: colors || [],
      vibe: '',
      comfortLevel: '',
      adventurous: '',
      focus: '',
      userInput: outfitDescription
    });
  };

  const handleCollectionClick = (collection) => {
    setOutfitDescription(`${collection.title} style - ${collection.description}`);
  };

  const handleCustomizeClick = () => {
    setShowCustomizer(true);
  };

  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
  };

  const getUserName = () => {
    if (user && user.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'there';
  };

  return (
    <div className="modern-app-container">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-left">
          {/* Reserved for future features */}
        </div>
        
        <div className="header-center">
          <h1 className="app-logo">Outfitz</h1>
        </div>
        
        <div className="header-right">
          <a href="#feedback" className="feedback-link" onClick={(e) => { e.preventDefault(); }}>Send Feedback</a>
          <button className="bookmark-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          {user ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="profile-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img 
                  src={user.photoURL || '/Logo.png'} 
                  alt={user.displayName || 'Profile'} 
                  className="profile-avatar"
                />
              </button>
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <img 
                      src={user.photoURL || '/Logo.png'} 
                      alt={user.displayName || 'Profile'} 
                      className="user-menu-avatar"
                    />
                    <div className="user-menu-info">
                      <p className="user-menu-name">{user.displayName}</p>
                      <p className="user-menu-email">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    className="user-menu-item"
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                  >
                    View Profile
                  </button>
                  <button 
                    className="user-menu-item"
                    onClick={() => {
                      auth.signOut();
                      setShowUserMenu(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="profile-button" onClick={handleGoogleSignIn}>
              <div className="profile-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="modern-main">
        {/* Personalized Greeting */}
        <div className="greeting-section">
          <h2 className="greeting-text">
            <span className="greeting-icon">✨</span>
            Hi {getUserName()}. Tell me, what's the event, mood, or product that you're shopping for today?
          </h2>
        </div>

        {/* Main Input Field */}
        <div className="input-section">
          <form onSubmit={handleQuickSubmit} className="main-input-form">
            <div className="input-wrapper">
              <input
                type="text"
                className="main-input"
                placeholder="Describe what you're shopping for..."
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
              />
              <div className="input-actions">
                <button type="button" className="image-upload-button" title="Upload image">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading || !outfitDescription.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Curated Collections */}
        <div className="collections-section">
          <h3 className="section-title">Curated Collections</h3>
          <div className="collections-scroll">
            {curatedCollections.map((collection) => (
              <div 
                key={collection.id} 
                className="collection-card"
                onClick={() => handleCollectionClick(collection)}
              >
                <div className="collection-image-wrapper">
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/Logo.png';
                    }}
                  />
                </div>
                <div className="collection-info">
                  <h4 className="collection-title">{collection.title}</h4>
                  <p className="collection-description">{collection.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Outfits Section */}
        <CuratedOutfitsSection />

        {/* Welcome Section */}
        <div className="welcome-section">
          <h3 className="welcome-title">Welcome</h3>
          <p className="welcome-subtitle">Build your personal style profile</p>
          <div className="welcome-scroll">
            <div className="welcome-card personalize-card">
              <button className="personalize-button" onClick={handleCustomizeClick}>
                Build Your Profile
              </button>
            </div>
            {/* Additional welcome cards can be added here */}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Generating your perfect outfit...</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {isOutfitVisible && generatedOutfit && (
        <ErrorBoundary>
          <OutfitModal 
            generatedOutfit={generatedOutfit}
            handleCloseModal={handleCloseModal}
            gender="all"
          />
        </ErrorBoundary>
      )}

      {showCustomizer && (
        <OutfitGenerator onClose={handleCloseCustomizer} />
      )}
    </div>
  );
};

export default StyleGrid;

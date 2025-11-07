import React, { useState, useEffect } from 'react';
import MaleQuestions from './MaleQuestions';
import FemaleQuestions from './FemaleQuestions';
import PhysicalAttributes from './PhysicalAttributes';
import OutfitModal from './OutfitModal';
import './OutfitGenerator.css';
import { auth} from '../firebase-config';
import { useProfile } from '../hooks/useProfile';
import { useOutfitGeneration } from '../hooks/useOutfitGeneration';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error, errorInfo);
    }

render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please try again.</div>;
        }

        return this.props.children;
    }
}

const OutfitGenerator = ({ onClose }) => {
    // Form state
    const [gender, setGender] = useState('');
    const [vibe, setVibe] = useState('');
    const [comfortLevel, setComfortLevel] = useState('');
    const [adventurous, setAdventurous] = useState('');
    const [focus, setFocus] = useState('');
    const [userInput, setUserInput] = useState('');

    // Get outfit generation functionality from hook
    const {
        isLoading,
        error,
        generatedOutfit,
        isOutfitVisible,
        handleSubmit: handleOutfitSubmit,
        handleCloseModal
    } = useOutfitGeneration();

    // Get profile functionality from hook - includes saved profile data
    const {
        user,
        gender: savedGender,
        bodyType,
        ethnicity,
        height,
        hairType,
        presentation,
        styleTags,
        colors,
        budget,
        location,
        setBodyType,
        setEthnicity,
        setHeight,
        setHairType,
        isProfileSaved,
        handleGoogleSignIn,
        saveUserProfile
    } = useProfile();

    // Initialize gender from saved profile when component loads
    useEffect(() => {
        if (savedGender && !gender) {
            setGender(savedGender);
        }
    }, [savedGender, gender]);

    // Replace the old handleSubmit with this new one
    const onSubmit = (e) => {
        e.preventDefault();
        // Use saved profile data if available, otherwise use form values
        // Empty strings will be filtered out in the prompt builder
        handleOutfitSubmit({
            gender: gender || savedGender || '',
            bodyType: bodyType || '',
            ethnicity: ethnicity || '',
            height: height || '',
            hairType: hairType || '',
            presentation: presentation || '',
            styleTags: styleTags || [],
            colors: colors || [],
            vibe: vibe || '',
            comfortLevel: comfortLevel || '',
            adventurous: adventurous || '',
            focus: focus || '',
            userInput: userInput || ''
        });
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="profile-modal-header">
                    <div className="profile-header-content">
                        <div>
                            <h1 className="profile-modal-title">Build Your Style Profile</h1>
                            <p className="profile-modal-subtitle">Tell us about yourself so we can create the perfect outfits for you.</p>
                        </div>
                        <button 
                            className="profile-close-button" 
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Auth Section */}
                    <div className="profile-auth-section">
                        {user ? (
                            <div className="profile-user-info">
                                <img 
                                    src={user.photoURL} 
                                    alt="Profile" 
                                    className="profile-user-avatar"
                                />
                                <div className="profile-user-details">
                                    <span className="profile-user-name">{user.displayName}</span>
                                    <button 
                                        className="profile-signout-button"
                                        onClick={() => auth.signOut()}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                className="profile-google-button"
                                onClick={handleGoogleSignIn}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="profile-form-container">
                    <form onSubmit={onSubmit} className="profile-form">
                        <div className="gender-selection">
                            <label className={`radio-label ${gender === 'male' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <span>Male</span>
                            </label>
                            <label className={`radio-label ${gender === 'female' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <span>Female</span>
                            </label>
                        </div>

                        {gender && (
                            <div className="questions-container">
                                <PhysicalAttributes
                                    bodyType={bodyType}
                                    setBodyType={setBodyType}
                                    ethnicity={ethnicity}
                                    setEthnicity={setEthnicity}
                                    height={height}
                                    setHeight={setHeight}
                                    hairType={hairType}
                                    setHairType={setHairType}
                                    user={user}
                                    onSaveProfile={saveUserProfile}
                                    isProfileSaved={isProfileSaved}
                                    handleGoogleSignIn={handleGoogleSignIn}
                                />

                                <div className="section-divider"></div>

                                <div className="style-questions-section">
                                    <h2>Style Preferences</h2>
                                    {gender === 'male' && (
                                        <MaleQuestions 
                                            setVibe={setVibe}
                                            setComfortLevel={setComfortLevel}
                                            setAdventurous={setAdventurous}
                                            setFocus={setFocus}
                                        />
                                    )}
                                    {gender === 'female' && (
                                        <FemaleQuestions 
                                            setVibe={setVibe}
                                            setComfortLevel={setComfortLevel}
                                            setAdventurous={setAdventurous}
                                            setFocus={setFocus}
                                        />
                                    )}
                                </div>

                                <div className="custom-input-section">
                                    <label htmlFor="outfit-description" className="input-label">
                                        Additional Details
                                    </label>
                                    <textarea
                                        id="outfit-description"
                                        className="textarea"
                                        placeholder="Describe the outfit you want or any specific requirements..."
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        rows="4"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="generate-button" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <span>Generate Outfit</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}
                </div>

                {isOutfitVisible && generatedOutfit && (
                    <ErrorBoundary>
                        <OutfitModal 
                            generatedOutfit={generatedOutfit}
                            handleCloseModal={handleCloseModal}
                            gender={gender}
                        />
                    </ErrorBoundary>
                )}
            </div>
        </div>
    );
};

export default OutfitGenerator;

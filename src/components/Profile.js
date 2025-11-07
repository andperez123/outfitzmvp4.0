import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { auth } from '../firebase-config';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const {
        user,
        loading,
        saving,
        gender,
        setGender,
        presentation,
        setPresentation,
        bodyType,
        setBodyType,
        ethnicity,
        setEthnicity,
        height,
        setHeight,
        hairType,
        setHairType,
        sizes,
        setSizes,
        fitPreferences,
        setFitPreferences,
        styleTags,
        setStyleTags,
        colors,
        setColors,
        budget,
        setBudget,
        location,
        setLocation,
        updateProfileField
    } = useProfile();

    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [saveStatus, setSaveStatus] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleEdit = (field, currentValue) => {
        setEditingField(field);
        setTempValue(Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue || ''));
    };

    const handleSave = async (field) => {
        try {
            let valueToSave = tempValue;
            
            // Handle nested fields (sizes, fitPreferences)
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                const parentValue = parent === 'sizes' ? sizes : fitPreferences;
                const updated = { ...parentValue, [child]: valueToSave };
                
                if (parent === 'sizes') {
                    setSizes(updated);
                    await updateProfileField('sizes', updated);
                } else {
                    setFitPreferences(updated);
                    await updateProfileField('fitPreferences', updated);
                }
            } else if (field === 'styleTags' || field === 'colors') {
                // Handle array fields - split by comma and trim
                const arrayValue = valueToSave.split(',').map(item => item.trim()).filter(item => item);
                if (field === 'styleTags') {
                    setStyleTags(arrayValue);
                    await updateProfileField('styleTags', arrayValue);
                } else {
                    setColors(arrayValue);
                    await updateProfileField('colors', arrayValue);
                }
            } else {
                // Handle simple fields
                const setterMap = {
                    gender: setGender,
                    presentation: setPresentation,
                    bodyType: setBodyType,
                    ethnicity: setEthnicity,
                    height: setHeight,
                    hairType: setHairType,
                    budget: setBudget,
                    location: setLocation
                };
                
                if (setterMap[field]) {
                    setterMap[field](valueToSave);
                    await updateProfileField(field, valueToSave);
                }
            }
            
            setEditingField(null);
            setSaveStatus({ type: 'success', message: 'Saved successfully!' });
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Error saving field:', error);
            // Show more detailed error message
            let errorMessage = 'Failed to save. Please try again.';
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firestore security rules.';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            setSaveStatus({ type: 'error', message: errorMessage });
            setTimeout(() => setSaveStatus(null), 5000);
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue('');
    };

    const renderEditableField = (label, field, value, type = 'text', options = null) => {
        const isEditing = editingField === field;
        const displayValue = Array.isArray(value) ? value.join(', ') : (value || 'Not set');

        return (
            <div className="profile-field">
                <label className="profile-field-label">{label}</label>
                {isEditing ? (
                    <div className="profile-field-edit">
                        {type === 'select' && options ? (
                            <select
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="profile-field-input"
                            >
                                <option value="">Select an option</option>
                                {options.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={type}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="profile-field-input"
                                autoFocus
                            />
                        )}
                        <div className="profile-field-actions">
                            <button
                                type="button"
                                onClick={() => handleSave(field)}
                                className="profile-save-btn"
                                disabled={saving}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="profile-cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-field-display">
                        <span className="profile-field-value">{displayValue}</span>
                        <button
                            type="button"
                            onClick={() => handleEdit(field, value)}
                            className="profile-edit-btn"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderNestedField = (label, fieldPrefix, nestedObject) => {
        return (
            <div className="profile-section">
                <h3 className="profile-section-title">{label}</h3>
                {Object.keys(nestedObject).map(key => {
                    const field = `${fieldPrefix}.${key}`;
                    const labelMap = {
                        top: 'Top',
                        bottom: 'Bottom',
                        shoes: 'Shoes',
                        dress: 'Dress'
                    };
                    return (
                        <div key={key}>
                            {renderEditableField(labelMap[key] || key, field, nestedObject[key])}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button onClick={() => navigate('/')} className="profile-back-btn">
                    ← Back
                </button>
                <h1 className="profile-title">My Profile</h1>
                <div className="profile-user-header">
                    {user.photoURL && (
                        <img src={user.photoURL} alt={user.displayName} className="profile-avatar-large" />
                    )}
                    <div>
                        <h2>{user.displayName}</h2>
                        <p className="profile-email">{user.email}</p>
                    </div>
                </div>
            </div>

            {saveStatus && (
                <div className={`profile-status-message ${saveStatus.type}`}>
                    {saveStatus.message}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-section">
                    <h2 className="profile-section-header">Basic Information</h2>
                    {renderEditableField('Gender', 'gender', gender, 'select', [
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'non-binary', label: 'Non-binary' },
                        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ])}
                    {renderEditableField('Presentation', 'presentation', presentation, 'select', [
                        { value: 'masculine', label: 'Masculine' },
                        { value: 'feminine', label: 'Feminine' },
                        { value: 'androgynous', label: 'Androgynous' },
                        { value: 'fluid', label: 'Fluid' }
                    ])}
                    {renderEditableField('Body Type', 'bodyType', bodyType, 'select', [
                        { value: 'slim', label: 'Slim' },
                        { value: 'athletic', label: 'Athletic' },
                        { value: 'average', label: 'Average' },
                        { value: 'curvy', label: 'Curvy' },
                        { value: 'plus-size', label: 'Plus Size' }
                    ])}
                    {renderEditableField('Ethnicity', 'ethnicity', ethnicity, 'select', [
                        { value: 'asian', label: 'Asian' },
                        { value: 'black', label: 'Black' },
                        { value: 'hispanic', label: 'Hispanic' },
                        { value: 'white', label: 'White' },
                        { value: 'middle-eastern', label: 'Middle Eastern' },
                        { value: 'mixed', label: 'Mixed' },
                        { value: 'other', label: 'Other' }
                    ])}
                    {renderEditableField('Height', 'height', height, 'select', [
                        { value: 'petite', label: 'Petite (Under 5\'3")' },
                        { value: 'average', label: 'Average (5\'4" - 5\'7")' },
                        { value: 'tall', label: 'Tall (5\'8" - 5\'11")' },
                        { value: 'very-tall', label: 'Very Tall (6\'0" and above)' }
                    ])}
                    {renderEditableField('Hair Type', 'hairType', hairType, 'select', [
                        { value: 'straight', label: 'Straight' },
                        { value: 'wavy', label: 'Wavy' },
                        { value: 'curly', label: 'Curly' },
                        { value: 'coily', label: 'Coily' },
                        { value: 'bald', label: 'Bald' }
                    ])}
                </div>

                {renderNestedField('Sizes', 'sizes', sizes)}
                {renderNestedField('Fit Preferences', 'fitPreferences', fitPreferences)}

                <div className="profile-section">
                    <h2 className="profile-section-header">Style Preferences</h2>
                    {renderEditableField(
                        'Style Tags',
                        'styleTags',
                        styleTags,
                        'text'
                    )}
                    <p className="profile-field-hint">Comma-separated (e.g., casual, streetwear, minimal)</p>
                    {renderEditableField(
                        'Preferred Colors',
                        'colors',
                        colors,
                        'text'
                    )}
                    <p className="profile-field-hint">Comma-separated (e.g., black, navy, white)</p>
                </div>

                <div className="profile-section">
                    <h2 className="profile-section-header">Shopping Preferences</h2>
                    {renderEditableField('Budget Range', 'budget', budget, 'select', [
                        { value: 'under-50', label: 'Under $50' },
                        { value: '50-100', label: '$50 - $100' },
                        { value: '100-200', label: '$100 - $200' },
                        { value: '200-500', label: '$200 - $500' },
                        { value: '500-plus', label: '$500+' }
                    ])}
                    {renderEditableField('Location', 'location', location)}
                </div>

                <div className="profile-actions">
                    <button
                        onClick={() => auth.signOut()}
                        className="profile-signout-btn"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;


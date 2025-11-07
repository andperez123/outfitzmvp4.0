import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase-config';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const useProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Profile fields
    const [gender, setGender] = useState('');
    const [presentation, setPresentation] = useState('');
    const [bodyType, setBodyType] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [height, setHeight] = useState('');
    const [hairType, setHairType] = useState('');
    const [sizes, setSizes] = useState({
        top: '',
        bottom: '',
        shoes: '',
        dress: ''
    });
    const [fitPreferences, setFitPreferences] = useState({
        top: '',
        bottom: ''
    });
    const [styleTags, setStyleTags] = useState([]);
    const [colors, setColors] = useState([]);
    const [budget, setBudget] = useState('');
    const [location, setLocation] = useState('');
    
    const [isProfileSaved, setIsProfileSaved] = useState(false);

    // Load profile from Firestore when user changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
            setUser(authUser);
            
            if (authUser) {
                await loadProfile(authUser.uid);
            } else {
                // Reset profile when user logs out
                resetProfile();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loadProfile = async (uid) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const profileData = userDoc.data();
                setGender(profileData.gender || '');
                setPresentation(profileData.presentation || '');
                setBodyType(profileData.bodyType || '');
                setEthnicity(profileData.ethnicity || '');
                setHeight(profileData.height || '');
                setHairType(profileData.hairType || '');
                setSizes(profileData.sizes || { top: '', bottom: '', shoes: '', dress: '' });
                setFitPreferences(profileData.fitPreferences || { top: '', bottom: '' });
                setStyleTags(profileData.styleTags || []);
                setColors(profileData.colors || []);
                setBudget(profileData.budget || '');
                setLocation(profileData.location || '');
                setIsProfileSaved(true);
            } else {
                resetProfile();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const resetProfile = () => {
        setGender('');
        setPresentation('');
        setBodyType('');
        setEthnicity('');
        setHeight('');
        setHairType('');
        setSizes({ top: '', bottom: '', shoes: '', dress: '' });
        setFitPreferences({ top: '', bottom: '' });
        setStyleTags([]);
        setColors([]);
        setBudget('');
        setLocation('');
        setIsProfileSaved(false);
    };

    const handleGoogleSignIn = async () => {
        try {
            console.log('Starting Google Sign In...');
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Sign in successful:', result.user);
            setUser(result.user);
        } catch (error) {
            console.error("Error signing in with Google: ", error.code, error.message);
        }
    };

    const saveUserProfile = async (profileData = null) => {
        if (!user) {
            console.error('Cannot save profile: User not authenticated');
            return;
        }

        setSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            const dataToSave = profileData || {
                gender,
                presentation,
                bodyType,
                ethnicity,
                height,
                hairType,
                sizes,
                fitPreferences,
                styleTags,
                colors,
                budget,
                location,
                updatedAt: new Date().toISOString()
            };

            // Check if document exists
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                await updateDoc(userDocRef, dataToSave);
            } else {
                await setDoc(userDocRef, {
                    ...dataToSave,
                    createdAt: new Date().toISOString()
                });
            }

            setIsProfileSaved(true);
            console.log('Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const updateProfileField = async (field, value) => {
        // Update local state immediately for responsive UI
        const updateState = {
            gender: setGender,
            presentation: setPresentation,
            bodyType: setBodyType,
            ethnicity: setEthnicity,
            height: setHeight,
            hairType: setHairType,
            sizes: setSizes,
            fitPreferences: setFitPreferences,
            styleTags: setStyleTags,
            colors: setColors,
            budget: setBudget,
            location: setLocation
        };

        if (updateState[field]) {
            updateState[field](value);
        }

        // Save to Firestore
        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                // Check if document exists, if not create it first
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    await updateDoc(userDocRef, {
                        [field]: value,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    // Create document if it doesn't exist
                    await setDoc(userDocRef, {
                        [field]: value,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
                
                console.log(`Successfully saved ${field} to Firestore`);
            } catch (error) {
                console.error(`Error updating ${field}:`, error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    field: field,
                    value: value
                });
                throw error;
            }
        } else {
            throw new Error('User not authenticated');
        }
    };

    return {
        user,
        loading,
        saving,
        // Profile fields
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
        isProfileSaved,
        handleGoogleSignIn,
        saveUserProfile,
        updateProfileField,
        loadProfile
    };
};
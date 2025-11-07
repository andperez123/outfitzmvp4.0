import { useState } from 'react';
import { generateImage, fetchOutfitData, parseDescription } from '../utils/gptWrapper';

export const useOutfitGeneration = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedOutfit, setGeneratedOutfit] = useState(null);
    const [isOutfitVisible, setIsOutfitVisible] = useState(false);

    const handleSubmit = async (formData) => {
        // Extract all fields from formData, including profile fields
        const {
            gender,
            bodyType,
            ethnicity,
            height,
            hairType,
            presentation,
            styleTags,
            colors,
            vibe,
            comfortLevel,
            adventurous,
            focus,
            userInput
        } = formData;

        // Allow generation even without gender if user has saved profile
        // Gender can be determined from profile or defaulted
        const finalGender = gender || 'all';

        setIsLoading(true);
        setError(null);
        setIsOutfitVisible(false);

        try {
            // Build comprehensive user details from profile and form data
            // Only include values that are actually specified (not empty, not "Not specified")
            const userDetails = [];
            
            const isSpecified = (value) => {
                return value && 
                       value !== 'Not specified' && 
                       value !== 'all' && 
                       value !== '' && 
                       value.trim() !== '';
            };
            
            if (isSpecified(finalGender)) {
                userDetails.push(`• Gender: ${finalGender}`);
            }
            if (isSpecified(presentation)) {
                userDetails.push(`• Presentation: ${presentation}`);
            }
            if (isSpecified(ethnicity)) {
                userDetails.push(`• Ethnicity: ${ethnicity}`);
            }
            if (isSpecified(bodyType)) {
                userDetails.push(`• Body Type: ${bodyType}`);
            }
            if (isSpecified(hairType)) {
                userDetails.push(`• Hair Type: ${hairType}`);
            }
            if (isSpecified(height)) {
                userDetails.push(`• Height: ${height}`);
            }
            if (styleTags && Array.isArray(styleTags) && styleTags.length > 0) {
                userDetails.push(`• Style Preferences: ${styleTags.join(', ')}`);
            }
            if (colors && Array.isArray(colors) && colors.length > 0) {
                userDetails.push(`• Preferred Colors: ${colors.join(', ')}`);
            }
            if (isSpecified(vibe)) {
                userDetails.push(`• Vibe: ${vibe}`);
            }
            if (isSpecified(comfortLevel)) {
                userDetails.push(`• Comfort Level: ${comfortLevel}`);
            }
            if (isSpecified(adventurous)) {
                userDetails.push(`• Adventurous: ${adventurous}`);
            }
            if (isSpecified(focus)) {
                userDetails.push(`• Focus: ${focus}`);
            }
            if (isSpecified(userInput)) {
                userDetails.push(`• Additional Description: ${userInput}`);
            }
            
            // If no details found, add a note
            if (userDetails.length === 0) {
                userDetails.push('• User Details: Not specified');
            }

            const prompt = `You are a personal stylist creating a modern, cohesive outfit. Keep descriptions brief and focused.

User Details:
${userDetails.join('\n')}

Generate a concise outfit description with:
1. Title: A brief, creative name for the outfit
2. Top: A short description of the top piece (1 sentence)
3. Short Top Description: A very brief, shopping-friendly description (5-7 words)
4. Bottom: A short description of the bottom piece (1 sentence)
5. Short Bottom Description: A very brief, shopping-friendly description (5-7 words)
6. Shoes: A short description of the footwear (1 sentence)
7. Short Shoes Description: A very brief, shopping-friendly description (5-7 words)
8. Accessory: A short description of one accessory (1 sentence)
9. Short Accessory Description: A very brief, shopping-friendly description (5-7 words)
10. Image Description: Create a casual, lifestyle scene (3-4 sentences):
    - Describe a person wearing the outfit in a natural setting
    - Include relevant background details (coffee shop, park, etc.)
    - Focus on how the outfit works with the environment
    - Keep the style casual and relatable

Keep descriptions concise and focus on creating a cohesive, practical outfit that matches the user's preferences.`;

            console.log("Prompt being sent to API:", prompt);
            
            console.log("1. Starting API call...");
            const outfitData = await fetchOutfitData(prompt);
            console.log("2. API Response received:", outfitData);
            
            const imagePrompt = outfitData.imagePrompt || outfitData.dallePrompt;
            console.log("3. Image Prompt:", imagePrompt);

            const outfitComponents = parseDescription(outfitData.description);
            console.log("4. Parsed Components:", outfitComponents);

            setGeneratedOutfit({
                title: outfitData.title || 'Custom Outfit',
                description: outfitData.description || 'No description provided',
                imagePrompt: imagePrompt,
                imageUrl: 'pending',
                components: outfitComponents
            });
            
            setIsOutfitVisible(true);

            console.log("5. Starting image generation...");
            try {
                // Pass outfit components to image generator for template-based prompt
                const imageUrl = await generateImage(imagePrompt, {
                    outfitComponents: {
                        top: outfitComponents.top || outfitComponents.shortTopDescription,
                        bottom: outfitComponents.bottom || outfitComponents.shortBottomDescription,
                        shoes: outfitComponents.shoes || outfitComponents.shortShoesDescription,
                        accessory: outfitComponents.accessory || outfitComponents.shortAccessoryDescription,
                        vibe: vibe || userInput || 'casual setting',
                        userInput: userInput
                    }
                });
                setGeneratedOutfit(prev => ({
                    ...prev,
                    imageUrl
                }));
            } catch (imageError) {
                console.error('Image generation failed:', imageError);
                setGeneratedOutfit(prev => ({
                    ...prev,
                    imageUrl: 'https://via.placeholder.com/1024x1024?text=Image+Generation+Failed'
                }));
                setError(`Failed to generate image: ${imageError.message}`);
            }

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            setError(error.message || "Failed to generate outfit");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsOutfitVisible(false);
    };

    return {
        isLoading,
        error,
        generatedOutfit,
        isOutfitVisible,
        handleSubmit,
        handleCloseModal
    };
};
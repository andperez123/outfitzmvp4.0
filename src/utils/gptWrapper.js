import { generateImage as generateImageWithAdapter } from './imageGeneration/imageGenerator';
import { fetchOutfitData as fetchOutfitDataViaFunction } from '../services/openaiService';

// Function to generate outfit data from OpenAI's GPT model via Firebase Cloud Functions
export const fetchOutfitData = async (prompt) => {
    try {
        // Call Firebase Cloud Function instead of direct API call
        const data = await fetchOutfitDataViaFunction(prompt);
        
        console.log("Raw API Response:", data);
        console.log("Message Content:", data.description);

        const message = data.description;
        const components = parseDescription(message);
        
        console.log("Parsed Components:", components);
        console.log("Image Description:", components.imageDescription);

        // Create image generation prompt
        let imagePrompt = "";
        
        if (components.imageDescription) {
            // Use the image description directly - GPT Image understands context better
            imagePrompt = components.imageDescription;
        } else {
            console.error("No image description found in components");
            imagePrompt = "A person wearing a stylish outfit";
        }

        console.log("Generated Image Prompt:", imagePrompt);

        return {
            title: components.title || "Generated Outfit",
            description: message,
            imagePrompt,
            components
        };
    } catch (error) {
        console.error("Error in fetchOutfitData:", error);
        throw new Error('Failed to generate outfit data');
    }
};

// Function to generate an image using the versioned adapter system
// Defaults to ChatGPT image model (gpt-image-latest) but can be configured via REACT_APP_IMAGE_MODEL
// Now uses Firebase Cloud Functions for secure API calls
export const generateImage = async (prompt, options = {}) => {
    if (!prompt) {
        throw new Error('Empty prompt provided for image generation');
    }

    // No need to check for API key - it's now handled by Firebase Functions
    // Use the new versioned adapter system
    return await generateImageWithAdapter(prompt, options);
}

// Function to parse the description
export const parseDescription = (description) => {
    const components = {
        title: '',
        top: '',
        shortTopDescription: '',
        bottom: '',
        shortBottomDescription: '',
        shoes: '',
        shortShoesDescription: '',
        accessory: '',
        shortAccessoryDescription: '',
        imageDescription: ''
    };

    try {
        const lines = description.split('\n').filter(line => line.trim());
        
        // First try to find the image description section as a whole
        const imageDescStart = description.indexOf('10. Image Description:');
        if (imageDescStart !== -1) {
            const nextSection = description.indexOf('11.', imageDescStart);
            const imageDesc = description.slice(
                imageDescStart + '10. Image Description:'.length,
                nextSection !== -1 ? nextSection : undefined
            ).trim();
            components.imageDescription = imageDesc;
        }

        // Parse other components
        lines.forEach(line => {
            const match = line.match(/^(\d+)\.\s*(.*?):\s*(.*)$/i);
            if (!match) return;

            const [, , type, content] = match;
            const cleanType = type.toLowerCase().trim();
            const cleanContent = content.trim().replace(/['"]/g, '');

            switch(cleanType) {
                case 'title':
                    components.title = cleanContent;
                    break;
                case 'top':
                    components.top = cleanContent;
                    break;
                case 'short top description':
                    components.shortTopDescription = cleanContent;
                    break;
                case 'bottom':
                    components.bottom = cleanContent;
                    break;
                case 'short bottom description':
                    components.shortBottomDescription = cleanContent;
                    break;
                case 'shoes':
                    components.shoes = cleanContent;
                    break;
                case 'short shoes description':
                    components.shortShoesDescription = cleanContent;
                    break;
                case 'accessory':
                    components.accessory = cleanContent;
                    break;
                case 'short accessory description':
                    components.shortAccessoryDescription = cleanContent;
                    break;
                default:
                    break;
            }
        });

        return components;
    } catch (error) {
        console.error('Error parsing description:', error);
        return components;
    }
};

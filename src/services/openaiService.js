import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase-config';

/**
 * Service for making secure OpenAI API calls through Firebase Cloud Functions
 * This replaces direct API calls to prevent API key exposure
 */

/**
 * Generate outfit data using OpenAI GPT-4
 * @param {string} prompt - The prompt to send to GPT-4
 * @returns {Promise<Object>} Object containing outfit description and parsed data
 */
export const fetchOutfitData = async (prompt) => {
  try {
    // Allow unauthenticated users to generate outfits
    const generateOutfit = httpsCallable(functions, 'generateOutfit');
    
    const result = await generateOutfit({ prompt });
    const data = result.data;

    if (!data.success) {
      throw new Error('Failed to generate outfit data');
    }

    // Parse the description to extract components
    const description = data.description;
    
    return {
      description: description,
      rawResponse: data.rawResponse
    };
  } catch (error) {
    console.error('Error in fetchOutfitData:', error);
    throw new Error(`Failed to generate outfit data: ${error.message}`);
  }
};

/**
 * Enhance a prompt using ChatGPT
 * @param {string} prompt - The original prompt
 * @param {Object} outfitComponents - Optional outfit components for context
 * @returns {Promise<string>} Enhanced prompt
 */
export const enhancePrompt = async (prompt, outfitComponents = {}) => {
  try {
    // Allow unauthenticated users to enhance prompts
    const enhancePromptFunction = httpsCallable(functions, 'enhancePrompt');
    
    const result = await enhancePromptFunction({ 
      prompt, 
      outfitComponents 
    });
    const data = result.data;

    if (!data.success) {
      throw new Error('Failed to enhance prompt');
    }

    return data.enhancedPrompt;
  } catch (error) {
    console.error('Error in enhancePrompt:', error);
    throw new Error(`Failed to enhance prompt: ${error.message}`);
  }
};

/**
 * Generate an image using OpenAI DALL-E
 * @param {string} prompt - The image generation prompt
 * @param {Object} options - Options for image generation (size, quality, etc.)
 * @returns {Promise<string>} URL of the generated image
 */
export const generateImage = async (prompt, options = {}) => {
  try {
    // Allow unauthenticated users to generate images
    const generateImageFunction = httpsCallable(functions, 'generateImage');
    
    const result = await generateImageFunction({ 
      prompt, 
      options 
    });
    const data = result.data;

    if (!data.success) {
      throw new Error('Failed to generate image');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('Error in generateImage:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};


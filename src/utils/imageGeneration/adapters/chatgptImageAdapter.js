import { BaseImageAdapter } from './baseAdapter';
import { enhancePrompt as enhancePromptViaFunction, generateImage as generateImageViaFunction } from '../../../services/openaiService';

/**
 * ChatGPT Image Generation Adapter
 * Uses Firebase Cloud Functions to securely enhance prompts and generate images
 */
export class ChatGPTImageAdapter extends BaseImageAdapter {
    constructor(config = {}) {
        super(config.modelName || 'gpt-image-latest', {
            version: '1.0.0',
            provider: 'openai',
            ...config
        });
    }

    /**
     * Generate an image using ChatGPT-enhanced prompt
     */
    async generate(prompt, options = {}) {
        const startTime = Date.now();
        
        try {
            // Extract outfit components from options if provided
            const outfitComponents = options.outfitComponents || {};
            
            // Step 1: Enhance prompt using ChatGPT with template
            const enhancedPrompt = await this.enhancePrompt(prompt, outfitComponents);
            
            // Step 2: Generate image using the enhanced prompt
            const imageUrl = await this.generateImage(enhancedPrompt, options);
            
            const latency = Date.now() - startTime;
            const cost = this.estimateCost(options);
            
            return {
                imageUrl,
                prompt: enhancedPrompt,
                originalPrompt: prompt,
                latency,
                cost,
                model: this.modelName
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            throw {
                ...error,
                latency,
                model: this.modelName
            };
        }
    }

    /**
     * Enhance prompt using ChatGPT with template-based approach
     * Now uses Firebase Cloud Functions for secure API calls
     */
    async enhancePrompt(originalPrompt, outfitComponents = {}) {
        // Build the template-based prompt
        const templatePrompt = this.buildTemplatePrompt(originalPrompt, outfitComponents);
        
        // Use Firebase Cloud Function to enhance the prompt
        try {
            const enhancedPrompt = await enhancePromptViaFunction(templatePrompt, outfitComponents);
            return enhancedPrompt || originalPrompt;
        } catch (error) {
            console.error('Error enhancing prompt via Firebase Function:', error);
            // Fallback to original prompt if enhancement fails
            return originalPrompt;
        }
    }

    /**
     * Build template-based prompt from outfit components
     */
    buildTemplatePrompt(originalPrompt, outfitComponents = {}) {
        // Extract outfit details from components or fallback to original prompt
        const top = outfitComponents.top || outfitComponents.shortTopDescription || 'stylish top';
        const bottom = outfitComponents.bottom || outfitComponents.shortBottomDescription || 'stylish bottom';
        const shoes = outfitComponents.shoes || outfitComponents.shortShoesDescription || 'stylish shoes';
        const accessory = outfitComponents.accessory || outfitComponents.shortAccessoryDescription || 'stylish accessory';
        
        // Extract vibe/event from components or user input
        const vibe = outfitComponents.vibe || 
                     outfitComponents.userInput || 
                     outfitComponents.event || 
                     'casual setting';
        
        // Build the template prompt
        return `Generate a cinematic, realistic fashion photo showing a person wearing the outfit described below. 

Focus on detailed textures, lighting, and the overall atmosphere. 

Make the background and scene match the user's described event or setting.

Scene Rules:

• Adapt the environment to the user's event or mood.

  Examples:
    - "Beach Day" → sunlight, sand, ocean breeze, relaxed stance.
    - "Work Mode" → modern office or city street, professional posture.
    - "Date Night" → ambient lighting, restaurant or evening city background.
    - "Gym" → clean, modern gym with natural light and movement.
    - "Casual Weekend" → park or cafe with soft morning light.

• Keep composition fashion-editorial quality (waist-up or full-body, natural pose).

• Capture fabric texture, fit, and color tone clearly.

• Lighting: match mood — warm morning, soft sunset, or cool indoor tones.

• Avoid text, brand logos, or unrealistic props.

Outfit Details:

• Top: ${top}

• Bottom: ${bottom}

• Shoes: ${shoes}

• Accessory: ${accessory}

• Vibe: ${vibe}

Camera Specs:

• Lens: 50mm f/1.8 for shallow depth of field.

• Resolution: Ultra-realistic fashion photography.

• Lighting ratio: 2:1 key-to-fill for dimensional realism.

• Color grading: Match scene mood — natural, balanced, or cinematic.

Output:

A high-quality editorial-style image suitable for fashion visualization.`;
    }

    /**
     * Generate image using OpenAI Images API via Firebase Cloud Functions
     */
    async generateImage(prompt, options = {}) {
        const cleanPrompt = this.cleanPrompt(prompt);
        
        // Use Firebase Cloud Function to generate the image
        try {
            const imageUrl = await generateImageViaFunction(cleanPrompt, {
                size: options.size || '1024x1024',
                quality: options.quality || 'standard'
            });
            return imageUrl;
        } catch (error) {
            throw {
                status: error.code || 500,
                message: error.message || 'Image generation failed',
                error: error
            };
        }
    }

    /**
     * Clean and optimize prompt
     */
    cleanPrompt(prompt) {
        // Remove excessive length
        let cleaned = prompt.length > 1000 
            ? prompt.substring(0, 1000) + "..."
            : prompt;
        
        // Remove any markdown formatting
        cleaned = cleaned.replace(/[*_`#]/g, '');
        
        return cleaned.trim();
    }

    /**
     * Estimate cost for image generation
     * Based on OpenAI pricing (as of 2024)
     */
    estimateCost(options = {}) {
        const size = options.size || '1024x1024';
        const quality = options.quality || 'standard';
        
        // OpenAI pricing (approximate, in USD)
        // DALL-E 3: $0.040 per image (1024x1024, standard quality)
        // DALL-E 3: $0.080 per image (1024x1024, hd quality)
        // ChatGPT API: ~$0.03 per 1K tokens (for prompt enhancement)
        
        let imageCost = 0.04; // Standard quality default
        if (quality === 'hd') {
            imageCost = 0.08;
        }
        
        // ChatGPT enhancement cost (approximate, based on ~300 tokens)
        const enhancementCost = 0.009; // ~300 tokens at $0.03/1K tokens
        
        return {
            image: imageCost,
            enhancement: enhancementCost,
            total: imageCost + enhancementCost,
            currency: 'USD'
        };
    }
}


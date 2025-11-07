import { BaseImageAdapter } from './baseAdapter';
import { generateImage as generateImageViaFunction } from '../../../services/openaiService';

/**
 * DALL-E 3 Adapter (Legacy - for backward compatibility)
 * Now uses Firebase Cloud Functions for secure API calls
 */
export class DalleAdapter extends BaseImageAdapter {
    constructor(config = {}) {
        super('dall-e-3', {
            version: '3.0.0',
            provider: 'openai',
            ...config
        });
    }

    /**
     * Generate an image using DALL-E 3
     */
    async generate(prompt, options = {}) {
        const startTime = Date.now();
        
        try {
            const imageUrl = await this.withRetry(
                () => this.generateImage(prompt, options),
                'DALL-E image generation'
            );
            
            const latency = Date.now() - startTime;
            const cost = this.estimateCost(options);
            
            return {
                imageUrl,
                prompt: prompt,
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
     * Generate image using DALL-E 3 API via Firebase Cloud Functions
     */
    async generateImage(prompt, options = {}) {
        const cleanPrompt = this.cleanPrompt(prompt);
        const enhancedPrompt = `Create a photorealistic, high-quality image of ${cleanPrompt}. The image should be well-lit, professional, and show the outfit in a natural lifestyle setting.`;
        
        // Use Firebase Cloud Function to generate the image
        try {
            const imageUrl = await generateImageViaFunction(enhancedPrompt, {
                size: options.size || '1024x1024',
                quality: options.quality || 'standard'
            });
            return imageUrl;
        } catch (error) {
            throw {
                status: error.code || 500,
                message: error.message || 'DALL-E API error',
                error: error
            };
        }
    }

    /**
     * Clean prompt
     */
    cleanPrompt(prompt) {
        return prompt.length > 1000 
            ? prompt.substring(0, 1000) + "..."
            : prompt;
    }

    /**
     * Estimate cost
     */
    estimateCost(options = {}) {
        const quality = options.quality || 'standard';
        const imageCost = quality === 'hd' ? 0.08 : 0.04;
        
        return {
            image: imageCost,
            enhancement: 0,
            total: imageCost,
            currency: 'USD'
        };
    }
}


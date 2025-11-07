/**
 * Base Image Generation Adapter
 * All image generation adapters should extend this class
 */
export class BaseImageAdapter {
    constructor(modelName, config = {}) {
        this.modelName = modelName;
        this.config = {
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
            timeout: config.timeout || 30000,
            ...config
        };
    }

    /**
     * Generate an image from a prompt
     * Must be implemented by subclasses
     */
    async generate(prompt, options = {}) {
        throw new Error('generate() method must be implemented by subclass');
    }

    /**
     * Estimate cost for image generation
     * Must be implemented by subclasses
     */
    estimateCost(options = {}) {
        throw new Error('estimateCost() method must be implemented by subclass');
    }

    /**
     * Get model metadata
     */
    getModelInfo() {
        return {
            name: this.modelName,
            version: this.config.version || '1.0.0',
            provider: this.config.provider || 'openai'
        };
    }

    /**
     * Retry wrapper with exponential backoff
     */
    async withRetry(fn, context = '') {
        let lastError;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                const isRetryable = this.isRetryableError(error);
                
                if (!isRetryable || attempt === this.config.maxRetries) {
                    throw error;
                }

                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                console.log(
                    `Retry attempt ${attempt}/${this.config.maxRetries} for ${context} after ${delay}ms`
                );
                await this.sleep(delay);
            }
        }
        throw lastError;
    }

    /**
     * Determine if an error is retryable
     */
    isRetryableError(error) {
        // Network errors, rate limits, and server errors are retryable
        const retryableStatusCodes = [429, 500, 502, 503, 504];
        const retryableMessages = [
            'timeout',
            'network',
            'rate limit',
            'server error',
            'temporarily unavailable'
        ];

        if (error.status && retryableStatusCodes.includes(error.status)) {
            return true;
        }

        const errorMessage = error.message?.toLowerCase() || '';
        return retryableMessages.some(msg => errorMessage.includes(msg));
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create timeout promise
     */
    createTimeout(timeoutMs) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });
    }
}


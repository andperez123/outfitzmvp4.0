import { ChatGPTImageAdapter } from './adapters/chatgptImageAdapter';
import { DalleAdapter } from './adapters/dalleAdapter';

/**
 * Image Generator Factory
 * Creates the appropriate adapter based on configuration
 */
export class ImageGenerator {
    constructor(modelName = null) {
        this.modelName = modelName || process.env.REACT_APP_IMAGE_MODEL || 'gpt-image-latest';
        this.adapter = this.createAdapter();
    }

    /**
     * Create adapter based on model name
     */
    createAdapter() {
        const model = this.modelName.toLowerCase();
        
        // Versioned adapter mapping
        const adapters = {
            'gpt-image-latest': ChatGPTImageAdapter,
            'gpt-image-v1': ChatGPTImageAdapter,
            'chatgpt-image': ChatGPTImageAdapter,
            'dall-e-3': DalleAdapter,
            'dalle-3': DalleAdapter
        };

        const AdapterClass = adapters[model];
        
        if (!AdapterClass) {
            console.warn(`Unknown model "${this.modelName}", defaulting to gpt-image-latest`);
            return new ChatGPTImageAdapter({ modelName: 'gpt-image-latest' });
        }

        return new AdapterClass({ modelName: this.modelName });
    }

    /**
     * Generate image with logging and error handling
     */
    async generate(prompt, options = {}) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        
        try {
            console.log(`[ImageGenerator] Starting generation with model: ${this.modelName}`, {
                requestId,
                promptLength: prompt.length,
                options
            });

            const result = await this.adapter.generate(prompt, options);
            
            const totalLatency = Date.now() - startTime;
            const modelInfo = this.adapter.getModelInfo();
            
            // Log successful generation
            this.logGeneration({
                requestId,
                status: 'success',
                model: this.modelName,
                modelInfo,
                latency: result.latency,
                totalLatency,
                cost: result.cost,
                promptLength: prompt.length,
                enhancedPromptLength: result.prompt?.length || 0
            });

            return result.imageUrl;
            
        } catch (error) {
            const totalLatency = Date.now() - startTime;
            const modelInfo = this.adapter.getModelInfo();
            
            // Log error
            this.logGeneration({
                requestId,
                status: 'error',
                model: this.modelName,
                modelInfo,
                latency: error.latency || totalLatency,
                totalLatency,
                error: error.message || 'Unknown error',
                errorCode: error.status,
                promptLength: prompt.length
            });

            throw error;
        }
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log generation metrics
     */
    logGeneration(metrics) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...metrics
        };

        // Console logging
        if (metrics.status === 'success') {
            console.log(`[ImageGenerator] ✅ Success`, {
                requestId: metrics.requestId,
                model: metrics.model,
                latency: `${metrics.totalLatency}ms`,
                cost: `$${metrics.cost?.total?.toFixed(4) || '0.0000'}`,
                modelInfo: metrics.modelInfo
            });
        } else {
            console.error(`[ImageGenerator] ❌ Error`, {
                requestId: metrics.requestId,
                model: metrics.model,
                error: metrics.error,
                latency: `${metrics.totalLatency}ms`,
                errorCode: metrics.errorCode
            });
        }

        // In production, you might want to send this to an analytics service
        // Example: sendToAnalytics(logEntry);
        
        return logEntry;
    }

    /**
     * Get current adapter info
     */
    getAdapterInfo() {
        return this.adapter.getModelInfo();
    }

    /**
     * Estimate cost before generation
     */
    estimateCost(options = {}) {
        return this.adapter.estimateCost(options);
    }
}

// Singleton instance
let imageGeneratorInstance = null;

/**
 * Get or create image generator instance
 */
export const getImageGenerator = (modelName = null) => {
    if (!imageGeneratorInstance || (modelName && modelName !== imageGeneratorInstance.modelName)) {
        imageGeneratorInstance = new ImageGenerator(modelName);
    }
    return imageGeneratorInstance;
};

/**
 * Main export function (backward compatible)
 */
export const generateImage = async (prompt, options = {}) => {
    const generator = getImageGenerator();
    return await generator.generate(prompt, options);
};


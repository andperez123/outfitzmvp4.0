# Image Generation Endpoint Refactor - WP4

This document describes the refactored image generation system that switches from DALL·E 3 to ChatGPT image model with a versioned adapter pattern.

## Overview

The image generation system has been refactored to:
- Use ChatGPT for prompt enhancement before image generation
- Support multiple image models through a versioned adapter pattern
- Include structured error handling with automatic retries
- Log comprehensive metrics (latency, cost, model name)

## Architecture

### Adapter Pattern

The system uses a versioned adapter pattern that allows easy switching between different image generation models:

```
src/utils/imageGeneration/
├── adapters/
│   ├── baseAdapter.js          # Base class for all adapters
│   ├── chatgptImageAdapter.js  # ChatGPT-enhanced image generation (default)
│   └── dalleAdapter.js         # Legacy DALL-E 3 adapter
└── imageGenerator.js           # Factory and main interface
```

### Key Components

1. **BaseAdapter** (`baseAdapter.js`)
   - Abstract base class for all image generation adapters
   - Provides retry logic with exponential backoff
   - Error handling and timeout management
   - Cost estimation interface

2. **ChatGPTImageAdapter** (`chatgptImageAdapter.js`)
   - **Default adapter** (model: `gpt-image-latest`)
   - Uses ChatGPT to enhance prompts before image generation
   - Generates images using OpenAI's latest image API
   - Includes cost estimation for both prompt enhancement and image generation

3. **DalleAdapter** (`dalleAdapter.js`)
   - Legacy adapter for backward compatibility
   - Direct DALL-E 3 API integration
   - Can be used by setting `REACT_APP_IMAGE_MODEL=dall-e-3`

4. **ImageGenerator** (`imageGenerator.js`)
   - Factory class that creates the appropriate adapter
   - Handles logging and metrics collection
   - Provides unified interface for image generation

## Configuration

### Environment Variables

**Required:**
- `REACT_APP_OPENAI_API_KEY` - OpenAI API key

**Optional:**
- `REACT_APP_IMAGE_MODEL` - Image model to use (default: `gpt-image-latest`)
  - Available options:
    - `gpt-image-latest` (default) - ChatGPT-enhanced generation
    - `gpt-image-v1` - Same as latest
    - `chatgpt-image` - Alias for gpt-image-latest
    - `dall-e-3` - Legacy DALL-E 3 direct generation
    - `dalle-3` - Alias for dall-e-3

### Example .env Configuration

```env
REACT_APP_OPENAI_API_KEY=sk-your-key-here
REACT_APP_IMAGE_MODEL=gpt-image-latest
```

## Usage

### Basic Usage

```javascript
import { generateImage } from './utils/gptWrapper';

const imageUrl = await generateImage('A person wearing a casual outfit');
```

### With Options

```javascript
import { generateImage } from './utils/gptWrapper';

const imageUrl = await generateImage('A person wearing a casual outfit', {
    size: '1024x1024',
    quality: 'hd'
});
```

### Using the Generator Directly

```javascript
import { getImageGenerator } from './utils/imageGeneration/imageGenerator';

const generator = getImageGenerator('gpt-image-latest');
const imageUrl = await generator.generate('prompt here');

// Estimate cost before generation
const costEstimate = generator.estimateCost({ quality: 'hd' });
```

## Features

### 1. ChatGPT Prompt Enhancement

The default adapter uses ChatGPT to enhance prompts before image generation:

1. Original prompt is sent to ChatGPT with styling instructions
2. ChatGPT generates an optimized, detailed image prompt
3. Enhanced prompt is used for actual image generation
4. Results in higher quality, more consistent images

### 2. Automatic Retries

All adapters include automatic retry logic:
- **Max retries**: 3 (configurable)
- **Retry delay**: Exponential backoff (1s, 2s, 4s)
- **Retryable errors**: Network errors, rate limits, server errors (5xx)

### 3. Error Handling

Structured error handling includes:
- Error classification (retryable vs non-retryable)
- Detailed error messages with status codes
- Error propagation with context

### 4. Comprehensive Logging

Every image generation request logs:
- **Request ID**: Unique identifier for tracking
- **Model name**: Which adapter/model was used
- **Latency**: Generation time in milliseconds
- **Cost estimate**: Estimated API costs (USD)
- **Status**: Success or error
- **Error details**: If generation failed

Example log output:
```
[ImageGenerator] ✅ Success {
  requestId: 'img_1234567890_abc123',
  model: 'gpt-image-latest',
  latency: '4523ms',
  cost: '$0.0490',
  modelInfo: { name: 'gpt-image-latest', version: '1.0.0', provider: 'openai' }
}
```

### 5. Cost Estimation

Cost estimation includes:
- Image generation cost (based on size and quality)
- Prompt enhancement cost (ChatGPT API usage)
- Total cost calculation

Current pricing (approximate):
- DALL-E 3 Standard: $0.04 per image
- DALL-E 3 HD: $0.08 per image
- ChatGPT Enhancement: ~$0.009 per request (~300 tokens)

## Migration from DALL-E 3

The refactor maintains backward compatibility:

1. **Default behavior**: Automatically uses ChatGPT-enhanced generation
2. **Legacy support**: Can still use DALL-E 3 by setting `REACT_APP_IMAGE_MODEL=dall-e-3`
3. **API compatibility**: `generateImage()` function signature unchanged

### Before (DALL-E 3)
```javascript
const imageUrl = await generateImage(prompt);
```

### After (ChatGPT Image - Default)
```javascript
// Same API, but now uses ChatGPT enhancement
const imageUrl = await generateImage(prompt);
```

## Adding New Adapters

To add support for a new image model:

1. Create a new adapter class extending `BaseImageAdapter`:

```javascript
import { BaseImageAdapter } from './baseAdapter';

export class MyNewAdapter extends BaseImageAdapter {
    constructor(config = {}) {
        super('my-new-model', config);
    }

    async generate(prompt, options = {}) {
        // Implementation
    }

    estimateCost(options = {}) {
        // Cost estimation
    }
}
```

2. Register it in `imageGenerator.js`:

```javascript
const adapters = {
    'my-new-model': MyNewAdapter,
    // ... other adapters
};
```

## Testing

### Test with Different Models

```javascript
// Test ChatGPT image model
REACT_APP_IMAGE_MODEL=gpt-image-latest npm start

// Test DALL-E 3
REACT_APP_IMAGE_MODEL=dall-e-3 npm start
```

### Monitor Logs

Check browser console for detailed generation logs including:
- Model selection
- Latency metrics
- Cost estimates
- Error details (if any)

## Performance Considerations

1. **ChatGPT Enhancement**: Adds ~1-2 seconds but improves image quality
2. **Retry Logic**: May add additional time on retries but improves reliability
3. **Logging**: Minimal performance impact (console logging only)

## Cost Optimization

- Use `standard` quality for faster/cheaper generation
- Use `hd` quality only when needed
- Monitor logs to track actual API usage

## Troubleshooting

### "Unknown model" warning
- Check that `REACT_APP_IMAGE_MODEL` is set to a valid value
- Defaults to `gpt-image-latest` if invalid

### Rate limit errors
- Retry logic automatically handles rate limits
- Consider adding delays between requests if needed

### High costs
- Review cost estimates in logs
- Consider using standard quality instead of HD
- Monitor ChatGPT enhancement usage

## Future Enhancements

Potential improvements:
- [ ] Add caching for similar prompts
- [ ] Batch processing support
- [ ] Analytics integration for metrics
- [ ] Cost tracking and budget alerts
- [ ] Support for additional image models (Midjourney, Stable Diffusion, etc.)


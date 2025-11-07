# Testing Image Generation - Quick Guide

## Quick Start

### 1. Set Up Environment Variable (Optional)

The system defaults to `gpt-image-latest`, but you can explicitly set it:

```bash
# In your .env file
REACT_APP_IMAGE_MODEL=gpt-image-latest
```

Or test with DALL-E 3:
```bash
REACT_APP_IMAGE_MODEL=dall-e-3
```

### 2. Start the Development Server

```bash
npm start
```

### 3. Test Image Generation

1. **Open the app** in your browser (usually `http://localhost:3000`)
2. **Sign in** (if required)
3. **Generate an outfit**:
   - Click "Build Your Profile" or use the quick input
   - Fill out the form or describe an outfit
   - Click "Generate Outfit"
4. **Watch the console** for detailed logs

## What to Look For

### ✅ Success Indicators

In the browser console, you should see:

```
[ImageGenerator] Starting generation with model: gpt-image-latest
[ImageGenerator] ✅ Success {
  requestId: 'img_1234567890_abc123',
  model: 'gpt-image-latest',
  latency: '4523ms',
  cost: '$0.0490',
  modelInfo: { name: 'gpt-image-latest', version: '1.0.0', provider: 'openai' }
}
```

### ❌ Error Indicators

If something goes wrong:

```
[ImageGenerator] ❌ Error {
  requestId: 'img_1234567890_abc123',
  model: 'gpt-image-latest',
  error: 'Error message here',
  latency: '2000ms',
  errorCode: 429
}
```

## Testing Different Models

### Test ChatGPT Image Model (Default)

```bash
# In .env file
REACT_APP_IMAGE_MODEL=gpt-image-latest

# Or just don't set it (defaults to gpt-image-latest)
```

**What to expect:**
- Takes ~4-6 seconds (includes ChatGPT prompt enhancement)
- Console shows two API calls (ChatGPT enhancement + image generation)
- Higher quality images (ChatGPT enhances the prompt)

### Test DALL-E 3 (Legacy)

```bash
# In .env file
REACT_APP_IMAGE_MODEL=dall-e-3
```

**What to expect:**
- Takes ~2-4 seconds (direct image generation)
- Console shows one API call (direct to DALL-E)
- Faster but potentially lower quality without enhancement

## Step-by-Step Testing

### Test 1: Basic Image Generation

1. Open browser console (F12)
2. Navigate to the outfit generator
3. Generate an outfit
4. **Verify:**
   - Image appears in the modal
   - Console shows success log
   - Latency is logged
   - Cost estimate is shown

### Test 2: Error Handling

**Simulate API error:**
1. Temporarily set wrong API key in `.env`
2. Try to generate an outfit
3. **Verify:**
   - Error is caught gracefully
   - Error log appears in console
   - User sees error message (not crash)
   - Retry logic attempts recovery

### Test 3: Retry Logic

**Test rate limiting:**
1. Generate multiple outfits quickly (5-10 in a row)
2. **Verify:**
   - Console shows retry attempts
   - Exponential backoff messages
   - Eventually succeeds or fails gracefully

### Test 4: Model Switching

1. Set `REACT_APP_IMAGE_MODEL=dall-e-3` in `.env`
2. Restart dev server (`npm start`)
3. Generate an outfit
4. **Verify:**
   - Console shows `model: 'dall-e-3'`
   - Faster generation (no ChatGPT step)
   - Different cost estimate

## Console Log Examples

### Successful Generation (ChatGPT Image)

```
[ImageGenerator] Starting generation with model: gpt-image-latest {
  requestId: 'img_1703123456789_xyz789',
  promptLength: 156,
  options: {}
}

[ImageGenerator] ✅ Success {
  requestId: 'img_1703123456789_xyz789',
  model: 'gpt-image-latest',
  latency: '5234ms',
  cost: '$0.0490',
  modelInfo: {
    name: 'gpt-image-latest',
    version: '1.0.0',
    provider: 'openai'
  }
}
```

### Error with Retry

```
[ImageGenerator] Starting generation with model: gpt-image-latest
Retry attempt 1/3 for ChatGPT image generation after 1000ms
Retry attempt 2/3 for ChatGPT image generation after 2000ms
[ImageGenerator] ✅ Success {
  requestId: 'img_1703123456789_xyz789',
  model: 'gpt-image-latest',
  latency: '8234ms',  // Includes retry time
  cost: '$0.0490'
}
```

## Verification Checklist

- [ ] Image appears in outfit modal
- [ ] Console shows success log with requestId
- [ ] Latency is logged (in milliseconds)
- [ ] Cost estimate is shown
- [ ] Model name is logged correctly
- [ ] No errors in console (except expected retries)
- [ ] Error handling works (try with wrong API key)
- [ ] Retry logic works (check retry messages)

## Common Issues

### "Unknown model" Warning
- **Cause**: Invalid `REACT_APP_IMAGE_MODEL` value
- **Fix**: Use valid model name or remove variable (uses default)

### "OpenAI API key is not configured"
- **Cause**: Missing `REACT_APP_OPENAI_API_KEY`
- **Fix**: Add API key to `.env` file

### Images Not Generating
- **Check**: Browser console for error messages
- **Check**: Network tab for API call failures
- **Check**: API key is valid and has credits

### Slow Generation
- **Normal**: ChatGPT enhancement adds ~1-2 seconds
- **Expected**: Total time ~4-6 seconds for ChatGPT model
- **Faster option**: Use `dall-e-3` model

## Advanced Testing

### Test Cost Estimation

```javascript
// In browser console
import { getImageGenerator } from './utils/imageGeneration/imageGenerator';

const generator = getImageGenerator();
const cost = generator.estimateCost({ quality: 'hd' });
console.log('Estimated cost:', cost);
```

### Test Direct Adapter

```javascript
// In browser console
import { ChatGPTImageAdapter } from './utils/imageGeneration/adapters/chatgptImageAdapter';

const adapter = new ChatGPTImageAdapter();
const result = await adapter.generate('A person wearing a casual outfit');
console.log('Result:', result);
```

## Performance Benchmarks

### ChatGPT Image Model (gpt-image-latest)
- **Average latency**: 4-6 seconds
- **Cost per image**: ~$0.049 (standard quality)
- **Quality**: Higher (prompt enhanced)

### DALL-E 3 (dall-e-3)
- **Average latency**: 2-4 seconds
- **Cost per image**: ~$0.04 (standard quality)
- **Quality**: Good (direct generation)

## Next Steps

After testing:
1. ✅ Verify images generate successfully
2. ✅ Check logs for metrics
3. ✅ Test error handling
4. ✅ Compare quality between models
5. ✅ Monitor costs in production

## Questions?

- Check `IMAGE_GENERATION_REFACTOR.md` for architecture details
- Check `ENV_VARIABLES.md` for configuration options
- Review browser console for detailed error messages


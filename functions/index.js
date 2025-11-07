const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Get API key from config (supports both old and new methods)
// Old method: functions.config().openai?.api_key
// New method: process.env.OPENAI_API_KEY (when using secrets)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || functions.config().openai?.api_key;

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not configured. Please set it using:');
  console.warn('  firebase functions:config:set openai.api_key="sk-..."');
  console.warn('  OR');
  console.warn('  firebase functions:secrets:set OPENAI_API_KEY');
}

/**
 * Generate outfit data using OpenAI GPT-4
 * This function replaces the client-side fetchOutfitData
 */
exports.generateOutfit = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate outfits'
    );
  }

  const { prompt } = data;

  if (!prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required'
    );
  }

  if (!OPENAI_API_KEY) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'OpenAI API key is not configured'
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to fetch outfit data from OpenAI: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const apiData = await response.json();
    const message = apiData.choices[0]?.message?.content;

    if (!message) {
      throw new functions.https.HttpsError(
        'internal',
        'No response from OpenAI'
      );
    }

    return {
      success: true,
      description: message,
      rawResponse: apiData
    };
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      `Failed to generate outfit: ${error.message}`
    );
  }
});

/**
 * Enhance prompt using ChatGPT
 * Used by the ChatGPT image adapter
 */
exports.enhancePrompt = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to enhance prompts'
    );
  }

  const { prompt, outfitComponents } = data;

  if (!prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required'
    );
  }

  if (!OPENAI_API_KEY) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'OpenAI API key is not configured'
    );
  }

  try {
    // Build template prompt similar to chatgptImageAdapter
    const templatePrompt = buildTemplatePrompt(prompt, outfitComponents || {});
    
    const enhancementPrompt = `You are a professional fashion photographer and stylist. 
Transform the following outfit description into a detailed, cinematic, realistic fashion photo prompt.

${templatePrompt}

Provide only the enhanced image prompt, nothing else. Do not include placeholders or template variables.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a fashion photography expert specializing in creating detailed image prompts.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ChatGPT Enhancement Error:', errorData);
      throw new functions.https.HttpsError(
        'internal',
        `ChatGPT prompt enhancement failed: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const apiData = await response.json();
    const enhancedPrompt = apiData.choices[0]?.message?.content?.trim() || prompt;

    return {
      success: true,
      enhancedPrompt: enhancedPrompt
    };
  } catch (error) {
    console.error('Error in enhancePrompt:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      `Failed to enhance prompt: ${error.message}`
    );
  }
});

/**
 * Generate image using OpenAI DALL-E
 * Supports both direct DALL-E and ChatGPT-enhanced generation
 */
exports.generateImage = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate images'
    );
  }

  const { prompt, options = {} } = data;

  if (!prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required'
    );
  }

  if (!OPENAI_API_KEY) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'OpenAI API key is not configured'
    );
  }

  try {
    const cleanPrompt = cleanPromptText(prompt);
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: cleanPrompt,
        n: 1,
        size: size,
        quality: quality
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DALL-E API Error:', errorData);
      throw new functions.https.HttpsError(
        'internal',
        `Image generation failed: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const apiData = await response.json();

    if (!apiData.data?.[0]?.url) {
      throw new functions.https.HttpsError(
        'internal',
        'No image URL in API response'
      );
    }

    return {
      success: true,
      imageUrl: apiData.data[0].url
    };
  } catch (error) {
    console.error('Error in generateImage:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      `Failed to generate image: ${error.message}`
    );
  }
});

/**
 * Helper function to build template prompt
 */
function buildTemplatePrompt(originalPrompt, outfitComponents = {}) {
  const top = outfitComponents.top || outfitComponents.shortTopDescription || 'stylish top';
  const bottom = outfitComponents.bottom || outfitComponents.shortBottomDescription || 'stylish bottom';
  const shoes = outfitComponents.shoes || outfitComponents.shortShoesDescription || 'stylish shoes';
  const accessory = outfitComponents.accessory || outfitComponents.shortAccessoryDescription || 'stylish accessory';
  
  const vibe = outfitComponents.vibe || 
               outfitComponents.userInput || 
               outfitComponents.event || 
               'casual setting';
  
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
 * Helper function to clean prompt text
 */
function cleanPromptText(prompt) {
  let cleaned = prompt.length > 1000 
    ? prompt.substring(0, 1000) + "..."
    : prompt;
  
  cleaned = cleaned.replace(/[*_`#]/g, '');
  
  return cleaned.trim();
}


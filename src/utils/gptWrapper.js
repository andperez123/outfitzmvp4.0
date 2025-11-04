const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Function to generate outfit data from OpenAI's GPT model
export const fetchOutfitData = async (prompt) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response:", errorData);
            throw new Error('Failed to fetch outfit data from OpenAI');
        }

        const data = await response.json();
        console.log("Raw API Response:", data);
        console.log("Message Content:", data.choices[0].message.content);

        const message = data.choices[0].message.content;
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

// Function to generate an image using OpenAI's Responses API with GPT Image 1
// This uses the newer API that provides better instruction following and world knowledge
export const generateImage = async (prompt) => {
    if (!prompt) {
        throw new Error('Empty prompt provided for image generation');
    }

    if (!process.env.REACT_APP_OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        throw new Error('OpenAI API key is not configured');
    }

    try {
        console.log('Starting image generation with Responses API...');
        console.log('Image Prompt:', prompt);

        // Use the new Responses API with gpt-4.1-mini and image_generation tool
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: `Generate a photorealistic image of ${prompt}. The image should be high quality, well-lit, and show the outfit in a natural, lifestyle setting.`,
                tools: [{ type: "image_generation" }]
            })
        });

        console.log('Responses API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Responses API Error Response:', errorData);
            
            // Fallback to DALL-E 3 if Responses API fails (for backward compatibility)
            console.log('Falling back to DALL-E 3...');
            return await generateImageDALLE(prompt);
        }

        const data = await response.json();
        console.log('Responses API Success Response:', data);

        // Extract image from response output
        // The response has output array with image_generation_call type
        const imageOutput = data.output?.find(
            output => output.type === "image_generation_call"
        );

        if (!imageOutput || !imageOutput.result) {
            console.warn('No image in Responses API output, falling back to DALL-E 3');
            return await generateImageDALLE(prompt);
        }

        // Convert base64 to data URL
        const imageBase64 = imageOutput.result;
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        
        console.log('Image generated successfully via Responses API');
        return imageUrl;

    } catch (error) {
        console.error('Image generation error with Responses API:', error);
        console.log('Falling back to DALL-E 3...');
        
        // Fallback to DALL-E 3 if new API fails
        try {
            return await generateImageDALLE(prompt);
        } catch (fallbackError) {
            console.error('Both image generation methods failed:', fallbackError);
            throw new Error('Failed to generate image: ' + error.message);
        }
    }
};

// Fallback function using DALL-E 3 (for backward compatibility)
async function generateImageDALLE(prompt) {
    console.log('Using DALL-E 3 for image generation...');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('DALL-E API Error Response:', errorData);
        throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('DALL-E API Success Response:', data);

    if (!data.data?.[0]?.url) {
        throw new Error('No image URL in DALL-E response');
    }

    return data.data[0].url;
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

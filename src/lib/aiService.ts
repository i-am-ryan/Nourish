// src/lib/aiService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  actions?: Array<{
    type: 'navigate' | 'external';
    target: string;
    label: string;
  }>;
  suggestions?: string[];
}

export interface FoodQualityResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe';
  confidence: number;
  shelfLife: string;
  recommendations: string[];
  safetyNotes: string[];
  // Enhanced fields
  foodName?: string;
  freshness?: string;
  nutritionalHighlights?: string[];
  visualObservations?: string[];
  distributionSuitability?: string;
  reasoningDetails?: string;
  // New comprehensive fields
  category?: string;
  origin?: string;
  nutritionalProfile?: {
    calories: string;
    keyNutrients: string[];
    healthBenefits: string[];
  };
  availabilityInSA?: {
    whereToBuy: string[];
    seasonality: string;
    averagePrice?: string;
  };
  interestingFacts?: string[];
  typicalShelfLife?: string;
  currentCondition?: string;
}

export interface UserContext {
  location?: string;
  role?: 'pickup' | 'delivery';
  isVerified?: boolean;
}



class AIService {
  private groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  private geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  private hfApiKey = import.meta.env.VITE_HF_API_KEY;

  async getChatResponse(messages: ChatMessage[], userContext?: UserContext): Promise<ChatResponse> {
    // Check if API key exists and is properly formatted
    if (!this.groqApiKey) {
      console.error('Groq API key not found in environment variables');
      return this.createFallbackResponse();
    }

    // Log API key format (first 10 chars for debugging)
    console.log('API Key format check:', this.groqApiKey.substring(0, 10) + '...');

    const systemPrompt = this.buildSystemPrompt(userContext);
    
    // Format messages properly for Groq API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }))
    ];

    console.log('Sending request to Groq with messages:', formattedMessages.length);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: formattedMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        }),
      });

      // Log response status for debugging
      console.log('Groq API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Groq API response:', data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid response structure from Groq API:', data);
        throw new Error('Invalid response structure from API');
      }

      const messageContent = data.choices[0].message.content || 'I apologize, but I encountered an issue processing your request.';

      return this.parseResponse(messageContent, userContext);
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Return a helpful fallback response instead of throwing
      return this.createFallbackResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async listAvailableModels(): Promise<void> {
  try {
    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${this.geminiApiKey}`
    );
    const data = await response.json();
    console.log('📋 Available Gemini models:', data.models?.map((m: any) => m.name));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

async assessFoodQualityWithGemini(imageData: string, foodType?: string): Promise<FoodQualityResult> {
  console.log('🚀 Starting Gemini food analysis...');
  
  if (!this.geminiApiKey) {
    console.error('❌ Gemini API key not configured');
    throw new Error('Gemini API key missing');
  }

  try {
    // FIRST: Check what models are actually available
    console.log('📋 Checking available models...');
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${this.geminiApiKey}`
    );
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const availableModels = listData.models?.map((m: any) => m.name) || [];
      console.log('✅ Available models:', availableModels);
      
      // Filter models that support vision
      const visionModels = listData.models?.filter((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        (m.name.includes('vision') || m.name.includes('1.5'))
      ).map((m: any) => m.name.replace('models/', '')) || [];
      
      console.log('👁️ Vision-capable models:', visionModels);
    } else {
      console.log('⚠️ Could not list models:', await listResponse.text());
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid image format');
    }
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];

    const prompt = `Analyze this food image in detail. ${foodType ? `Hint: ${foodType}` : ''} 

Return valid JSON with this structure:
{
  "foodName": "specific food name",
  "quality": "excellent/good/fair/poor/unsafe",
  "confidence": 0.85,
  "freshness": "freshness description",
  "shelfLife": "X days with storage",
  "visualObservations": ["observation 1", "observation 2"],
  "nutritionalHighlights": ["nutrient 1", "nutrient 2"],
  "recommendations": ["tip 1", "tip 2"],
  "safetyNotes": ["safety note"],
  "availabilityInSA": {
    "whereToBuy": ["Pick n Pay", "Checkers", "Woolworths"],
    "averagePrice": "R20-50",
    "buyLinks": [
      {"store": "Pick n Pay", "url": "https://www.pnp.co.za/search?q=", "price": "R20-35"},
      {"store": "Checkers", "url": "https://www.checkers.co.za/search?q=", "price": "R25-40"}
    ]
  }
}`;

    // Try both v1 and v1beta APIs with different model names
    const modelsToTry = [
      { api: 'v1', model: 'gemini-1.5-flash' },
      { api: 'v1', model: 'gemini-1.5-pro' },
      { api: 'v1', model: 'gemini-pro-vision' },
      { api: 'v1beta', model: 'gemini-1.5-flash-latest' },
      { api: 'v1beta', model: 'gemini-1.5-pro-latest' },
      { api: 'v1beta', model: 'gemini-pro-vision' },
    ];

    let lastError;
    
    for (const { api, model } of modelsToTry) {
      try {
        console.log(`🔄 Trying ${api}/models/${model}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${api}/models/${model}:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }]
            })
          }
        );

        const responseText = await response.text();
        
        if (!response.ok) {
          console.log(`❌ ${api}/${model} failed:`, responseText);
          lastError = new Error(responseText);
          continue;
        }

        const result = JSON.parse(responseText);
        console.log(`✅ SUCCESS with ${api}/models/${model}!`);
        
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('📝 Response:', text.substring(0, 200) + '...');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log('⚠️ No JSON found, using text response');
          throw new Error('No JSON in response');
        }
        
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          quality: parsed.quality || 'good',
          confidence: parsed.confidence || 0.85,
          foodName: parsed.foodName || 'Food Item',
          shelfLife: parsed.shelfLife || '3-7 days',
          freshness: parsed.freshness || 'Analysis complete',
          recommendations: parsed.recommendations || ['Store properly'],
          safetyNotes: parsed.safetyNotes || ['No immediate concerns'],
          nutritionalHighlights: parsed.nutritionalHighlights || [],
          visualObservations: parsed.visualObservations || [],
          distributionSuitability: 'suitable',
          reasoningDetails: `Analyzed using ${api}/${model}`,
          availabilityInSA: parsed.availabilityInSA || {
            whereToBuy: ['Pick n Pay', 'Checkers', 'Woolworths', 'Spar'],
            averagePrice: 'Check in-store',
            buyLinks: [
              {store: 'Pick n Pay', url: 'https://www.pnp.co.za', price: 'Varies'},
              {store: 'Checkers', url: 'https://www.checkers.co.za', price: 'Varies'}
            ]
          }
        };
        
      } catch (modelError) {
        console.log(`❌ ${api}/${model} error:`, modelError);
        lastError = modelError;
        continue;
      }
    }
    
    throw lastError || new Error('All model attempts failed');
    
  } catch (error) {
    console.error('❌ Complete failure:', error);
    throw error;
  }
}




// ADD THIS IMPORT AT THE VERY TOP OF YOUR aiService.ts FILE


// Then find your AIService class and add this new method
// ADD THIS METHOD TO YOUR EXISTING AIService CLASS (don't replace anything)

// REPLACE the assessFoodQualityWithGemini method in your aiService.ts with THIS:



  private createFallbackResponse(errorMessage?: string): ChatResponse {
    const fallbackMessages = [
      "I'm having trouble connecting to my AI service right now. Here are some things I can help you with manually:",
      "**Food Safety Basics:**\n- Store perishables below 4°C\n- Check expiration dates\n- Look for signs of spoilage\n\n**Platform Help:**\n- Visit /volunteer to find tasks\n- Check /food-hubs for locations\n- Use /donate to offer surplus food",
      "While my AI features aren't working, you can still explore the platform! Try the navigation menu above."
    ];

    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return {
      message: randomMessage,
      suggestions: [
        "How do I become a volunteer?",
        "Where are the food hubs?",
        "Food safety guidelines"
      ]
    };
  }

async assessFoodQuality(imageData: string, foodType?: string): Promise<FoodQualityResult> {
  if (!this.hfApiKey) {
    console.log('Hugging Face API key not configured');
    return this.createEnhancedDemoResult(foodType);
  }

  console.log('Using Hugging Face API for food analysis...');
  
  try {
    // Use a different, more reliable free model
    const response = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.hfApiKey}`,
      },
      body: imageData.split(',')[1] // Send raw base64
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF error:', errorText);
      
      // Model might be loading
      if (errorText.includes('loading') || errorText.includes('currently loading')) {
        console.log('Model is loading. Wait 20 seconds and try again.');
      }
      
      return this.createIntelligentDemoResult(foodType);
    }

    const result = await response.json();
    console.log('HF Response:', result);
    
    const description = result[0]?.generated_text || 'food item';
    console.log('Detected:', description);
    
    return this.createSmartResultFromDescription(description, foodType);
    
  } catch (error) {
    console.error('Error:', error);
    return this.createIntelligentDemoResult(foodType);
  }
}

private createIntelligentDemoResult(foodType?: string): FoodQualityResult {
  const demoData = this.getDemoDataForFoodType(foodType);
  
  return {
    quality: 'good',
    confidence: 0.80,
    shelfLife: demoData.shelfLife,
    recommendations: [
      'AI image analysis temporarily unavailable',
      'Manual inspection recommended',
      ...demoData.recommendations
    ],
    safetyNotes: ['Visual inspection recommended - AI analysis unavailable'],
    foodName: `${demoData.name} (Estimated)`,
    freshness: 'Unable to perform AI analysis - please inspect manually for freshness indicators',
    nutritionalHighlights: demoData.nutrients,
    visualObservations: ['AI analysis unavailable - manual visual inspection needed'],
    distributionSuitability: 'conditional',
    reasoningDetails: `Based on food type "${foodType || 'unspecified'}". AI analysis temporarily unavailable - manual assessment recommended.`,
    category: demoData.category,
    origin: demoData.origin,
    nutritionalProfile: demoData.nutritionalProfile,
    availabilityInSA: demoData.availability,
    interestingFacts: demoData.facts
  };
}

private createSmartResultFromDescription(description: string, foodType?: string): FoodQualityResult {
  // Analyze the description to determine food type and quality
  const foodKeywords = {
    'bread': ['bread', 'loaf', 'slice', 'toast', 'bun', 'roll'],
    'fruit': ['apple', 'banana', 'orange', 'fruit', 'berry', 'grape'],
    'vegetables': ['vegetable', 'carrot', 'lettuce', 'tomato', 'potato', 'onion'],
    'meat': ['meat', 'chicken', 'beef', 'fish', 'pork', 'turkey'],
    'dairy': ['cheese', 'milk', 'yogurt', 'butter', 'cream'],
    'prepared meals': ['plate', 'dish', 'meal', 'food on', 'cooked', 'served']
  };

  let detectedType = foodType || 'other';
  let detectedFood = description;
  
  for (const [type, keywords] of Object.entries(foodKeywords)) {
    if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
      detectedType = type;
      break;
    }
  }

  // Assess quality based on description keywords
  let quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe' = 'good';
  const freshKeywords = ['fresh', 'ripe', 'new', 'clean', 'bright'];
  const poorKeywords = ['old', 'brown', 'dark', 'wilted'];
  const unsafeKeywords = ['moldy', 'rotten', 'spoiled', 'bad'];
  
  if (unsafeKeywords.some(word => description.toLowerCase().includes(word))) {
    quality = 'unsafe';
  } else if (poorKeywords.some(word => description.toLowerCase().includes(word))) {
    quality = 'poor';
  } else if (freshKeywords.some(word => description.toLowerCase().includes(word))) {
    quality = 'excellent';
  }

  const demoData = this.getDemoDataForFoodType(detectedType);

  return {
    quality,
    confidence: 0.85,
    shelfLife: demoData.shelfLife,
    recommendations: [
      'Analysis based on AI image recognition',
      ...demoData.recommendations
    ],
    safetyNotes: ['Visual analysis completed - manual verification recommended'],
    foodName: `${detectedFood} (AI Detected)`,
    freshness: `AI Analysis: ${description}`,
    nutritionalHighlights: demoData.nutrients,
    visualObservations: [description, 'Analyzed using computer vision'],
    distributionSuitability: quality === 'poor' || quality === 'unsafe' ? 'conditional' : 'suitable',
    reasoningDetails: `Computer vision detected: ${description}. Food classified as ${detectedType} with ${quality} quality rating.`,
    // Enhanced fields from your existing demo data
    category: demoData.category,
    origin: demoData.origin,
    nutritionalProfile: demoData.nutritionalProfile,
    availabilityInSA: demoData.availability,
    interestingFacts: demoData.facts
  };
}

  private formatEnhancedResult(analysis: any): FoodQualityResult {
    return {
      quality: analysis.quality || 'good',
      confidence: analysis.confidence || 0.8,
      shelfLife: analysis.shelfLife || analysis.typicalShelfLife || 'Varies by storage conditions',
      recommendations: analysis.recommendations || ['Store in appropriate conditions'],
      safetyNotes: analysis.safetyNotes || ['No safety concerns detected'],
      // Enhanced fields
      foodName: analysis.foodName || 'Food item',
      freshness: analysis.currentCondition || 'Unable to assess current condition',
      nutritionalHighlights: analysis.nutritionalProfile?.keyNutrients || [],
      visualObservations: analysis.visualObservations || [],
      distributionSuitability: analysis.distributionSuitability || 'suitable',
      reasoningDetails: analysis.reasoningDetails || 'Analysis completed',
      // New comprehensive fields
      category: analysis.category,
      origin: analysis.origin,
      nutritionalProfile: analysis.nutritionalProfile,
      availabilityInSA: analysis.availabilityInSA,
      interestingFacts: analysis.interestingFacts,
      typicalShelfLife: analysis.typicalShelfLife,
      currentCondition: analysis.currentCondition
    };
  }

  private createEnhancedDemoResult(foodType?: string): FoodQualityResult {
    const demoData = this.getDemoDataForFoodType(foodType);
    
    return {
      quality: 'good',
      confidence: 0.85,
      shelfLife: demoData.shelfLife,
      recommendations: demoData.recommendations,
      safetyNotes: ['No immediate safety concerns detected - demo result'],
      foodName: demoData.name,
      freshness: 'Unable to analyze without AI - appears to be in acceptable condition',
      nutritionalHighlights: demoData.nutrients,
      visualObservations: ['AI analysis not available - manual assessment needed'],
      distributionSuitability: 'suitable',
      reasoningDetails: demoData.description,
      // Enhanced demo fields
      category: demoData.category,
      origin: demoData.origin,
      nutritionalProfile: demoData.nutritionalProfile,
      availabilityInSA: demoData.availability,
      interestingFacts: demoData.facts,
      typicalShelfLife: demoData.typicalShelfLife,
      currentCondition: 'Demo result - visual assessment not performed'
    };
  }

  private getDemoDataForFoodType(foodType?: string) {
    const demoDatabase: Record<string, any> = {
      bread: {
        name: "Artisanal Bread Loaf",
        category: "grain",
        origin: "Made from wheat flour, typically from wheat grown in Free State or Western Cape provinces of South Africa",
        shelfLife: "3-5 days at room temperature, up to 2 weeks frozen",
        typicalShelfLife: "5-7 days under proper storage",
        recommendations: [
          "Store in cool, dry place away from direct sunlight",
          "Keep in airtight container or bread box",
          "In South African humidity, consider refrigeration during summer",
          "Freeze portions for longer storage"
        ],
        nutrients: ["Complex carbohydrates", "B vitamins", "Iron", "Fiber (if whole grain)"],
        nutritionalProfile: {
          calories: "265 per 100g",
          keyNutrients: ["Carbohydrates", "Protein", "B vitamins", "Iron"],
          healthBenefits: ["Energy source", "B vitamin support", "Fiber for digestion"]
        },
        availability: {
          whereToBuy: ["Pick n Pay", "Checkers", "Woolworths", "Spar", "Local bakeries", "Artisanal markets"],
          seasonality: "Available year-round",
          averagePrice: "R15-35 per loaf"
        },
        facts: [
          "South Africa produces over 3 million tons of wheat annually",
          "Local bakeries often use traditional sourdough methods",
          "Rusk (beskuit) is a popular South African bread variant"
        ],
        description: "Staple carbohydrate food, essential in South African diet across all communities"
      },
      'fresh produce': {
        name: "Fresh Produce Item",
        category: "fruit",
        origin: "Locally grown in South Africa's diverse agricultural regions",
        shelfLife: "5-10 days depending on type and storage",
        typicalShelfLife: "7-14 days under optimal conditions",
        recommendations: [
          "Store in refrigerator crisper drawer",
          "Keep away from direct sunlight",
          "In South African heat, refrigerate immediately",
          "Don't wash until ready to consume"
        ],
        nutrients: ["Vitamin C", "Fiber", "Antioxidants", "Natural sugars"],
        nutritionalProfile: {
          calories: "50-80 per 100g typically",
          keyNutrients: ["Vitamin C", "Fiber", "Potassium", "Antioxidants"],
          healthBenefits: ["Immune support", "Digestive health", "Disease prevention"]
        },
        availability: {
          whereToBuy: ["Any major supermarket", "Local markets", "Farm stalls", "Street vendors"],
          seasonality: "Varies by specific produce type",
          averagePrice: "R20-60 per kg"
        },
        facts: [
          "South Africa exports fresh produce globally",
          "Cape Town area known for exceptional fruit quality",
          "Many indigenous fruits like marula have cultural significance"
        ],
        description: "Fresh produce forms cornerstone of healthy South African diet"
      },
      vegetables: {
        name: "Fresh Vegetable",
        category: "vegetable",
        origin: "Grown in South Africa's fertile agricultural regions including Limpopo, Western Cape, and KwaZulu-Natal",
        shelfLife: "3-7 days refrigerated",
        typicalShelfLife: "1-2 weeks under proper refrigeration",
        recommendations: [
          "Store in refrigerator at 4°C or below",
          "Keep in perforated plastic bags for humidity control",
          "Store root vegetables in cool, dark place",
          "In SA's hot climate, refrigerate immediately after purchase"
        ],
        nutrients: ["Vitamin A", "Vitamin C", "Folate", "Potassium", "Fiber"],
        nutritionalProfile: {
          calories: "20-50 per 100g typically",
          keyNutrients: ["Vitamins A & C", "Folate", "Potassium", "Fiber"],
          healthBenefits: ["Eye health", "Immune support", "Heart health"]
        },
        availability: {
          whereToBuy: ["Supermarkets", "Local markets", "Farm stalls", "Spaza shops"],
          seasonality: "Most available year-round, some seasonal variations",
          averagePrice: "R15-40 per kg"
        },
        facts: [
          "South Africa grows diverse vegetables suited to different climates",
          "Many traditional African vegetables like morogo are nutrient-dense",
          "Western Cape is major vegetable production region"
        ],
        description: "Essential for balanced nutrition in South African households"
      },
      fruit: {
        name: "Fresh Fruit",
        category: "fruit",
        origin: "South African orchards and farms, particularly Western Cape and Limpopo regions",
        shelfLife: "3-7 days at room temperature",
        typicalShelfLife: "5-14 days depending on type and ripeness",
        recommendations: [
          "Store ripe fruit in refrigerator",
          "Keep unripe fruit at room temperature to ripen",
          "In SA heat, move to fridge once ripe",
          "Store bananas separately from other fruits"
        ],
        nutrients: ["Vitamin C", "Fiber", "Natural sugars", "Antioxidants"],
        nutritionalProfile: {
          calories: "40-80 per 100g typically",
          keyNutrients: ["Vitamin C", "Fiber", "Potassium", "Natural sugars"],
          healthBenefits: ["Immune support", "Energy", "Digestive health"]
        },
        availability: {
          whereToBuy: ["All major retailers", "Fruit markets", "Street vendors", "Farm stalls"],
          seasonality: "Many fruits available year-round, citrus peak in winter",
          averagePrice: "R25-80 per kg"
        },
        facts: [
          "South Africa is world's second-largest citrus exporter",
          "Indigenous fruits like baobab and marula are superfood sources",
          "Cape fruit exports are renowned globally for quality"
        ],
        description: "Natural source of vitamins and energy, integral to South African agriculture"
      },
      dairy: {
        name: "Dairy Product",
        category: "dairy",
        origin: "South African dairy farms, primarily in KwaZulu-Natal, Western Cape, and Free State",
        shelfLife: "3-7 days past sell-by date if refrigerated properly",
        typicalShelfLife: "7-14 days from production date",
        recommendations: [
          "Keep refrigerated at 4°C or below at all times",
          "Store in original containers",
          "Keep away from strong-smelling foods",
          "In SA heat, minimize time outside refrigeration"
        ],
        nutrients: ["Calcium", "Protein", "Vitamin D", "Riboflavin"],
        nutritionalProfile: {
          calories: "60-150 per 100ml depending on fat content",
          keyNutrients: ["Calcium", "Protein", "Vitamin D", "Phosphorus"],
          healthBenefits: ["Bone health", "Muscle development", "Nutrient absorption"]
        },
        availability: {
          whereToBuy: ["All supermarkets", "Convenience stores", "Spaza shops", "Direct from farms"],
          seasonality: "Available year-round",
          averagePrice: "R15-25 per liter for milk"
        },
        facts: [
          "South Africa has well-developed dairy industry",
          "Local brands like Clover and Parmalat are household names",
          "Many communities practice traditional dairy fermentation"
        ],
        description: "Essential protein and calcium source in South African diet"
      },
      meat: {
        name: "Meat Product",
        category: "protein",
        origin: "South African livestock farms across various provinces",
        shelfLife: "1-2 days refrigerated",
        typicalShelfLife: "3-5 days refrigerated, 3-6 months frozen",
        recommendations: [
          "Store in refrigerator at 4°C or below immediately",
          "Use within 1-2 days of purchase",
          "Freeze if not using immediately",
          "Keep separate from other foods to prevent cross-contamination",
          "In SA heat, transport in cooler bags"
        ],
        nutrients: ["High-quality protein", "Iron", "Zinc", "B vitamins"],
        nutritionalProfile: {
          calories: "150-300 per 100g depending on cut and fat content",
          keyNutrients: ["Complete protein", "Iron", "Zinc", "B vitamins"],
          healthBenefits: ["Muscle development", "Iron absorption", "Energy metabolism"]
        },
        availability: {
          whereToBuy: ["Supermarkets", "Butcheries", "Local markets", "Halaal butchers"],
          seasonality: "Available year-round",
          averagePrice: "R80-200 per kg depending on cut"
        },
        facts: [
          "South Africa has strong beef and lamb farming traditions",
          "Braai culture makes meat central to social gatherings",
          "Local game meat like kudu and springbok available in some areas"
        ],
        description: "Important protein source requiring careful temperature control in SA climate"
      },
      'prepared meals': {
        name: "Prepared Meal",
        category: "processed",
        origin: "Commercial kitchen or food preparation facility",
        shelfLife: "2-3 days refrigerated",
        typicalShelfLife: "3-5 days refrigerated if properly stored",
        recommendations: [
          "Refrigerate within 2 hours of cooking",
          "Store in shallow containers for quick cooling",
          "Reheat to 74°C before consuming",
          "Label with date prepared",
          "In SA heat, refrigerate immediately"
        ],
        nutrients: ["Varies by ingredients", "Often balanced macronutrients"],
        nutritionalProfile: {
          calories: "200-500 per serving typically",
          keyNutrients: ["Variable based on ingredients"],
          healthBenefits: ["Convenience", "Portion control", "Balanced nutrition if well-prepared"]
        },
        availability: {
          whereToBuy: ["Supermarket deli sections", "Restaurants", "Food trucks", "Caterers"],
          seasonality: "Available year-round",
          averagePrice: "R30-80 per meal"
        },
        facts: [
          "Growing market in South African urban areas",
          "Many incorporate traditional SA flavors and ingredients",
          "Important for busy urban lifestyles"
        ],
        description: "Convenient food option requiring careful temperature management"
      },
      'canned goods': {
        name: "Canned Food Item",
        category: "processed",
        origin: "Commercial food processing facility",
        shelfLife: "1-3 years from manufacture date if unopened",
        typicalShelfLife: "2-5 years if stored properly",
        recommendations: [
          "Store in cool, dry place away from direct sunlight",
          "Check cans for dents, rust, or swelling",
          "Use oldest items first (FIFO)",
          "Transfer to refrigerator after opening and use within 3-5 days",
          "In SA heat, avoid storing in hot areas"
        ],
        nutrients: ["Varies by product", "Often fortified with vitamins"],
        nutritionalProfile: {
          calories: "80-200 per 100g typically",
          keyNutrients: ["Variable based on contents"],
          healthBenefits: ["Long-term nutrition storage", "Convenience", "Food security"]
        },
        availability: {
          whereToBuy: ["All supermarkets", "Convenience stores", "Wholesale stores", "Spaza shops"],
          seasonality: "Available year-round",
          averagePrice: "R10-30 per can"
        },
        facts: [
          "Important for food security in South African households",
          "Local brands like All Gold and KOO are popular",
          "Essential for emergency food supplies"
        ],
        description: "Shelf-stable food option important for food security"
      }
    };
    
    return demoDatabase[foodType || 'other'] || demoDatabase['fresh produce'];
  }

  private buildSystemPrompt(userContext?: UserContext): string {
    return `You are NourishSA's AI assistant, specializing in food rescue, safety, and community support in South Africa.

CORE EXPERTISE:
- Food safety guidelines and storage best practices
- Platform navigation and feature explanation  
- Volunteer coordination and task guidance
- Emergency food assistance and resources
- Community food hubs and donation processes
- Basic nutrition and food waste education

RESPONSE APPROACH:
- Be helpful, practical, and action-oriented
- Focus on food-related solutions and safety
- Direct users to appropriate platform features
- Provide South African context when relevant
- If asked about non-food topics, gently redirect to food rescue mission

USER CONTEXT:
- Location: ${userContext?.location || 'South Africa'}
- Role: ${userContext?.role || 'community member'}
- Verified: ${userContext?.isVerified ? 'Yes' : 'No'}

SAMPLE INTERACTIONS:
- Food safety questions → Provide clear, practical guidance
- "How to volunteer?" → Explain verification process and task types
- "Need food help?" → Direct to food hubs, emergency resources
- "Want to donate?" → Guide through donation process
- Non-food topics → "I focus on food rescue and safety. For that topic, try [relevant suggestion]. How can I help with food-related questions?"

When suggesting actions, use: ACTION: [navigate|external]|[url]|[label]

Available routes:
- /volunteer (Volunteer hub)
- /ai (AI features) 
- /food-hubs (Find food hubs)
- /donate (Donate surplus food)
- /bag (Request food assistance)`;
  }

  private parseResponse(content: string, userContext?: UserContext): ChatResponse {
    const actions: ChatResponse['actions'] = [];
    const suggestions: string[] = [];

    // Parse actions from response
    const actionRegex = /ACTION:\s*(\w+)\|([^|]+)\|([^|\n]+)/g;
    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      actions.push({
        type: match[1] as 'navigate' | 'external',
        target: match[2],
        label: match[3],
      });
    }

    // Remove action syntax from displayed message
    const cleanContent = content.replace(actionRegex, '').trim();

    // Add contextual suggestions
    if (userContext?.location && !userContext.role) {
      suggestions.push('How do I become a volunteer?');
    }
    if (userContext?.role === 'pickup') {
      suggestions.push('Show me pickup tasks near me');
    }

    return {
      message: cleanContent,
      actions: actions.length > 0 ? actions : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }
}

export const aiService = new AIService();
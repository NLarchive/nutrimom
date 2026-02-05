/**
 * LLM Vision Food Analysis - Configuration & Prompts
 * 
 * This module contains the prompt engineering and schema definitions
 * for analyzing food images using LLM vision APIs.
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

const LLMFoodConfig = {
  // ─────────────────────────────────────────────────────────────────────────────
  // System Prompt for Food Analysis
  // ─────────────────────────────────────────────────────────────────────────────
  
  systemPrompt: `You are an expert nutritionist AI assistant specialized in analyzing food images. Your task is to:

1. IDENTIFY all food items visible in the image with high accuracy
2. ESTIMATE portion sizes based on visual cues (plate size, common serving sizes)
3. CALCULATE approximate nutritional content for each item
4. PROVIDE confidence levels for your estimates

IMPORTANT GUIDELINES:
- Be conservative with estimates - it's better to slightly underestimate than overestimate
- Consider cooking methods visible (fried, grilled, raw, etc.) as they affect nutrition
- Account for visible sauces, dressings, or toppings
- If portion size is unclear, use standard serving sizes as reference
- For mixed dishes, break down into identifiable components when possible

OUTPUT FORMAT: You must respond with valid JSON matching the provided schema.`,

  // ─────────────────────────────────────────────────────────────────────────────
  // User Prompt Template
  // ─────────────────────────────────────────────────────────────────────────────
  
  userPromptTemplate: `Analyze this food image and provide detailed nutritional information.

Please identify each food item and estimate its nutritional content.

Respond ONLY with valid JSON matching this exact structure:

{
  "analysis_id": "unique_string",
  "timestamp": "ISO8601_datetime",
  "confidence_overall": 0.0-1.0,
  "meal_type": "breakfast|lunch|dinner|snack",
  "food_items": [
    {
      "name": "food item name",
      "quantity": number,
      "unit": "piece|gram|ml|cup|tablespoon|slice",
      "estimated_weight_g": number,
      "confidence": 0.0-1.0,
      "preparation_method": "raw|fried|grilled|baked|steamed|boiled",
      "nutrients": {
        "energy_kcal": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number,
        "fiber_g": number,
        "sugar_g": number,
        "sodium_mg": number,
        "saturated_fat_g": number
      },
      "micronutrients": {
        "vitamin_a_ug": number or null,
        "vitamin_c_mg": number or null,
        "vitamin_d_ug": number or null,
        "vitamin_e_mg": number or null,
        "vitamin_k_ug": number or null,
        "folate_ug": number or null,
        "iron_mg": number or null,
        "calcium_mg": number or null,
        "potassium_mg": number or null,
        "magnesium_mg": number or null,
        "zinc_mg": number or null,
        "omega3_mg": number or null
      }
    }
  ],
  "totals": {
    "energy_kcal": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sodium_mg": number
  },
  "warnings": ["array of any nutritional warnings or notes"],
  "pregnancy_relevant_notes": ["notes specifically relevant for pregnant women"]
}`,

  // ─────────────────────────────────────────────────────────────────────────────
  // JSON Schema for Response Validation
  // ─────────────────────────────────────────────────────────────────────────────
  
  responseSchema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "LLM Food Analysis Response",
    "type": "object",
    "required": ["analysis_id", "timestamp", "confidence_overall", "food_items", "totals"],
    "properties": {
      "analysis_id": {
        "type": "string",
        "description": "Unique identifier for this analysis"
      },
      "timestamp": {
        "type": "string",
        "format": "date-time",
        "description": "ISO8601 timestamp of analysis"
      },
      "confidence_overall": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Overall confidence score (0-1)"
      },
      "meal_type": {
        "type": "string",
        "enum": ["breakfast", "lunch", "dinner", "snack"],
        "description": "Estimated meal type"
      },
      "food_items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name", "quantity", "unit", "estimated_weight_g", "nutrients"],
          "properties": {
            "name": { "type": "string" },
            "quantity": { "type": "number" },
            "unit": {
              "type": "string",
              "enum": ["piece", "gram", "ml", "cup", "tablespoon", "slice", "serving"]
            },
            "estimated_weight_g": { "type": "number" },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
            "preparation_method": {
              "type": "string",
              "enum": ["raw", "fried", "grilled", "baked", "steamed", "boiled", "roasted"]
            },
            "nutrients": {
              "type": "object",
              "required": ["energy_kcal", "protein_g", "carbs_g", "fat_g"],
              "properties": {
                "energy_kcal": { "type": "number" },
                "protein_g": { "type": "number" },
                "carbs_g": { "type": "number" },
                "fat_g": { "type": "number" },
                "fiber_g": { "type": "number" },
                "sugar_g": { "type": "number" },
                "sodium_mg": { "type": "number" },
                "saturated_fat_g": { "type": "number" }
              }
            },
            "micronutrients": {
              "type": "object",
              "properties": {
                "vitamin_a_ug": { "type": ["number", "null"] },
                "vitamin_c_mg": { "type": ["number", "null"] },
                "vitamin_d_ug": { "type": ["number", "null"] },
                "vitamin_e_mg": { "type": ["number", "null"] },
                "vitamin_k_ug": { "type": ["number", "null"] },
                "folate_ug": { "type": ["number", "null"] },
                "iron_mg": { "type": ["number", "null"] },
                "calcium_mg": { "type": ["number", "null"] },
                "potassium_mg": { "type": ["number", "null"] },
                "magnesium_mg": { "type": ["number", "null"] },
                "zinc_mg": { "type": ["number", "null"] },
                "omega3_mg": { "type": ["number", "null"] }
              }
            }
          }
        }
      },
      "totals": {
        "type": "object",
        "required": ["energy_kcal", "protein_g", "carbs_g", "fat_g"],
        "properties": {
          "energy_kcal": { "type": "number" },
          "protein_g": { "type": "number" },
          "carbs_g": { "type": "number" },
          "fat_g": { "type": "number" },
          "fiber_g": { "type": "number" },
          "sodium_mg": { "type": "number" }
        }
      },
      "warnings": {
        "type": "array",
        "items": { "type": "string" }
      },
      "pregnancy_relevant_notes": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // API Configuration Templates
  // ─────────────────────────────────────────────────────────────────────────────
  
  apiProviders: {
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4-vision-preview',
      maxTokens: 4096,
      buildRequest: (imageBase64, config) => ({
        model: config.model || 'gpt-4-vision-preview',
        messages: [
          { role: 'system', content: LLMFoodConfig.systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: LLMFoodConfig.userPromptTemplate },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: config.maxTokens || 4096,
        response_format: { type: 'json_object' }
      })
    },
    
    anthropic: {
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-opus-20240229',
      maxTokens: 4096,
      buildRequest: (imageBase64, config) => ({
        model: config.model || 'claude-3-opus-20240229',
        max_tokens: config.maxTokens || 4096,
        system: LLMFoodConfig.systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              },
              { type: 'text', text: LLMFoodConfig.userPromptTemplate }
            ]
          }
        ]
      })
    },
    
    google: {
      endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent',
      model: 'gemini-pro-vision',
      maxTokens: 4096,
      buildRequest: (imageBase64, config, apiKey) => ({
        contents: [{
          parts: [
            { text: LLMFoodConfig.systemPrompt + '\n\n' + LLMFoodConfig.userPromptTemplate },
            { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
          ]
        }],
        generationConfig: { maxOutputTokens: config.maxTokens || 4096 }
      })
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LLMFoodConfig;
}

// Ensure global availability
if (typeof window !== 'undefined') {
  window.LLMFoodConfig = LLMFoodConfig;
}

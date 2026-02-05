# Food Tracker Plugin

A modular LLM vision-powered food tracking plugin for NutriMom pregnancy nutrition calculator.

## Features

- 📷 **Image Analysis**: Upload food photos for automatic nutritional analysis
- 🤖 **LLM Integration**: Supports OpenAI, Anthropic, and Google vision APIs
- 💾 **Local Storage**: Tracks daily food intake in browser localStorage
- 📊 **Nutrient Comparison**: Compare intake against pregnancy nutrition targets
- 🧪 **Mock Mode**: Built-in mock responses for development/testing

## Quick Start

### 1. Include the plugin files

```html
<link rel="stylesheet" href="src/plugins/food-tracker/food-tracker.css">

<script src="src/plugins/food-tracker/llm-config.js"></script>
<script src="src/plugins/food-tracker/mock-responses.js"></script>
<script src="src/plugins/food-tracker/food-tracker-engine.js"></script>
<script src="src/plugins/food-tracker/food-tracker-ui.js"></script>
<script src="src/plugins/food-tracker/index.js"></script>
```

### 2. Add a container element

```html
<div id="food-tracker-container"></div>
```

### 3. Initialize the plugin

```javascript
const foodTracker = new FoodTrackerPlugin({
  containerId: 'food-tracker-container',
  useMock: true  // Use mock responses (no API key needed)
});

foodTracker.init();
```

## Configuration Options

```javascript
const foodTracker = new FoodTrackerPlugin({
  // Required
  containerId: 'food-tracker-container',  // DOM element ID
  
  // API Configuration
  apiProvider: 'openai',    // 'openai', 'anthropic', 'google', or 'mock'
  apiKey: 'your-api-key',   // Required for real API calls
  useMock: false,           // Use mock responses instead of API
  
  // Storage
  storageKey: 'nutrimom_food_log',  // localStorage key
  
  // Integration
  nutritionEngine: null,    // NutritionEngine instance
  userTargets: {            // Nutrient targets for comparison
    energy: { rdi: 2200, unit: 'kcal' },
    protein: { rdi: 71, unit: 'g' },
    iron: { rdi: 27, ul: 45, unit: 'mg' },
    // ... more nutrients
  },
  
  // Callbacks
  onMealAdded: (dailyLog) => { },
  onMealRemoved: (dailyLog) => { }
});
```

## API Reference

### FoodTrackerPlugin

```javascript
// Initialize plugin (call after DOM ready)
foodTracker.init();

// Analyze an image programmatically
const analysis = await foodTracker.analyzeImage(file, 'lunch');

// Add analyzed food to log
foodTracker.addToLog(analysis, imageDataUrl);

// Get today's log
const dailyLog = foodTracker.getDailyLog();

// Compare intake against targets
const comparison = foodTracker.compareToTargets();

// Get daily summary with recommendations
const summary = foodTracker.getDailySummary();

// Update user targets
foodTracker.setUserTargets(newTargets);

// Clear all data
foodTracker.clearAll();

// Access underlying components
const engine = foodTracker.getEngine();
const ui = foodTracker.getUI();
```

### LLM Response Schema

The plugin expects LLM responses in this format:

```json
{
  "analysis_id": "unique_string",
  "timestamp": "2024-01-15T12:30:00Z",
  "confidence_overall": 0.89,
  "meal_type": "lunch",
  "food_items": [
    {
      "name": "Falafel",
      "quantity": 3,
      "unit": "piece",
      "estimated_weight_g": 105,
      "confidence": 0.92,
      "preparation_method": "fried",
      "nutrients": {
        "energy_kcal": 189,
        "protein_g": 7.8,
        "carbs_g": 18.9,
        "fat_g": 9.6,
        "fiber_g": 4.5
      },
      "micronutrients": {
        "iron_mg": 2.1,
        "calcium_mg": 42,
        "folate_ug": 84
      }
    }
  ],
  "totals": {
    "energy_kcal": 393,
    "protein_g": 12.5,
    "carbs_g": 33.9,
    "fat_g": 25.4,
    "fiber_g": 13.1
  },
  "warnings": ["Optional nutritional warnings"],
  "pregnancy_relevant_notes": ["Notes specific to pregnancy nutrition"]
}
```

## File Structure

```
src/plugins/food-tracker/
├── index.js              # Main plugin entry point
├── llm-config.js         # LLM prompts and API configurations
├── food-tracker-engine.js # Core tracking logic
├── food-tracker-ui.js    # UI component
├── food-tracker.css      # Styles
├── mock-responses.js     # Mock LLM responses for testing
├── demo.html             # Demo/test page
└── README.md             # This file
```

## Mock Responses

For development and testing, the plugin includes pre-built mock responses:

- `MockFoodResponses.falafelSaladPlate` - Falafel + salad lunch
- `MockFoodResponses.breakfastOatmeal` - Oatmeal with blueberries
- `MockFoodResponses.grilledSalmon` - Salmon dinner with vegetables

## Integration with NutriMom

```javascript
// When user calculates their nutrition needs
const targets = nutritionEngine.calculateTargets(userProfile);

// Pass targets to food tracker
foodTracker.setUserTargets(targets);

// Now comparisons will use personalized targets
const summary = foodTracker.getDailySummary();
console.log(summary.nutrientsDeficit);  // Nutrients below target
console.log(summary.recommendations);   // Food suggestions
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires: localStorage, File API, Fetch API

## License

CC-BY-NC-SA-4.0 © Nicolas Ivan Larenas Bustamante

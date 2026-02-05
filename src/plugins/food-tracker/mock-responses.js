/**
 * Mock Food Analysis Responses
 * 
 * Pre-defined LLM responses for testing and development
 * without requiring actual API calls.
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

const MockFoodResponses = {
  // ─────────────────────────────────────────────────────────────────────────────
  // Falafel + Salad Plate (Primary Test Case)
  // Visible: 3 falafel patties (fried, sesame coated), mixed salad with
  // iceberg lettuce, cherry tomatoes, avocado slices, radish, black sesame, dill
  // ─────────────────────────────────────────────────────────────────────────────
  
  falafelSaladPlate: {
    "analysis_id": "mock_falafel_001",
    "timestamp": new Date().toISOString(),
    "confidence_overall": 0.89,
    "meal_type": "lunch",
    "food_items": [
      {
        "name": "Falafel (fried chickpea patty with sesame)",
        "quantity": 3,
        "unit": "piece",
        "estimated_weight_g": 105,  // ~35g each
        "confidence": 0.92,
        "preparation_method": "fried",
        "nutrients": {
          "energy_kcal": 189,
          "protein_g": 7.8,
          "carbs_g": 18.9,
          "fat_g": 9.6,
          "fiber_g": 4.5,
          "sugar_g": 0.9,
          "sodium_mg": 330,
          "saturated_fat_g": 1.2
        },
        "micronutrients": {
          "vitamin_a_ug": 3,
          "vitamin_c_mg": 1.2,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.8,
          "vitamin_k_ug": 6.3,
          "folate_ug": 84,
          "iron_mg": 2.1,
          "calcium_mg": 42,
          "potassium_mg": 210,
          "magnesium_mg": 36,
          "zinc_mg": 1.2,
          "omega3_mg": 45
        }
      },
      {
        "name": "Avocado slices",
        "quantity": 0.5,
        "unit": "piece",
        "estimated_weight_g": 75,
        "confidence": 0.88,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 120,
          "protein_g": 1.5,
          "carbs_g": 6.4,
          "fat_g": 11.0,
          "fiber_g": 5.0,
          "sugar_g": 0.5,
          "sodium_mg": 5,
          "saturated_fat_g": 1.6
        },
        "micronutrients": {
          "vitamin_a_ug": 5,
          "vitamin_c_mg": 7.5,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 1.6,
          "vitamin_k_ug": 15.8,
          "folate_ug": 61,
          "iron_mg": 0.4,
          "calcium_mg": 9,
          "potassium_mg": 364,
          "magnesium_mg": 22,
          "zinc_mg": 0.5,
          "omega3_mg": 83
        }
      },
      {
        "name": "Cherry tomatoes",
        "quantity": 6,
        "unit": "piece",
        "estimated_weight_g": 90,
        "confidence": 0.95,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 16,
          "protein_g": 0.8,
          "carbs_g": 3.5,
          "fat_g": 0.2,
          "fiber_g": 1.1,
          "sugar_g": 2.4,
          "sodium_mg": 5,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 75,
          "vitamin_c_mg": 12.3,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.5,
          "vitamin_k_ug": 7.1,
          "folate_ug": 13,
          "iron_mg": 0.2,
          "calcium_mg": 9,
          "potassium_mg": 213,
          "magnesium_mg": 10,
          "zinc_mg": 0.2,
          "omega3_mg": 3
        }
      },
      {
        "name": "Iceberg lettuce",
        "quantity": 1,
        "unit": "cup",
        "estimated_weight_g": 55,
        "confidence": 0.90,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 8,
          "protein_g": 0.5,
          "carbs_g": 1.6,
          "fat_g": 0.1,
          "fiber_g": 0.7,
          "sugar_g": 1.1,
          "sodium_mg": 6,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 18,
          "vitamin_c_mg": 1.6,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.1,
          "vitamin_k_ug": 13.6,
          "folate_ug": 16,
          "iron_mg": 0.2,
          "calcium_mg": 10,
          "potassium_mg": 78,
          "magnesium_mg": 4,
          "zinc_mg": 0.1,
          "omega3_mg": 17
        }
      },
      {
        "name": "Radish slices",
        "quantity": 4,
        "unit": "piece",
        "estimated_weight_g": 36,
        "confidence": 0.85,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 6,
          "protein_g": 0.2,
          "carbs_g": 1.2,
          "fat_g": 0,
          "fiber_g": 0.6,
          "sugar_g": 0.7,
          "sodium_mg": 14,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 0,
          "vitamin_c_mg": 5.3,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0,
          "vitamin_k_ug": 0.5,
          "folate_ug": 9,
          "iron_mg": 0.1,
          "calcium_mg": 9,
          "potassium_mg": 84,
          "magnesium_mg": 4,
          "zinc_mg": 0.1,
          "omega3_mg": 12
        }
      },
      {
        "name": "Black sesame seeds",
        "quantity": 1,
        "unit": "tablespoon",
        "estimated_weight_g": 9,
        "confidence": 0.82,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 52,
          "protein_g": 1.6,
          "carbs_g": 2.1,
          "fat_g": 4.5,
          "fiber_g": 1.1,
          "sugar_g": 0,
          "sodium_mg": 1,
          "saturated_fat_g": 0.6
        },
        "micronutrients": {
          "vitamin_a_ug": 0,
          "vitamin_c_mg": 0,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.2,
          "vitamin_k_ug": 0,
          "folate_ug": 9,
          "iron_mg": 1.3,
          "calcium_mg": 88,
          "potassium_mg": 42,
          "magnesium_mg": 32,
          "zinc_mg": 0.7,
          "omega3_mg": 34
        }
      },
      {
        "name": "Fresh dill",
        "quantity": 2,
        "unit": "tablespoon",
        "estimated_weight_g": 4,
        "confidence": 0.78,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 2,
          "protein_g": 0.1,
          "carbs_g": 0.2,
          "fat_g": 0,
          "fiber_g": 0.1,
          "sugar_g": 0,
          "sodium_mg": 2,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 31,
          "vitamin_c_mg": 3.4,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0,
          "vitamin_k_ug": 0,
          "folate_ug": 6,
          "iron_mg": 0.3,
          "calcium_mg": 8,
          "potassium_mg": 26,
          "magnesium_mg": 2,
          "zinc_mg": 0,
          "omega3_mg": 0
        }
      }
    ],
    "totals": {
      "energy_kcal": 393,
      "protein_g": 12.5,
      "carbs_g": 33.9,
      "fat_g": 25.4,
      "fiber_g": 13.1,
      "sodium_mg": 363
    },
    "warnings": [
      "Fried falafel adds extra calories from oil absorption",
      "Meal is relatively low in protein - consider adding hummus or tahini"
    ],
    "pregnancy_relevant_notes": [
      "Good source of folate from chickpeas and leafy greens - essential for fetal development",
      "Contains iron from falafel and sesame seeds - important during pregnancy",
      "Avocado provides healthy fats supporting baby's brain development",
      "Raw vegetables are safe and provide important fiber for digestive health",
      "Consider pairing with a protein source to meet increased pregnancy protein needs"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Additional Mock Responses for Testing
  // ─────────────────────────────────────────────────────────────────────────────

  breakfastOatmeal: {
    "analysis_id": "mock_oatmeal_001",
    "timestamp": new Date().toISOString(),
    "confidence_overall": 0.91,
    "meal_type": "breakfast",
    "food_items": [
      {
        "name": "Oatmeal with milk",
        "quantity": 1,
        "unit": "cup",
        "estimated_weight_g": 240,
        "confidence": 0.93,
        "preparation_method": "boiled",
        "nutrients": {
          "energy_kcal": 165,
          "protein_g": 6.0,
          "carbs_g": 28.0,
          "fat_g": 3.5,
          "fiber_g": 4.0,
          "sugar_g": 1.0,
          "sodium_mg": 115,
          "saturated_fat_g": 0.7
        },
        "micronutrients": {
          "vitamin_a_ug": 45,
          "vitamin_c_mg": 0,
          "vitamin_d_ug": 1.0,
          "vitamin_e_mg": 0.2,
          "vitamin_k_ug": 0.5,
          "folate_ug": 14,
          "iron_mg": 1.7,
          "calcium_mg": 130,
          "potassium_mg": 180,
          "magnesium_mg": 56,
          "zinc_mg": 1.5,
          "omega3_mg": 25
        }
      },
      {
        "name": "Blueberries",
        "quantity": 0.5,
        "unit": "cup",
        "estimated_weight_g": 74,
        "confidence": 0.95,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 42,
          "protein_g": 0.5,
          "carbs_g": 10.7,
          "fat_g": 0.2,
          "fiber_g": 1.8,
          "sugar_g": 7.4,
          "sodium_mg": 1,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 2,
          "vitamin_c_mg": 7.2,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.4,
          "vitamin_k_ug": 14.4,
          "folate_ug": 4,
          "iron_mg": 0.2,
          "calcium_mg": 4,
          "potassium_mg": 57,
          "magnesium_mg": 4,
          "zinc_mg": 0.1,
          "omega3_mg": 45
        }
      },
      {
        "name": "Honey drizzle",
        "quantity": 1,
        "unit": "tablespoon",
        "estimated_weight_g": 21,
        "confidence": 0.85,
        "preparation_method": "raw",
        "nutrients": {
          "energy_kcal": 64,
          "protein_g": 0.1,
          "carbs_g": 17.3,
          "fat_g": 0,
          "fiber_g": 0,
          "sugar_g": 17.2,
          "sodium_mg": 1,
          "saturated_fat_g": 0
        },
        "micronutrients": {
          "vitamin_a_ug": 0,
          "vitamin_c_mg": 0.1,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0,
          "vitamin_k_ug": 0,
          "folate_ug": 0,
          "iron_mg": 0.1,
          "calcium_mg": 1,
          "potassium_mg": 11,
          "magnesium_mg": 0,
          "zinc_mg": 0,
          "omega3_mg": 0
        }
      }
    ],
    "totals": {
      "energy_kcal": 271,
      "protein_g": 6.6,
      "carbs_g": 56.0,
      "fat_g": 3.7,
      "fiber_g": 5.8,
      "sodium_mg": 117
    },
    "warnings": [],
    "pregnancy_relevant_notes": [
      "Oatmeal is excellent for digestive health during pregnancy",
      "Contains iron which supports increased blood volume",
      "Blueberries provide antioxidants beneficial during pregnancy"
    ]
  },

  grilledSalmon: {
    "analysis_id": "mock_salmon_001",
    "timestamp": new Date().toISOString(),
    "confidence_overall": 0.94,
    "meal_type": "dinner",
    "food_items": [
      {
        "name": "Grilled salmon fillet",
        "quantity": 1,
        "unit": "piece",
        "estimated_weight_g": 170,
        "confidence": 0.96,
        "preparation_method": "grilled",
        "nutrients": {
          "energy_kcal": 350,
          "protein_g": 39.0,
          "carbs_g": 0,
          "fat_g": 21.0,
          "fiber_g": 0,
          "sugar_g": 0,
          "sodium_mg": 75,
          "saturated_fat_g": 4.0
        },
        "micronutrients": {
          "vitamin_a_ug": 15,
          "vitamin_c_mg": 0,
          "vitamin_d_ug": 14.5,
          "vitamin_e_mg": 2.5,
          "vitamin_k_ug": 0.5,
          "folate_ug": 44,
          "iron_mg": 0.7,
          "calcium_mg": 20,
          "potassium_mg": 628,
          "magnesium_mg": 51,
          "zinc_mg": 0.8,
          "omega3_mg": 2260
        }
      },
      {
        "name": "Steamed broccoli",
        "quantity": 1,
        "unit": "cup",
        "estimated_weight_g": 156,
        "confidence": 0.92,
        "preparation_method": "steamed",
        "nutrients": {
          "energy_kcal": 55,
          "protein_g": 3.7,
          "carbs_g": 11.2,
          "fat_g": 0.6,
          "fiber_g": 5.1,
          "sugar_g": 2.2,
          "sodium_mg": 64,
          "saturated_fat_g": 0.1
        },
        "micronutrients": {
          "vitamin_a_ug": 60,
          "vitamin_c_mg": 101,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 1.2,
          "vitamin_k_ug": 220,
          "folate_ug": 168,
          "iron_mg": 1.0,
          "calcium_mg": 62,
          "potassium_mg": 457,
          "magnesium_mg": 33,
          "zinc_mg": 0.6,
          "omega3_mg": 186
        }
      },
      {
        "name": "Brown rice",
        "quantity": 0.5,
        "unit": "cup",
        "estimated_weight_g": 100,
        "confidence": 0.90,
        "preparation_method": "boiled",
        "nutrients": {
          "energy_kcal": 110,
          "protein_g": 2.6,
          "carbs_g": 22.4,
          "fat_g": 0.9,
          "fiber_g": 1.8,
          "sugar_g": 0.4,
          "sodium_mg": 5,
          "saturated_fat_g": 0.2
        },
        "micronutrients": {
          "vitamin_a_ug": 0,
          "vitamin_c_mg": 0,
          "vitamin_d_ug": 0,
          "vitamin_e_mg": 0.1,
          "vitamin_k_ug": 0.6,
          "folate_ug": 4,
          "iron_mg": 0.5,
          "calcium_mg": 10,
          "potassium_mg": 77,
          "magnesium_mg": 43,
          "zinc_mg": 0.6,
          "omega3_mg": 14
        }
      }
    ],
    "totals": {
      "energy_kcal": 515,
      "protein_g": 45.3,
      "carbs_g": 33.6,
      "fat_g": 22.5,
      "fiber_g": 6.9,
      "sodium_mg": 144
    },
    "warnings": [],
    "pregnancy_relevant_notes": [
      "Excellent source of omega-3 DHA - crucial for baby's brain development",
      "High-quality protein supports fetal growth",
      "Salmon provides vitamin D which is often deficient during pregnancy",
      "Broccoli is rich in folate - essential for neural tube development",
      "This meal covers a significant portion of daily omega-3 needs"
    ]
  },

  // Helper to get random mock response
  getRandomMeal() {
    const meals = [
      this.falafelSaladPlate,
      this.breakfastOatmeal,
      this.grilledSalmon,
      this.codCroquette
    ];
    return meals[Math.floor(Math.random() * meals.length)];
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Cod Croquette (Croqueta de Bacalao) - Spanish Tapa
  // ─────────────────────────────────────────────────────────────────────────────
  
  codCroquette: {
    "analysis_id": "mock_croqueta_001",
    "timestamp": new Date().toISOString(),
    "confidence_overall": 0.91,
    "meal_type": "snack",
    "food_items": [
      {
        "name": "Croqueta de bacalao (Cod croquette)",
        "quantity": 1,
        "unit": "piece",
        "estimated_weight_g": 30,
        "confidence": 0.93,
        "preparation_method": "fried",
        "nutrients": {
          "energy_kcal": 85,
          "protein_g": 4.2,
          "carbs_g": 8.5,
          "fat_g": 4.1,
          "fiber_g": 0.3,
          "sugar_g": 0.5,
          "sodium_mg": 180,
          "saturated_fat_g": 1.2
        },
        "micronutrients": {
          "vitamin_a_ug": 25,
          "vitamin_c_mg": 0,
          "vitamin_d_ug": 0.8,
          "vitamin_e_mg": 0.4,
          "vitamin_k_ug": 1.2,
          "folate_ug": 8,
          "iron_mg": 0.4,
          "calcium_mg": 35,
          "potassium_mg": 65,
          "magnesium_mg": 10,
          "zinc_mg": 0.3,
          "omega3_mg": 120
        }
      }
    ],
    "totals": {
      "energy_kcal": 85,
      "protein_g": 4.2,
      "carbs_g": 8.5,
      "fat_g": 4.1,
      "fiber_g": 0.3,
      "sodium_mg": 180
    },
    "warnings": [
      "Fried food - higher in calories due to oil absorption",
      "Contains gluten from flour coating"
    ],
    "pregnancy_relevant_notes": [
      "Cod provides omega-3 fatty acids beneficial for fetal brain development",
      "Good source of protein for pregnancy",
      "Contains vitamin D which supports calcium absorption",
      "Moderate sodium content - watch daily intake during pregnancy",
      "Ensure cod is fully cooked (croquettes are typically safe when properly fried)"
    ]
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockFoodResponses;
}

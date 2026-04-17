import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NutritionInfo {
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sugarGrams?: number;
  fiberGrams?: number;
  sodiumMg?: number;
  servingSize: string;
  isValidFood: boolean;
}

export async function getNutritionDetails(foodQuery: string): Promise<NutritionInfo> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following food query: "${foodQuery}". Provide its nutritional information. If the query does not represent a food or cannot be analyzed, set isValidFood to false and set arbitrary 0 values for everything else. Try to use standard, common serving sizes for the given food if a quantity wasn't specified.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING, description: "Capitalized full name of the food." },
          isValidFood: { type: Type.BOOLEAN, description: "False if the input is gibberish, not a food, or unanalyzable." },
          servingSize: { type: Type.STRING, description: "The serving size these facts are based on, e.g., '1 medium apple (182g)', '1 cup (240ml)', '100g'." },
          calories: { type: Type.NUMBER, description: "Total calories." },
          proteinGrams: { type: Type.NUMBER, description: "Protein in grams." },
          carbsGrams: { type: Type.NUMBER, description: "Carbohydrates in grams." },
          fatGrams: { type: Type.NUMBER, description: "Total fat in grams." },
          sugarGrams: { type: Type.NUMBER, description: "Sugar in grams." },
          fiberGrams: { type: Type.NUMBER, description: "Dietary fiber in grams." },
          sodiumMg: { type: Type.NUMBER, description: "Sodium in milligrams." }
        },
        required: ["foodName", "isValidFood", "servingSize", "calories", "proteinGrams", "carbsGrams", "fatGrams"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to parse response from Gemini.");
  }
  
  return JSON.parse(text) as NutritionInfo;
}

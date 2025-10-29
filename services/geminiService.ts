
import { GoogleGenAI } from "@google/genai";
import type { LatLng, RestaurantInfo } from '../types';

const fetchRestaurantInfo = async (query: string, location: LatLng): Promise<RestaurantInfo> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
      },
      toolConfig: {
        retrievalConfig: {
          latLng: location
        }
      }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

    if (!text) {
        throw new Error("Received an empty response from the AI.");
    }
    
    return { text, sources };

  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get restaurant information: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching restaurant information.");
  }
};

export { fetchRestaurantInfo };

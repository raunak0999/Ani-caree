import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ""
});

export interface CareRecommendationResponse {
  nutrition: {
    title: string;
    description: string;
    tips: string[];
  };
  grooming: {
    title: string;
    description: string;
    tips: string[];
  };
  health: {
    title: string;
    description: string;
    tips: string[];
  };
}

export async function generateCareRecommendations(
  petName: string, 
  age: string, 
  breed: string, 
  size?: string
): Promise<CareRecommendationResponse> {
  try {
    const prompt = `As a professional veterinarian and pet care expert, provide comprehensive care recommendations for a pet with the following details:

Name: ${petName}
Age: ${age}
Breed: ${breed}
Size: ${size || 'Not specified'}

Please provide specific, actionable recommendations in these three categories:
1. Nutrition - Diet, feeding schedule, foods to avoid
2. Grooming - Brushing, bathing, nail care, professional grooming
3. Health - Exercise needs, common health concerns, preventive care

Format your response as JSON with this exact structure:
{
  "nutrition": {
    "title": "Nutrition Guide",
    "description": "Brief description based on the pet's details",
    "tips": ["tip1", "tip2", "tip3", "tip4"]
  },
  "grooming": {
    "title": "Grooming Schedule", 
    "description": "Brief description customized for breed",
    "tips": ["tip1", "tip2", "tip3", "tip4"]
  },
  "health": {
    "title": "Health Monitoring",
    "description": "Brief description for age-specific health",
    "tips": ["tip1", "tip2", "tip3", "tip4"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional veterinarian with expertise in pet care, nutrition, and training. Provide accurate, helpful advice for pet owners."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as CareRecommendationResponse;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate care recommendations. Please try again.");
  }
}

export async function generateChatResponse(message: string, petContext?: string): Promise<string> {
  try {
    const systemPrompt = `You are AniCare AI Assistant, a professional pet care expert. You provide helpful, accurate advice about pet nutrition, training, health, grooming, and behavior. 

${petContext ? `Context about user's pet: ${petContext}` : ''}

Keep responses helpful, friendly, and concise. If the question is about serious health concerns, always recommend consulting a veterinarian.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try asking again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}

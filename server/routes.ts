import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPetProfileSchema, 
  insertChatMessageSchema,
  type PetProfile
} from "@shared/schema";
import { generateCareRecommendations, generateChatResponse } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pet Profile Routes
  app.post("/api/pet-profiles", async (req, res) => {
    try {
      const validatedData = insertPetProfileSchema.parse(req.body);
      const petProfile = await storage.createPetProfile(validatedData);
      
      // Generate AI recommendations after creating profile
      try {
        const recommendations = await generateCareRecommendations(
          petProfile.name,
          petProfile.age,
          petProfile.breed,
          petProfile.size || undefined
        );

        // Store recommendations
        await Promise.all([
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "nutrition",
            title: recommendations.nutrition.title,
            description: recommendations.nutrition.description,
            tips: recommendations.nutrition.tips
          }),
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "grooming", 
            title: recommendations.grooming.title,
            description: recommendations.grooming.description,
            tips: recommendations.grooming.tips
          }),
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "health",
            title: recommendations.health.title,
            description: recommendations.health.description,
            tips: recommendations.health.tips
          })
        ]);
      } catch (aiError) {
        console.error("AI recommendation generation failed:", aiError);
        // Create fallback recommendations manually
        await Promise.all([
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "nutrition",
            title: `Nutrition Guide for ${petProfile.name}`,
            description: `Feeding recommendations for your ${petProfile.age.toLowerCase()} ${petProfile.breed}`,
            tips: [
              "Feed high-quality pet food appropriate for age and size",
              "Maintain regular feeding schedule twice daily",
              "Provide fresh water at all times",
              "Avoid foods toxic to pets like chocolate and grapes"
            ]
          }),
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "grooming",
            title: `Grooming Schedule for ${petProfile.name}`,
            description: `Regular grooming routine for your ${petProfile.breed}`,
            tips: [
              "Brush regularly to prevent matting and reduce shedding",
              "Bathe every 4-6 weeks or when dirty",
              "Trim nails every 2-3 weeks",
              "Clean ears weekly to prevent infections"
            ]
          }),
          storage.createCareRecommendation({
            petProfileId: petProfile.id,
            category: "health",
            title: `Health Monitoring for ${petProfile.name}`,
            description: `Health care for your ${petProfile.age.toLowerCase()} ${petProfile.breed}`,
            tips: [
              "Schedule regular veterinary checkups",
              "Keep up with vaccinations and preventive care",
              "Monitor for breed-specific health concerns",
              "Provide daily exercise appropriate for age and breed"
            ]
          })
        ]);
      }

      res.json(petProfile);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet profile data" });
    }
  });

  app.get("/api/pet-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllPetProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet profiles" });
    }
  });

  app.get("/api/pet-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getPetProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Pet profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet profile" });
    }
  });

  // Care Recommendations Routes
  app.get("/api/care-recommendations/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const recommendations = await storage.getCareRecommendationsByPetId(petId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch care recommendations" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/recommended", async (req, res) => {
    try {
      const products = await storage.getRecommendedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommended products" });
    }
  });

  // Training Routes
  app.get("/api/training-programs", async (req, res) => {
    try {
      const { age } = req.query;
      let programs;
      
      if (age && typeof age === 'string') {
        programs = await storage.getTrainingProgramsByAge(age);
      } else {
        programs = await storage.getAllTrainingPrograms();
      }
      
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training programs" });
    }
  });

  // Chat Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Get pet context if available
      const profiles = await storage.getAllPetProfiles();
      const petContext = profiles.length > 0 
        ? `User has pet(s): ${profiles.map(p => `${p.name} (${p.breed}, ${p.age})`).join(', ')}`
        : undefined;

      const aiResponse = await generateChatResponse(message, petContext);
      
      const chatMessage = await storage.createChatMessage({
        sessionId,
        message,
        response: aiResponse
      });

      res.json({ response: aiResponse, messageId: chatMessage.id });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

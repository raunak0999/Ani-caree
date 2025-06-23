import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertPetProfileSchema,
  insertChatMessageSchema,
  type PetProfile,
} from "@shared/schema";
import {
  generateCareRecommendations,
  generateChatResponse,
} from "./services/openai";

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

        await storage.saveRecommendations(petProfile.id, recommendations);

        return res.json({
          profile: petProfile,
          recommendations,
        });
      } catch (err) {
        console.error("Recommendation error:", err);
        return res
          .status(500)
          .json({ message: "Failed to generate recommendations" });
      }
    } catch (err) {
      console.error("Profile creation error:", err);
      return res.status(400).json({ message: "Invalid pet profile data" });
    }
  });

  // Chat Message Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const reply = await generateChatResponse(validatedData.message);
      return res.json({ reply });
    } catch (err) {
      console.error("Chat error:", err);
      return res.status(400).json({ message: "Invalid chat message" });
    }
  });

  // ✅ Product Routes
  app.get("/api/products", (req, res) => {
    const sampleProducts = [
      {
        id: 1,
        name: "Chicken Biscuits",
        description: "Delicious chicken-flavored treats.",
        price: 299,
        imageUrl: "https://picsum.photos/seed/biscuits/300/200",
        rating: 4.5,
        isRecommended: true,
        isBestseller: false,
        isVetApproved: true,
        category: "Food & Treats",
      },
      {
        id: 2,
        name: "Squeaky Toy Bone",
        description: "Fun squeaky toy for your pup.",
        price: 199,
        imageUrl: "https://picsum.photos/seed/toybone/300/200",
        rating: 4,
        isRecommended: false,
        isBestseller: true,
        isVetApproved: false,
        category: "Toys & Accessories",
      },
    ];

    const { category } = req.query;

    if (category && category !== "all") {
      const filtered = sampleProducts.filter(
        (product) => product.category === category
      );
      return res.json(filtered);
    }

    return res.json(sampleProducts);
  });

  return createServer(app);
}

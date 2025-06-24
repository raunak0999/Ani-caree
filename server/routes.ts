import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertPetProfileSchema,
  insertChatMessageSchema,
  type PetProfile,
  type CareRecommendationGroup,
} from "@shared/schema";
import {
  generateCareRecommendations,
  generateChatResponse,
} from "./services/openai";

// 🔥 Store last profile in memory for context
let lastPetProfile: PetProfile | null = null;
let lastRecommendations: CareRecommendationGroup | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("✅ Routes are registering...");

  // 🐶 Pet Profile Route (POST)
  app.post("/api/pet-profiles", async (req, res) => {
    try {
      console.log("👉 Incoming pet profile body:", req.body);

      const validatedData = insertPetProfileSchema.parse(req.body);
      console.log("✅ Validated data:", validatedData);

      const petProfile: PetProfile = {
        id: Date.now(),
        ...validatedData,
      };

      lastPetProfile = petProfile;

      // Optionally use AI to generate smart recommendations here
      const recommendations = await generateCareRecommendations(
        petProfile.name,
        petProfile.age,
        petProfile.breed,
        petProfile.size
      );

      lastRecommendations = recommendations;

      try {
        await storage.saveRecommendations(petProfile.id, recommendations);
      } catch (err) {
        console.warn("⚠️ Could not save recommendations:", err.message);
      }

      return res.json({
        profile: petProfile,
        recommendations,
      });
    } catch (err) {
      console.error("❌ Profile creation error:", err);
      return res.status(400).json({
        message: "Invalid pet profile data",
        error: err?.message || err,
      });
    }
  });

  // ✅ Pet Profile Route (GET)
  app.get("/api/pet-profiles", async (req, res) => {
    if (!lastPetProfile || !lastRecommendations) {
      return res.status(404).json({ message: "No profile found" });
    }

    return res.json({
      profile: lastPetProfile,
      recommendations: lastRecommendations,
    });
  });

  // 💬 Chat Message Route (with context + DB save)
  app.post("/api/chat", async (req, res) => {
    try {
      console.log("📩 Incoming chat request:", req.body);

      const validatedData = insertChatMessageSchema.parse(req.body);
      console.log("✅ Validated chat message:", validatedData);

      const petContext = lastPetProfile
        ? `Pet Name: ${lastPetProfile.name}, Age: ${lastPetProfile.age}, Breed: ${lastPetProfile.breed}, Size: ${lastPetProfile.size ?? "N/A"}`
        : undefined;

      const reply = await generateChatResponse(validatedData.message, petContext);

      // ✅ Save to DB
      try {
        await storage.saveChatMessage({
          sessionId: validatedData.sessionId,
          message: validatedData.message,
          response: reply,
        });
      } catch (err) {
        console.warn("⚠️ Could not save chat message:", err.message);
      }

      return res.json({ response: reply });
    } catch (err) {
      console.error("❌ Chat error:", err);
      return res.status(400).json({
        message: "Invalid chat message",
        error: err?.message || err,
      });
    }
  });

  // 🛍️ Product Listing Route
  app.get("/api/products", (req, res) => {
    const sampleProducts = [
      {
        id: 1,
        name: "Chicken Biscuits",
        description: "Delicious chicken-flavored treats.",
        price: 299,
        imageUrl:
          "https://images.unsplash.com/photo-1583337130417-3346a1d3a5c6?fit=crop&w=300&h=200&q=80",
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
        imageUrl:
          "https://images.unsplash.com/photo-1619983081563-430f63602767?fit=crop&w=300&h=200&q=80",
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

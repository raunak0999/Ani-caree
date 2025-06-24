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

// 🔥 Store the last profile in memory
let lastPetProfile: PetProfile | null = null;

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

      // 🔁 Use dummy data instead of OpenAI for now
      let recommendations = [
        `Feed ${petProfile.name} twice a day.`,
        `Take ${petProfile.name} for regular walks.`,
        `Schedule a vet visit every 6 months.`,
      ];

      // If you're ready, you can re-enable OpenAI:
      /*
      try {
        recommendations = await generateCareRecommendations(
          petProfile.name,
          petProfile.age,
          petProfile.breed,
          petProfile.size || undefined
        );
      } catch (genErr) {
        console.error("❌ Failed to generate care tips:", genErr);
      }
      */

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
    if (!lastPetProfile) {
      return res.status(404).json({ message: "No profile found" });
    }

    // You can later use OpenAI here again
    const recommendations = [
      `Feed ${lastPetProfile.name} twice a day.`,
      `Walk ${lastPetProfile.name} based on its size.`,
      `Regular grooming for ${lastPetProfile.breed}.`,
    ];

    return res.json({
      profile: lastPetProfile,
      recommendations,
    });
  });

  // 💬 Chat Message Route
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const reply = await generateChatResponse(validatedData.message);
      return res.json({ reply });
    } catch (err) {
      console.error("❌ Chat error:", err);
      return res.status(400).json({ message: "Invalid chat message" });
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

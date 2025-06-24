let lastPetProfile: PetProfile | null = null;

app.post("/api/pet-profiles", async (req, res) => {
  try {
    const validatedData = insertPetProfileSchema.parse(req.body);
    let petProfile: PetProfile = {
      id: Date.now(),
      ...validatedData,
    };

    const recommendations = await generateCareRecommendations(
      petProfile.name,
      petProfile.age,
      petProfile.breed,
      petProfile.size || undefined
    );

    try {
      await storage.saveRecommendations(petProfile.id, recommendations);
    } catch (err) {
      console.warn("⚠️ Could not save recommendations:", err.message);
    }

    // 👇 Save profile to memory
    lastPetProfile = petProfile;

    return res.json({
      profile: petProfile,
      recommendations,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Invalid pet profile data",
      error: err?.message || err,
    });
  }
});

/// 👇 Add this new route:
app.get("/api/pet-profiles", (req, res) => {
  if (!lastPetProfile) {
    return res.status(404).json({ message: "No profile found" });
  }
  return res.json(lastPetProfile);
});

import { 
  petProfiles, 
  products, 
  careRecommendations, 
  trainingPrograms, 
  chatMessages,
  type PetProfile, 
  type InsertPetProfile,
  type Product,
  type InsertProduct,
  type CareRecommendation,
  type InsertCareRecommendation,
  type TrainingProgram,
  type InsertTrainingProgram,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // Pet Profiles
  createPetProfile(profile: InsertPetProfile): Promise<PetProfile>;
  getPetProfile(id: number): Promise<PetProfile | undefined>;
  getAllPetProfiles(): Promise<PetProfile[]>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getRecommendedProducts(): Promise<Product[]>;
  
  // Care Recommendations
  createCareRecommendation(recommendation: InsertCareRecommendation): Promise<CareRecommendation>;
  getCareRecommendationsByPetId(petId: number): Promise<CareRecommendation[]>;
  
  // Training Programs
  getAllTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgramsByAge(ageGroup: string): Promise<TrainingProgram[]>;
  
  // Chat Messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private petProfiles: Map<number, PetProfile>;
  private products: Map<number, Product>;
  private careRecommendations: Map<number, CareRecommendation>;
  private trainingPrograms: Map<number, TrainingProgram>;
  private chatMessages: Map<number, ChatMessage>;
  private currentId: number;

  constructor() {
    this.petProfiles = new Map();
    this.products = new Map();
    this.careRecommendations = new Map();
    this.trainingPrograms = new Map();
    this.chatMessages = new Map();
    this.currentId = 1;
    
    this.initializeProducts();
    this.initializeTrainingPrograms();
  }

  private initializeProducts() {
    const productData: InsertProduct[] = [
      {
        name: "Premium Golden Retriever Food",
        description: "High-protein formula for adult dogs",
        price: 49.99,
        category: "Food & Treats",
        imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isRecommended: true,
        rating: 5.0
      },
      {
        name: "Interactive Rope Toy",
        description: "Durable toy for medium to large dogs",
        price: 19.99,
        category: "Toys & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1605460375648-278bcbd579a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isBestseller: true,
        rating: 4.5
      },
      {
        name: "Professional Grooming Kit",
        description: "Complete set for double-coat breeds",
        price: 34.99,
        category: "Grooming",
        imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isRecommended: true,
        rating: 5.0
      },
      {
        name: "Joint Health Supplements",
        description: "Natural support for active dogs",
        price: 29.99,
        category: "Health & Medicine",
        imageUrl: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isVetApproved: true,
        rating: 4.5
      },
      {
        name: "Organic Dog Treats",
        description: "All-natural training rewards",
        price: 15.99,
        category: "Food & Treats",
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isRecommended: true,
        rating: 4.8
      },
      {
        name: "Smart Water Bowl",
        description: "Automatic refilling with app control",
        price: 89.99,
        category: "Toys & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isBestseller: true,
        rating: 4.7
      }
    ];

    productData.forEach(product => {
      const id = this.currentId++;
      this.products.set(id, { 
        ...product, 
        id,
        isRecommended: product.isRecommended || false,
        isBestseller: product.isBestseller || false,
        isVetApproved: product.isVetApproved || false,
        rating: product.rating || 5.0
      });
    });
  }

  private initializeTrainingPrograms() {
    const trainingData: InsertTrainingProgram[] = [
      {
        title: "Basic Obedience",
        description: "Perfect for Golden Retrievers aged 1-3 years",
        ageGroup: "Young (1-3 years)",
        breedSuitability: ["Golden Retriever", "Labrador", "All Breeds"],
        tips: ["Sit, Stay, Come commands", "15-minute daily sessions", "Positive reinforcement techniques"],
        icon: "fas fa-graduation-cap",
        category: "obedience"
      },
      {
        title: "Exercise Routine",
        description: "High-energy breed specific activities",
        ageGroup: "Adult (3-7 years)",
        breedSuitability: ["Golden Retriever", "Labrador", "High-energy breeds"],
        tips: ["60+ minutes daily exercise", "Swimming, fetching, hiking", "Mental stimulation games"],
        icon: "fas fa-running",
        category: "exercise"
      },
      {
        title: "Behavioral Tips",
        description: "AI-analyzed breed-specific guidance",
        ageGroup: "All Ages",
        breedSuitability: ["All Breeds"],
        tips: ["Reduce excessive barking", "Prevent destructive chewing", "Socialization strategies"],
        icon: "fas fa-brain",
        category: "behavioral"
      },
      {
        title: "Puppy Foundation",
        description: "Essential training for young puppies",
        ageGroup: "Puppy (0-1 years)",
        breedSuitability: ["All Breeds"],
        tips: ["House training basics", "Crate training", "Basic socialization", "Bite inhibition"],
        icon: "fas fa-baby",
        category: "obedience"
      }
    ];

    trainingData.forEach(program => {
      const id = this.currentId++;
      this.trainingPrograms.set(id, { 
        ...program, 
        id,
        breedSuitability: program.breedSuitability || null
      });
    });
  }

  async createPetProfile(profile: InsertPetProfile): Promise<PetProfile> {
    const id = this.currentId++;
    const petProfile: PetProfile = { 
      ...profile, 
      id,
      size: profile.size || null,
      createdAt: new Date()
    };
    this.petProfiles.set(id, petProfile);
    return petProfile;
  }

  async getPetProfile(id: number): Promise<PetProfile | undefined> {
    return this.petProfiles.get(id);
  }

  async getAllPetProfiles(): Promise<PetProfile[]> {
    return Array.from(this.petProfiles.values());
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async getRecommendedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.isRecommended
    );
  }

  async createCareRecommendation(recommendation: InsertCareRecommendation): Promise<CareRecommendation> {
    const id = this.currentId++;
    const careRecommendation: CareRecommendation = { 
      ...recommendation, 
      id,
      createdAt: new Date()
    };
    this.careRecommendations.set(id, careRecommendation);
    return careRecommendation;
  }

  async getCareRecommendationsByPetId(petId: number): Promise<CareRecommendation[]> {
    return Array.from(this.careRecommendations.values()).filter(
      rec => rec.petProfileId === petId
    );
  }

  async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values());
  }

  async getTrainingProgramsByAge(ageGroup: string): Promise<TrainingProgram[]> {
    return Array.from(this.trainingPrograms.values()).filter(
      program => program.ageGroup === ageGroup || program.ageGroup === "All Ages"
    );
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = { 
      ...message, 
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      msg => msg.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();

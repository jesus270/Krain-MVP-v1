export interface Pricing {
  monthly: number;
  yearly: number;
  freeTier: boolean;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  developer: string;
  imageUrl: string;

  capabilities: string[];
  integrationPlatforms: string[];
  apiEndpoint: string;
  supportedLanguages: string[];

  pricing: Pricing;
  licenseType: "open-source" | "commercial" | "subscription" | "free";

  popularityScore: number;
  reviewsCount: number;
  uptime: number;

  releaseDate: string; // ISO 8601 format (YYYY-MM-DD)
  lastUpdated: string; // ISO 8601 format (YYYY-MM-DD)

  documentationURL: string;
  demoURL?: string; // Optional field
}

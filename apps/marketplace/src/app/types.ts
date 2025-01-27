export interface Pricing {
  monthly: number;
  yearly: number;
  freeTier: boolean;
}

export interface PerformanceMetrics {
  responseTime: number; // Average response time in milliseconds
  accuracyScore: number; // Score from 0-1
  reliabilityScore: number; // Score from 0-1
  uptime: number; // Percentage uptime
}

export interface ReputationMetrics {
  overallScore: number; // Weighted score from 0-5
  reviewsCount: number;
  verifiedReviewsCount: number;
  ratings: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  expertScore?: number; // Optional expert review score
}

export interface UseCase {
  title: string;
  description: string;
  industry?: string;
  successMetrics?: string[];
  testimonials?: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategories: string[]; // For more granular categorization
  tags: string[];
  developer: string;
  imageUrl: string;

  // Core capabilities and technical details
  capabilities: string[];
  integrationPlatforms: string[];
  apiEndpoint: string;
  supportedLanguages: string[];
  technicalRequirements?: string[];

  // Use cases and examples
  useCases: UseCase[];
  featuredUseCases?: string[]; // IDs of highlighted use cases

  // Pricing and licensing
  pricing: Pricing;
  licenseType: "open-source" | "commercial" | "subscription" | "free";
  enterpriseOptions?: boolean;

  // Performance and reputation
  performanceMetrics: PerformanceMetrics;
  reputationMetrics: ReputationMetrics;
  popularityScore: number;

  // Discovery and comparison metrics
  similarAgents?: string[]; // IDs of similar agents
  competitiveAdvantages?: string[];
  limitations?: string[];
  bestSuitedFor?: string[];

  // Dates and versioning
  releaseDate: string; // ISO 8601 format (YYYY-MM-DD)
  lastUpdated: string; // ISO 8601 format (YYYY-MM-DD)
  version?: string;

  // Resources and links
  documentationURL: string;
  demoURL?: string;
  communityURL?: string;
  supportURL?: string;
}

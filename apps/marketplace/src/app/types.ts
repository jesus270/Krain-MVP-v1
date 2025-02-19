export interface Pricing {
  name: string; // Package description
  interval: string; // e.g., "monthly", "yearly", "one-time"
  amount: string; // Text to allow for "Free", "Contact Us", etc.
  currency: string; // e.g., "USD", "USDC", etc.
}

export interface SocialMedia {
  x?: string;
  farcaster?: string;
  discord?: string;
  youtube?: string;
  linkedin?: string;
  instagram?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  rating: number; // Star rating (0-5)
  reviewsCount: number;
  category: string;
  tags: string[]; // Comma separated list stored as array
  description?: string;

  // Blockchain & Token Info
  blockchainsSupported: string[];
  tokenSymbol?: string;
  tokenName?: string;
  cmcTokenLink?: string;

  // Contact & Company Info
  websiteUrl: string;
  supportEmail: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Pricing
  pricing: Pricing[]; // Array to support multiple pricing tiers

  // Industry & Social
  industryFocus: string[]; // Comma separated list stored as array
  socialMedia: SocialMedia;
}

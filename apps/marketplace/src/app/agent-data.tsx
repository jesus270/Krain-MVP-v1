import { AIAgent } from "./types";

export const agents: AIAgent[] = [
  {
    id: "agent_001",
    name: "AutoGPT",
    rating: 4.7,
    reviewsCount: 3200,
    category: "AI Agent Framework",
    tags: [
      "workflow automation",
      "productivity",
      "task automation",
      "autonomous AI",
    ],

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "AUTO",
    tokenName: "AutoGPT Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/autogpt",

    // Contact & Company Info
    websiteUrl: "https://autogpt.net",
    supportEmail: "support@autogpt.net",
    companyName: "AutoGPT Labs",
    contactName: "John Smith",
    contactEmail: "john@autogpt.net",
    contactPhone: "+1-555-0123",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "10",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "49",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "monthly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["AI Development", "Automation", "Business Intelligence"],
    socialMedia: {
      x: "https://x.com/autogpt",
      discord: "https://discord.gg/autogpt",
      youtube: "https://youtube.com/@autogpt",
      linkedin: "https://linkedin.com/company/autogpt",
      instagram: "https://instagram.com/autogpt",
    },

    description:
      "An autonomous AI agent that attempts to achieve goals by breaking them into sub-tasks and using available tools in an automatic loop.",
  },
  {
    id: "agent_002",
    name: "Character.ai",
    rating: 4.5,
    reviewsCount: 4500,
    category: "AI Gateway",
    tags: ["chatbot", "entertainment", "interactive AI", "roleplay"],
    description:
      "A conversational AI that allows users to create and interact with AI characters, both fictional and real.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum"],
    tokenSymbol: "CHAR",
    tokenName: "Character Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/character-ai",

    // Contact & Company Info
    websiteUrl: "https://character.ai",
    supportEmail: "support@character.ai",
    companyName: "Character Technologies Inc.",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@character.ai",
    contactPhone: "+1-555-0124",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Premium",
        interval: "monthly",
        amount: "10",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Entertainment", "Education", "Gaming"],
    socialMedia: {
      x: "https://x.com/character_ai",
      discord: "https://discord.gg/character-ai",
      youtube: "https://youtube.com/@character_ai",
      linkedin: "https://linkedin.com/company/character-ai",
      instagram: "https://instagram.com/character_ai",
    },
  },
  {
    id: "agent_003",
    name: "Claude",
    rating: 4.8,
    reviewsCount: 5200,
    category: "AI Gateway",
    tags: ["chatbot", "assistant", "text generation", "reasoning", "analysis"],
    description:
      "An AI chatbot designed for conversational assistance, offering thoughtful and helpful responses with strong reasoning capabilities.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Solana"],
    tokenSymbol: "CLAUD",
    tokenName: "Claude Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/claude",

    // Contact & Company Info
    websiteUrl: "https://claude.ai",
    supportEmail: "support@anthropic.com",
    companyName: "Anthropic",
    contactName: "Michael Chen",
    contactEmail: "michael@anthropic.com",
    contactPhone: "+1-555-0125",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "20",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "35",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Research",
      "Content Creation",
      "Software Development",
      "Business Analysis",
      "Education",
    ],
    socialMedia: {
      x: "https://x.com/anthropic",
      discord: "https://discord.gg/anthropic",
      youtube: "https://youtube.com/@anthropic",
      linkedin: "https://linkedin.com/company/anthropic",
    },
  },
  {
    id: "agent_004",
    name: "Gemini",
    rating: 4.6,
    reviewsCount: 6100,
    category: "AI Gateway",
    tags: ["chatbot", "multimodal", "code", "image analysis", "math"],
    description:
      "Google's most capable AI model that combines language understanding, multimodal processing, and problem-solving abilities.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon", "Solana"],
    tokenSymbol: "GMNI",
    tokenName: "Gemini Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/gemini-ai",

    // Contact & Company Info
    websiteUrl: "https://gemini.google.com",
    supportEmail: "support@gemini.google.com",
    companyName: "Google",
    contactName: "David Kim",
    contactEmail: "david@google.com",
    contactPhone: "+1-555-0126",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "19.99",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Software Development",
      "Education",
      "Research",
      "Content Creation",
      "Data Analysis",
    ],
    socialMedia: {
      x: "https://x.com/GoogleAI",
      youtube: "https://youtube.com/@Google",
      linkedin: "https://linkedin.com/company/google",
    },
  },
  {
    id: "agent_005",
    name: "GitHub Copilot",
    rating: 4.7,
    reviewsCount: 8500,
    category: "Coding Assistants",
    tags: [
      "code completion",
      "developer tool",
      "productivity",
      "AI programming",
    ],
    description:
      "An AI-powered coding assistant that helps developers write code faster with intelligent suggestions and whole-function completions.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum"],
    tokenSymbol: "GHCP",
    tokenName: "Copilot Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/github-copilot",

    // Contact & Company Info
    websiteUrl: "https://github.com/features/copilot",
    supportEmail: "copilot-support@github.com",
    companyName: "GitHub",
    contactName: "Alex Turner",
    contactEmail: "alex@github.com",
    contactPhone: "+1-555-0127",

    // Pricing
    pricing: [
      {
        name: "Individual",
        interval: "monthly",
        amount: "10",
        currency: "USD",
      },
      {
        name: "Business",
        interval: "monthly",
        amount: "19",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Software Development",
      "DevOps",
      "Web Development",
      "Application Development",
    ],
    socialMedia: {
      x: "https://x.com/github",
      discord: "https://discord.gg/github",
      youtube: "https://youtube.com/@GitHub",
      linkedin: "https://linkedin.com/company/github",
    },
  },
  {
    id: "agent_006",
    name: "Midjourney",
    rating: 4.7,
    reviewsCount: 12000,
    category: "Content Generation",
    tags: ["AI art", "image synthesis", "creative tool", "visual generation"],
    description:
      "A powerful AI image generation system that creates high-quality, artistic visuals from text descriptions, known for its distinctive aesthetic style.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "MJ",
    tokenName: "Midjourney Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/midjourney",

    // Contact & Company Info
    websiteUrl: "https://www.midjourney.com",
    supportEmail: "support@midjourney.com",
    companyName: "Midjourney, Inc.",
    contactName: "Emily Chen",
    contactEmail: "emily@midjourney.com",
    contactPhone: "+1-555-0128",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "10",
        currency: "USD",
      },
      {
        name: "Standard",
        interval: "monthly",
        amount: "30",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "60",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Digital Art",
      "Design",
      "Marketing",
      "Entertainment",
      "Gaming",
    ],
    socialMedia: {
      x: "https://x.com/midjourney",
      discord: "https://discord.gg/midjourney",
      instagram: "https://instagram.com/midjourney",
      linkedin: "https://linkedin.com/company/midjourney",
    },
  },
  {
    id: "agent_007",
    name: "Penny",
    rating: 4.5,
    reviewsCount: 15000,
    category: "Travel",
    tags: ["travel", "booking", "hotels", "flights", "customer support"],
    description:
      "An AI travel assistant that helps users find and book flights, hotels, and rental cars while providing personalized travel recommendations.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Binance Smart Chain"],
    tokenSymbol: "PENNY",
    tokenName: "Penny Travel Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/penny-travel",

    // Contact & Company Info
    websiteUrl: "https://www.priceline.com/penny",
    supportEmail: "support@priceline.com",
    companyName: "Priceline",
    contactName: "Rachel Torres",
    contactEmail: "rachel@priceline.com",
    contactPhone: "+1-555-0129",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Premium",
        interval: "monthly",
        amount: "9.99",
        currency: "USD",
      },
      {
        name: "Business",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Travel & Tourism",
      "Hospitality",
      "Business Travel",
      "Customer Service",
    ],
    socialMedia: {
      x: "https://x.com/priceline",
      instagram: "https://instagram.com/priceline",
      linkedin: "https://linkedin.com/company/priceline",
      youtube: "https://youtube.com/@priceline",
    },
  },
  {
    id: "agent_008",
    name: "Bosh",
    rating: 4.8,
    reviewsCount: 3500,
    category: "Business Automation",
    tags: ["safety", "compliance", "audits", "inspections", "workplace"],
    description:
      "An AI assistant focused on workplace safety and compliance, helping organizations manage inspections, audits, and safety protocols.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "BOSH",
    tokenName: "Bosh Safety Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/bosh-safety",

    // Contact & Company Info
    websiteUrl: "https://safetyculture.com/bosh",
    supportEmail: "support@safetyculture.com",
    companyName: "SafetyCulture",
    contactName: "Mark Wilson",
    contactEmail: "mark@safetyculture.com",
    contactPhone: "+1-555-0130",

    // Pricing
    pricing: [
      {
        name: "Starter",
        interval: "monthly",
        amount: "15",
        currency: "USD",
      },
      {
        name: "Professional",
        interval: "monthly",
        amount: "49",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Manufacturing",
      "Construction",
      "Healthcare",
      "Logistics",
      "Facility Management",
    ],
    socialMedia: {
      x: "https://x.com/safetyculture",
      linkedin: "https://linkedin.com/company/safetyculture",
      youtube: "https://youtube.com/@SafetyCulture",
      instagram: "https://instagram.com/safetyculture",
    },
  },
  {
    id: "agent_009",
    name: "Aomni",
    rating: 4.6,
    reviewsCount: 2800,
    category: "Business Intelligence",
    tags: [
      "research",
      "sales",
      "business intelligence",
      "lead generation",
      "market analysis",
    ],
    description:
      "An AI-powered business intelligence platform that automates research and analysis for sales and business development teams.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "AOMNI",
    tokenName: "Aomni Intelligence Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/aomni",

    // Contact & Company Info
    websiteUrl: "https://aomni.com",
    supportEmail: "support@aomni.com",
    companyName: "Aomni Inc.",
    contactName: "Lisa Park",
    contactEmail: "lisa@aomni.com",
    contactPhone: "+1-555-0131",

    // Pricing
    pricing: [
      {
        name: "Starter",
        interval: "monthly",
        amount: "50",
        currency: "USD",
      },
      {
        name: "Professional",
        interval: "monthly",
        amount: "149",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Sales",
      "Business Development",
      "Market Research",
      "Consulting",
    ],
    socialMedia: {
      x: "https://x.com/aomni",
      linkedin: "https://linkedin.com/company/aomni",
      youtube: "https://youtube.com/@Aomni",
    },
  },
  {
    id: "agent_010",
    name: "Kore.ai",
    rating: 4.7,
    reviewsCount: 5000,
    category: "Customer Service",
    tags: [
      "chatbot",
      "enterprise",
      "automation",
      "customer service",
      "virtual assistant",
    ],
    description:
      "An enterprise-grade conversational AI platform for building and deploying intelligent virtual assistants and chatbots across multiple channels.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon", "Hyperledger"],
    tokenSymbol: "KORE",
    tokenName: "Kore Enterprise Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/kore-ai",

    // Contact & Company Info
    websiteUrl: "https://kore.ai",
    supportEmail: "support@kore.ai",
    companyName: "Kore.ai",
    contactName: "James Wilson",
    contactEmail: "james@kore.ai",
    contactPhone: "+1-555-0132",

    // Pricing
    pricing: [
      {
        name: "Professional",
        interval: "monthly",
        amount: "100",
        currency: "USD",
      },
      {
        name: "Business",
        interval: "monthly",
        amount: "250",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Enterprise Software",
      "Customer Service",
      "Banking",
      "Healthcare",
      "Retail",
    ],
    socialMedia: {
      x: "https://x.com/kore_ai",
      linkedin: "https://linkedin.com/company/kore-ai",
      youtube: "https://youtube.com/@KoreAI",
    },
  },
  {
    id: "agent_011",
    name: "Jasper",
    rating: 4.6,
    reviewsCount: 10000,
    category: "Content Generation",
    tags: [
      "content creation",
      "marketing",
      "copywriting",
      "SEO",
      "social media",
    ],
    description:
      "An AI content creation platform specializing in marketing copy, blog posts, and social media content with built-in SEO optimization and brand voice customization.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "JSPR",
    tokenName: "Jasper Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/jasper-ai",

    // Contact & Company Info
    websiteUrl: "https://www.jasper.ai",
    supportEmail: "support@jasper.ai",
    companyName: "Jasper.ai",
    contactName: "Sarah Miller",
    contactEmail: "sarah@jasper.ai",
    contactPhone: "+1-555-0133",

    // Pricing
    pricing: [
      {
        name: "Starter",
        interval: "monthly",
        amount: "49",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "99",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Marketing",
      "Content Creation",
      "Digital Marketing",
      "E-commerce",
      "SEO",
    ],
    socialMedia: {
      x: "https://x.com/jasper_ai",
      linkedin: "https://linkedin.com/company/jasper-ai",
      youtube: "https://youtube.com/@JasperAI",
      instagram: "https://instagram.com/jasper_ai",
    },
  },
  {
    id: "agent_012",
    name: "Synthesia",
    rating: 4.5,
    reviewsCount: 3000,
    category: "Video",
    tags: [
      "video creation",
      "AI avatars",
      "synthetic media",
      "video production",
    ],
    description:
      "An AI video generation platform that creates professional videos using synthetic avatars and voices, enabling quick production of training, marketing, and educational content.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "SYNTH",
    tokenName: "Synthesia Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/synthesia",

    // Contact & Company Info
    websiteUrl: "https://www.synthesia.io",
    supportEmail: "support@synthesia.io",
    companyName: "Synthesia Ltd.",
    contactName: "Thomas Brown",
    contactEmail: "thomas@synthesia.io",
    contactPhone: "+1-555-0134",

    // Pricing
    pricing: [
      {
        name: "Personal",
        interval: "monthly",
        amount: "29",
        currency: "USD",
      },
      {
        name: "Professional",
        interval: "monthly",
        amount: "99",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Education",
      "Corporate Training",
      "Marketing",
      "E-learning",
      "Internal Communications",
    ],
    socialMedia: {
      x: "https://x.com/synthesia",
      linkedin: "https://linkedin.com/company/synthesia-io",
      youtube: "https://youtube.com/@Synthesia",
      instagram: "https://instagram.com/synthesia.io",
    },
  },
  {
    id: "agent_013",
    name: "Hyperwrite",
    rating: 4.7,
    reviewsCount: 5000,
    category: "Content Generation",
    tags: [
      "writing",
      "grammar",
      "content optimization",
      "productivity",
      "editing",
    ],
    description:
      "An AI writing assistant that helps users create high-quality content with advanced grammar checking, style suggestions, and content optimization features.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "HWR",
    tokenName: "Hyperwrite Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/hyperwrite",

    // Contact & Company Info
    websiteUrl: "https://hyperwrite.ai",
    supportEmail: "support@hyperwrite.ai",
    companyName: "OthersideAI",
    contactName: "Jennifer Lee",
    contactEmail: "jennifer@hyperwrite.ai",
    contactPhone: "+1-555-0135",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "20",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Education",
      "Business",
      "Content Creation",
      "Professional Services",
    ],
    socialMedia: {
      x: "https://x.com/hyperwrite",
      linkedin: "https://linkedin.com/company/hyperwrite",
      youtube: "https://youtube.com/@Hyperwrite",
    },
  },
  {
    id: "agent_014",
    name: "Runway",
    rating: 4.6,
    reviewsCount: 4000,
    category: "Video",
    tags: [
      "video editing",
      "AI effects",
      "motion graphics",
      "creative tools",
      "visual effects",
    ],
    description:
      "A creative suite powered by AI that enables video editing, visual effects, and motion graphics creation with advanced generative capabilities.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "RWY",
    tokenName: "Runway Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/runway",

    // Contact & Company Info
    websiteUrl: "https://runway.com",
    supportEmail: "support@runway.com",
    companyName: "Runway AI, Inc.",
    contactName: "Michael Roberts",
    contactEmail: "michael@runway.com",
    contactPhone: "+1-555-0136",

    // Pricing
    pricing: [
      {
        name: "Creator",
        interval: "monthly",
        amount: "35",
        currency: "USD",
      },
      {
        name: "Professional",
        interval: "monthly",
        amount: "75",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Film & Video",
      "Motion Design",
      "Visual Effects",
      "Content Creation",
      "Advertising",
    ],
    socialMedia: {
      x: "https://x.com/runwayml",
      instagram: "https://instagram.com/runwayml",
      youtube: "https://youtube.com/@RunwayML",
      linkedin: "https://linkedin.com/company/runwayml",
    },
  },
  {
    id: "agent_015",
    name: "Tome",
    rating: 4.5,
    reviewsCount: 2000,
    category: "Documents",
    tags: [
      "presentations",
      "storytelling",
      "design",
      "content creation",
      "slides",
    ],
    description:
      "An AI-powered presentation platform that generates dynamic, narrative-driven presentations with automated design and content suggestions.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "TOME",
    tokenName: "Tome Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/tome",

    // Contact & Company Info
    websiteUrl: "https://tome.app",
    supportEmail: "support@tome.app",
    companyName: "Tome, Inc.",
    contactName: "Amanda White",
    contactEmail: "amanda@tome.app",
    contactPhone: "+1-555-0137",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "25",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Business",
      "Education",
      "Sales",
      "Marketing",
      "Consulting",
    ],
    socialMedia: {
      x: "https://x.com/tomeapp",
      linkedin: "https://linkedin.com/company/tomeapp",
      youtube: "https://youtube.com/@TomeApp",
    },
  },
  {
    id: "agent_016",
    name: "Descript",
    rating: 4.7,
    reviewsCount: 3500,
    category: "Video",
    tags: [
      "video editing",
      "audio editing",
      "transcription",
      "voice cloning",
      "podcast production",
    ],
    description:
      "An AI-powered video and audio editing platform that enables text-based editing, voice cloning, and automated transcription for content creators.",

    // Blockchain & Token Info
    blockchainsSupported: ["Ethereum", "Polygon"],
    tokenSymbol: "DESC",
    tokenName: "Descript Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/descript",

    // Contact & Company Info
    websiteUrl: "https://www.descript.com",
    supportEmail: "support@descript.com",
    companyName: "Descript, Inc.",
    contactName: "Robert Chang",
    contactEmail: "robert@descript.com",
    contactPhone: "+1-555-0138",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
      {
        name: "Creator",
        interval: "monthly",
        amount: "15",
        currency: "USD",
      },
      {
        name: "Pro",
        interval: "monthly",
        amount: "30",
        currency: "USD",
      },
      {
        name: "Enterprise",
        interval: "yearly",
        amount: "Contact Us",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: [
      "Media Production",
      "Podcasting",
      "Video Creation",
      "Education",
      "Corporate Communications",
    ],
    socialMedia: {
      x: "https://x.com/descript",
      youtube: "https://youtube.com/@Descript",
      linkedin: "https://linkedin.com/company/descript",
      instagram: "https://instagram.com/descript",
    },
  },
  {
    id: "agent_017",
    name: "Bankr Bot",
    rating: 4.5,
    reviewsCount: 500,
    category: "Crypto",
    tags: ["investing", "automation", "crypto investment automation"],
    description:
      "Your Friendly AI-Powered Crypto Companion. Buy, sell, swap, place limit orders, and manage your wallet effortlessly—just by sending a message.",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE"],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://bankr.bot/",
    supportEmail: "support@bankr.bot",
    companyName: "Bankr",
    contactName: "Bankr Team",
    contactEmail: "contact@bankr.bot",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Investment Automation"],
    socialMedia: {
      x: "bankrbot",
    },
  },
  {
    id: "agent_018",
    name: "Thumb Genie",
    rating: 4.6,
    reviewsCount: 1200,
    category: "Content",
    tags: [
      "content generation",
      "ai image generation",
      "thumbnails",
      "youtube",
    ],
    description:
      "ThumbGenie is the #1 AI thumbnail maker for creating high-converting, personalized YouTube thumbnails automatically. Our powerful thumbnail generator customizes designs to match your channel's unique style, boosting click-through rates while saving you time and money.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://yougenie.co/thumb-genie",
    supportEmail: "support@yougenie.co",
    companyName: "YouGenie",
    contactName: "YouGenie Team",
    contactEmail: "contact@yougenie.co",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Social Media"],
    socialMedia: {
      instagram: "https://www.instagram.com/yougenie.co/",
    },
  },
  {
    id: "agent_019",
    name: "Griffain",
    rating: 4.4,
    reviewsCount: 800,
    category: "Agent Platform",
    tags: ["platform", "solana", "ai agents"],
    description:
      "Griffain is a Solana-based AI agent, designed to assist users in a range of on-chain tasks. With a range of functionalities—ranging from searching for information to executing swaps—Griffain's network of agents abstracts away the complexities involved with blockchain-based interactions.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["AI Agent Platform"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_020",
    name: "DORA AI",
    rating: 4.7,
    reviewsCount: 2500,
    category: "Travel",
    tags: ["automation", "travel", "research", "itinerary planning"],
    description:
      "DORA AI is your personal travel assistant, powered by cutting-edge AI technology. From creating personalized itineraries to offering instant bookings and tailored travel tips, DORA AI revolutionizes how you explore the world.",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE"],
    tokenSymbol: "DORA",
    tokenName: "DORA Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/dora-ai-by-virtuals/",

    // Contact & Company Info
    websiteUrl:
      "https://apps.apple.com/us/app/dora-ai-travel-experiences/id6740629516",
    supportEmail: "support@dora.ai",
    companyName: "DORA AI",
    contactName: "DORA Team",
    contactEmail: "contact@dora.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Travel Research", "Travel Automation"],
    socialMedia: {
      x: "@xDora_ai",
      instagram: "xdora_ai",
    },
  },
  {
    id: "agent_021",
    name: "Company Research Agent",
    rating: 4.5,
    reviewsCount: 1000,
    category: "Business",
    tags: ["automation", "research", "sales", "market research"],
    description:
      "Does deep research on a company and creates a report that includes demographic information, funding data, web traffic trends and competitor analysis.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://agent.ai/profile/companyresearch",
    supportEmail: "support@agent.ai",
    companyName: "Agent.ai",
    contactName: "Agent.ai Team",
    contactEmail: "contact@agent.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Market Research"],
    socialMedia: {
      x: "@agentdotai",
    },
  },
  {
    id: "agent_022",
    name: "Flux Image Generator",
    rating: 4.4,
    reviewsCount: 800,
    category: "Content",
    tags: ["image generation", "marketing", "AI image generation"],
    description: "Generates an image using the new Flux AI model.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://agent.ai/profile/1a4g81x0bfsc5dpi",
    supportEmail: "support@agent.ai",
    companyName: "Agent.ai",
    contactName: "Agent.ai Team",
    contactEmail: "contact@agent.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["AI Image Generation"],
    socialMedia: {
      x: "@agentdotai",
    },
  },
  {
    id: "agent_023",
    name: "HubSpot App Marketplace Listing Grader",
    rating: 4.6,
    reviewsCount: 600,
    category: "Marketing",
    tags: ["Hubspot", "automation", "grading", "outsourcing"],
    description:
      "This agent evaluates your HubSpot App Marketplace listing and provides guidance and tips to improve install growth and engagement. It leverages benchmark data from AppMarketplace.com to assess how your listing stacks up against others.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://agent.ai/profile/5lmdg0q0fbms39sd",
    supportEmail: "support@agent.ai",
    companyName: "Agent.ai",
    contactName: "Agent.ai Team",
    contactEmail: "contact@agent.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Hubspot"],
    socialMedia: {
      x: "@agentdotai",
    },
  },
  {
    id: "agent_024",
    name: "Airdrop",
    rating: 4.3,
    reviewsCount: 600,
    category: "Research",
    tags: ["airdrop", "solana", "base", "research"],
    description:
      "Put the AI in airdrop. Airdrop tokens to holders of your favorite token or NFT collection.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Market Research"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_025",
    name: "Backpack",
    rating: 4.4,
    reviewsCount: 800,
    category: "Crypto",
    tags: ["tracking", "support", "crypto exchange"],
    description: "Trade and manage your orders on Backpack Exchange",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Exchange"],
    socialMedia: {
      x: "@backpack",
    },
  },
  {
    id: "agent_026",
    name: "Baxus",
    rating: 4.5,
    reviewsCount: 700,
    category: "E-commerce",
    tags: ["shopping", "whiskey", "support", "marketplace"],
    description:
      "A global marketplace for the world's most collectible whiskeys. Buy special edition whiskeys with Agent Baxus.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Marketplace"],
    socialMedia: {
      x: "@baxusco",
    },
  },
  {
    id: "agent_027",
    name: "Blink",
    rating: 4.4,
    reviewsCount: 650,
    category: "Crypto",
    tags: ["automation", "onchain", "strategies", "crypto"],
    description: "Take action on-chain with just a blink",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Onchain Strategies"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_028",
    name: "Deep Research",
    rating: 4.6,
    reviewsCount: 900,
    category: "Crypto",
    tags: ["research", "automation", "strategy", "crypto"],
    description:
      "Synthesize token reports from various data sources like X, cookie.fun, & Whale Watch.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Research"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_029",
    name: "DeepSeek",
    rating: 4.5,
    reviewsCount: 750,
    category: "Research",
    tags: ["research", "automation", "strategy", "crypto"],
    description: "DeepSeek inside the Agent Engine",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Research"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_030",
    name: "Dev",
    rating: 4.4,
    reviewsCount: 600,
    category: "Crypto",
    tags: ["pump.fun", "crypto", "tokenization", "token", "automation"],
    description: "Launch a memecoin on pump.fun",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["DevOps"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_031",
    name: "Dora",
    rating: 4.5,
    reviewsCount: 850,
    category: "Crypto",
    tags: ["research", "automation", "strategy", "crypto"],
    description:
      "Google for tokens. Search for a token and swap it just by typing.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Research"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_032",
    name: "Incinerator",
    rating: 4.3,
    reviewsCount: 550,
    category: "Crypto",
    tags: ["Token burning", "tokenization", "automation"],
    description: "Burn spam tokens and close empty token accounts",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["DevOps"],
    socialMedia: {
      x: "@griffaindotcom",
    },
  },
  {
    id: "agent_033",
    name: "Jupiter",
    rating: 4.7,
    reviewsCount: 2000,
    category: "Crypto",
    tags: ["Investing", "solana", "research", "dex"],
    description: "Swap tokens on Solana.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "JUP",
    tokenName: "Jupiter Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/jupiter-ag/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@jup.ag",
    companyName: "Jupiter",
    contactName: "Jupiter Team",
    contactEmail: "contact@jup.ag",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Exchange"],
    socialMedia: {
      x: "@jup.ag",
    },
  },
  {
    id: "agent_034",
    name: "Kitsune",
    rating: 4.5,
    reviewsCount: 750,
    category: "E-commerce",
    tags: ["e-commerce", "solana", "research", "shop"],
    description:
      "Shop hundreds of everyday products right onchain with Kitsune. Pioneering agentic commerce with every interaction.",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "KIT",
    tokenName: "Kitsune Token",
    cmcTokenLink:
      "https://coinmarketcap.com/dexscan/solana/BMitYTmKwCVNwmf47Zwpa7VdLaBbvAivDxCCZL2RJZTo/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@kitsune.com",
    companyName: "Kitsune",
    contactName: "Kitsune Team",
    contactEmail: "contact@kitsune.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["E-commerce"],
    socialMedia: {
      x: "@agent_kitsune",
    },
  },
  {
    id: "agent_035",
    name: "Lulo",
    rating: 4.4,
    reviewsCount: 650,
    category: "Finance",
    tags: ["crypto portfolio", "wallet", "automation", "liquidity pools"],
    description: "Diversify your portfolio with sustainable DeFi Yield",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "GRIFFAIN",
    tokenName: "Griffain Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/griffain/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@griffain.com",
    companyName: "Griffain",
    contactName: "Griffain Team",
    contactEmail: "contact@griffain.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Wallet"],
    socialMedia: {
      x: "@uselulo",
    },
  },
  {
    id: "agent_036",
    name: "Mindshare by Cookie",
    rating: 4.5,
    reviewsCount: 800,
    category: "Research",
    tags: ["mindshare", "crypto portfolio", "data"],
    description:
      "Analyze agents, providing insights on market stats, community influence, and emerging trends. Powered by Cookie DataSwarm.",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE", "BNB"],
    tokenSymbol: "COOKIE",
    tokenName: "Cookie Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/cookie/",

    // Contact & Company Info
    websiteUrl: "https://griffain.com/agents",
    supportEmail: "support@cookie.com",
    companyName: "Cookie",
    contactName: "Cookie Team",
    contactEmail: "contact@cookie.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "monthly",
        amount: "1",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Crypto Research"],
    socialMedia: {
      x: "@cookie3_com",
    },
  },
  {
    id: "agent_037",
    name: "Competitor Analyst",
    rating: 4.6,
    reviewsCount: 950,
    category: "Marketing",
    tags: ["market research", "analysis", "task automation"],
    description:
      "Automates the process of collecting and analyzing data on rival companies, providing insights into their market position, strengths, weaknesses, and strategies. It tracks competitors' activities over time, performs SWOT analyses, and benchmarks your company's performance against theirs.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://agent.ai/profile/competitoranalyst",
    supportEmail: "support@agent.ai",
    companyName: "Agent.ai",
    contactName: "Agent.ai Team",
    contactEmail: "contact@agent.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Market Research"],
    socialMedia: {
      x: "@agentdotai",
    },
  },
  {
    id: "agent_038",
    name: "Web Page Copy Editor",
    rating: 4.4,
    reviewsCount: 700,
    category: "Content",
    tags: ["task automation", "copywriting"],
    description:
      "Reviews all the text on a web page and offers tips to enhance clarity and effectiveness, helping you refine your content for better communication and impact.",

    // Blockchain & Token Info
    blockchainsSupported: [],
    tokenSymbol: "NA",
    tokenName: "No Token",
    cmcTokenLink: "",

    // Contact & Company Info
    websiteUrl: "https://agent.ai/profile/lb00zv6ygo4kmt38",
    supportEmail: "support@agent.ai",
    companyName: "Agent.ai",
    contactName: "Agent.ai Team",
    contactEmail: "contact@agent.ai",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Free",
        interval: "monthly",
        amount: "0",
        currency: "USD",
      },
    ],

    // Industry & Social
    industryFocus: ["Copywriting"],
    socialMedia: {
      x: "@agentdotai",
    },
  },
];

import { AIAgent } from "./types";

export const agents: AIAgent[] = [
  {
    id: "agent_001",
    name: "AutoGPT",
    shortDescription:
      "Autonomous AI agent that breaks down and executes complex tasks.",
    description:
      "An autonomous AI agent that attempts to achieve goals by breaking them into sub-tasks and using available tools in an automatic loop.",
    imageUrl:
      "https://raw.githubusercontent.com/Significant-Gravitas/AutoGPT/master/docs/content/imgs/AutoGPT_logo.png",
    category: "Automation",
    subcategories: ["Task Automation", "Workflow Optimization", "AI Agents"],
    tags: [
      "workflow automation",
      "productivity",
      "task automation",
      "autonomous AI",
    ],
    developer: "Open Source Community",
    capabilities: [
      "task automation",
      "internet browsing",
      "self-improvement",
      "goal decomposition",
      "autonomous decision making",
    ],
    integrationPlatforms: ["Windows", "MacOS", "Linux", "Docker"],
    apiEndpoint: "https://github.com/Torantulino/Auto-GPT",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Python 3.10 or later",
      "OpenAI API key",
      "8GB RAM minimum",
    ],

    useCases: [
      {
        title: "Automated Market Research",
        description:
          "Conducts comprehensive market research by autonomously gathering and analyzing data from multiple sources",
        industry: "Business Intelligence",
        successMetrics: [
          "Research completion time reduced by 70%",
          "Data from 10+ sources aggregated automatically",
        ],
        testimonials: [
          "Reduced our research time from days to hours - TechCorp Analytics",
        ],
      },
      {
        title: "Content Creation Pipeline",
        description:
          "Automates the process of generating, reviewing, and publishing content across multiple platforms",
        industry: "Digital Marketing",
        successMetrics: [
          "90% reduction in manual content tasks",
          "Consistent posting schedule achieved",
        ],
      },
    ],
    featuredUseCases: ["Automated Market Research"],

    pricing: { monthly: 0, yearly: 0, freeTier: true },
    licenseType: "open-source",
    enterpriseOptions: false,

    performanceMetrics: {
      responseTime: 2500, // ms
      accuracyScore: 0.85,
      reliabilityScore: 0.9,
      uptime: 99.9,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 3200,
      verifiedReviewsCount: 2800,
      ratings: {
        five: 2000,
        four: 800,
        three: 250,
        two: 100,
        one: 50,
      },
      expertScore: 4.5,
    },

    popularityScore: 4.7,

    similarAgents: ["agent_011", "agent_015"], // IDs of similar autonomous agents
    competitiveAdvantages: [
      "Fully autonomous operation",
      "Extensive plugin ecosystem",
      "Active open-source community",
    ],
    limitations: [
      "Requires technical setup",
      "API costs can accumulate quickly",
      "Limited to English language",
    ],
    bestSuitedFor: [
      "Developers",
      "Automation enthusiasts",
      "Research teams",
      "Content creators",
    ],

    releaseDate: "2023-03-30",
    lastUpdated: "2024-01-01",
    version: "1.0.0",

    documentationURL: "https://docs.agpt.co/",
    demoURL: "https://www.youtube.com/watch?v=6UjlDG8oK9I",
    communityURL: "https://github.com/Significant-Gravitas/AutoGPT/discussions",
    supportURL: "https://discord.gg/autogpt",
  },
  {
    id: "agent_002",
    name: "Character.ai",
    shortDescription:
      "Create and chat with AI characters for learning and entertainment.",
    description:
      "A conversational AI that allows users to create and interact with AI characters, both fictional and real.",
    imageUrl:
      "https://play-lh.googleusercontent.com/Bi_yZnAHkBQnKyEFeW6VE8tA3QnP-vVuGNHUzHJ_fLVWa_3EoQaGCE5Vc3f_2YPRLw",
    category: "Conversational AI",
    subcategories: ["Entertainment", "Role-playing", "Character Creation"],
    tags: ["chatbot", "entertainment", "interactive AI", "roleplay"],
    developer: "Character Technologies Inc.",
    capabilities: [
      "text-based conversation",
      "character customization",
      "memory retention",
      "personality adaptation",
    ],
    integrationPlatforms: ["Web", "Mobile (iOS, Android)"],
    apiEndpoint: "https://beta.character.ai/",
    supportedLanguages: ["English", "Spanish", "French"],
    technicalRequirements: ["Modern web browser", "Internet connection"],

    useCases: [
      {
        title: "Language Learning",
        description:
          "Practice conversations with AI characters in different languages",
        industry: "Education",
        successMetrics: [
          "Increased user engagement",
          "Improved language proficiency",
        ],
        testimonials: [
          "Made learning Spanish fun and interactive - Language Learner",
        ],
      },
      {
        title: "Creative Writing",
        description:
          "Develop stories and characters through interactive dialogue",
        industry: "Entertainment",
        successMetrics: [
          "Average session length of 45 minutes",
          "High user retention",
        ],
      },
    ],
    featuredUseCases: ["Language Learning"],

    pricing: { monthly: 10, yearly: 100, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 800,
      accuracyScore: 0.9,
      reliabilityScore: 0.95,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.5,
      reviewsCount: 4500,
      verifiedReviewsCount: 3800,
      ratings: {
        five: 2500,
        four: 1500,
        three: 300,
        two: 150,
        one: 50,
      },
    },

    popularityScore: 4.5,

    similarAgents: ["agent_012", "agent_014"],
    competitiveAdvantages: [
      "Advanced character customization",
      "Natural conversation flow",
      "Multi-language support",
    ],
    limitations: [
      "Limited to text-only interactions",
      "Requires internet connection",
      "Some features behind paywall",
    ],
    bestSuitedFor: [
      "Language learners",
      "Creative writers",
      "Role-playing enthusiasts",
      "Entertainment seekers",
    ],

    releaseDate: "2022-09-01",
    lastUpdated: "2024-01-01",
    version: "2.5.0",

    documentationURL: "https://docs.character.ai/",
    demoURL: "https://beta.character.ai/",
    communityURL: "https://discord.gg/character-ai",
    supportURL: "https://help.character.ai/",
  },
  {
    id: "agent_003",
    name: "Claude",
    shortDescription:
      "Thoughtful AI assistant with strong reasoning and analysis capabilities.",
    description:
      "An AI chatbot designed for conversational assistance, offering thoughtful and helpful responses with strong reasoning capabilities.",
    imageUrl: "https://claude.ai/favicon.svg",
    category: "Conversational AI",
    subcategories: ["Assistant", "Text Generation", "Analysis"],
    tags: ["chatbot", "assistant", "text generation", "reasoning", "analysis"],
    developer: "Anthropic",
    capabilities: [
      "multi-turn conversation",
      "context retention",
      "code analysis",
      "document analysis",
      "task decomposition",
    ],
    integrationPlatforms: ["Web", "Slack", "API"],
    apiEndpoint: "https://claude.ai",
    supportedLanguages: ["English"],
    technicalRequirements: ["Modern web browser", "Internet connection"],

    useCases: [
      {
        title: "Content Creation and Editing",
        description:
          "Assists with writing, editing, and improving various types of content",
        industry: "Content Creation",
        successMetrics: [
          "30% faster content production",
          "Higher quality outputs",
        ],
        testimonials: [
          "Helped streamline our content workflow significantly - Digital Agency",
        ],
      },
      {
        title: "Code Analysis and Development",
        description:
          "Reviews code, suggests improvements, and helps with debugging",
        industry: "Software Development",
        successMetrics: [
          "50% faster code review process",
          "Improved code quality",
        ],
        testimonials: [
          "Invaluable for code review and documentation - Tech Lead",
        ],
      },
      {
        title: "Research and Analysis",
        description:
          "Helps analyze complex documents and synthesize information",
        industry: "Research",
        successMetrics: [
          "Reduced research time by 40%",
          "More comprehensive analysis",
        ],
      },
    ],
    featuredUseCases: [
      "Content Creation and Editing",
      "Code Analysis and Development",
    ],

    pricing: { monthly: 20, yearly: 200, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1200,
      accuracyScore: 0.95,
      reliabilityScore: 0.98,
      uptime: 99.9,
    },

    reputationMetrics: {
      overallScore: 4.8,
      reviewsCount: 5200,
      verifiedReviewsCount: 4800,
      ratings: {
        five: 3500,
        four: 1200,
        three: 300,
        two: 150,
        one: 50,
      },
      expertScore: 4.9,
    },

    popularityScore: 4.8,

    similarAgents: ["agent_004", "agent_002"],
    competitiveAdvantages: [
      "Advanced reasoning capabilities",
      "Strong safety measures",
      "Comprehensive API access",
      "Enterprise-grade security",
    ],
    limitations: [
      "English-only support",
      "No image generation",
      "May be overly cautious",
    ],
    bestSuitedFor: [
      "Content creators",
      "Developers",
      "Researchers",
      "Business professionals",
    ],

    releaseDate: "2023-03-15",
    lastUpdated: "2024-02-01",
    version: "3.0",

    documentationURL: "https://docs.anthropic.com/claude/",
    demoURL: "https://claude.ai/chat",
    communityURL: "https://community.anthropic.com/",
    supportURL: "https://help.anthropic.com/",
  },
  {
    id: "agent_004",
    name: "Gemini",
    shortDescription:
      "Google's multimodal AI for text, code, and image understanding.",
    description:
      "Google's most capable AI model that combines language understanding, multimodal processing, and problem-solving abilities.",
    imageUrl:
      "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
    category: "Multimodal AI",
    subcategories: ["Conversational AI", "Image Analysis", "Code Generation"],
    tags: ["chatbot", "multimodal", "code", "image analysis", "math"],
    developer: "Google",
    capabilities: [
      "text generation",
      "image analysis",
      "code generation",
      "mathematical reasoning",
      "multimodal understanding",
    ],
    integrationPlatforms: ["Web", "Android", "API", "Google Workspace"],
    apiEndpoint: "https://ai.google.dev/",
    supportedLanguages: [
      "English",
      "Japanese",
      "Korean",
      "German",
      "French",
      "Spanish",
    ],
    technicalRequirements: ["Modern web browser", "Google account"],

    useCases: [
      {
        title: "Multimodal Analysis",
        description:
          "Analyzes text, images, and code together to provide comprehensive insights",
        industry: "Data Analysis",
        successMetrics: [
          "60% faster data interpretation",
          "Enhanced multimodal understanding",
        ],
        testimonials: [
          "Game-changing for our multimedia content analysis - Media Corp",
        ],
      },
      {
        title: "Code Development",
        description:
          "Assists with coding tasks across multiple programming languages",
        industry: "Software Development",
        successMetrics: [
          "40% faster code generation",
          "Reduced debugging time",
        ],
        testimonials: [
          "Excellent for quick prototyping and problem-solving - Senior Developer",
        ],
      },
      {
        title: "Educational Support",
        description: "Helps explain complex concepts with text and visual aids",
        industry: "Education",
        successMetrics: [
          "Improved student comprehension",
          "More engaging learning experience",
        ],
      },
    ],
    featuredUseCases: ["Multimodal Analysis", "Code Development"],

    pricing: { monthly: 0, yearly: 0, freeTier: true },
    licenseType: "free",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1000,
      accuracyScore: 0.92,
      reliabilityScore: 0.94,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.6,
      reviewsCount: 6100,
      verifiedReviewsCount: 5500,
      ratings: {
        five: 3800,
        four: 1500,
        three: 500,
        two: 200,
        one: 100,
      },
      expertScore: 4.7,
    },

    popularityScore: 4.6,

    similarAgents: ["agent_003", "agent_005"],
    competitiveAdvantages: [
      "Advanced multimodal capabilities",
      "Free access",
      "Google Workspace integration",
      "Strong mathematical abilities",
    ],
    limitations: [
      "Requires Google account",
      "Variable response quality",
      "Limited customization options",
    ],
    bestSuitedFor: [
      "Students",
      "Developers",
      "Content creators",
      "Data analysts",
      "Educators",
    ],

    releaseDate: "2023-12-06",
    lastUpdated: "2024-02-15",
    version: "1.5",

    documentationURL: "https://ai.google.dev/docs",
    demoURL: "https://gemini.google.com/",
    communityURL: "https://www.reddit.com/r/GoogleGemini/",
    supportURL: "https://support.google.com/gemini",
  },
  {
    id: "agent_005",
    name: "GitHub Copilot",
    shortDescription: "AI pair programmer for faster, smarter code completion.",
    description:
      "An AI-powered coding assistant that helps developers write code faster with intelligent suggestions and whole-function completions.",
    imageUrl:
      "https://github.githubassets.com/images/modules/site/copilot/copilot.png",
    category: "Development Tools",
    subcategories: ["Code Generation", "Pair Programming", "Developer Tools"],
    tags: [
      "code completion",
      "developer tool",
      "productivity",
      "AI programming",
    ],
    developer: "GitHub & OpenAI",
    capabilities: [
      "code generation",
      "autocomplete",
      "error detection",
      "test generation",
      "documentation generation",
      "natural language to code",
    ],
    integrationPlatforms: [
      "VS Code",
      "Visual Studio",
      "JetBrains IDEs",
      "Neovim",
      "GitHub.com",
    ],
    apiEndpoint: "https://copilot.github.com/",
    supportedLanguages: [
      "Python",
      "JavaScript",
      "TypeScript",
      "Java",
      "C++",
      "C#",
      "Ruby",
      "Go",
      "PHP",
    ],
    technicalRequirements: [
      "Supported IDE",
      "GitHub account",
      "Active subscription",
    ],

    useCases: [
      {
        title: "Rapid Prototyping",
        description: "Quickly generate code for new features and prototypes",
        industry: "Software Development",
        successMetrics: [
          "55% faster code writing",
          "Reduced boilerplate code by 70%",
        ],
        testimonials: ["Cut our development time in half - Tech Startup CTO"],
      },
      {
        title: "Code Documentation",
        description: "Automatically generate and improve code documentation",
        industry: "Software Development",
        successMetrics: [
          "80% faster documentation writing",
          "Improved documentation quality",
        ],
        testimonials: [
          "Dramatically improved our documentation process - Senior Developer",
        ],
      },
      {
        title: "Test Generation",
        description: "Generate unit tests and test cases automatically",
        industry: "Software Development",
        successMetrics: ["60% faster test writing", "Increased test coverage"],
      },
    ],
    featuredUseCases: ["Rapid Prototyping", "Code Documentation"],

    pricing: { monthly: 10, yearly: 100, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 200,
      accuracyScore: 0.88,
      reliabilityScore: 0.92,
      uptime: 99.95,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 8500,
      verifiedReviewsCount: 7200,
      ratings: {
        five: 5500,
        four: 2000,
        three: 600,
        two: 250,
        one: 150,
      },
      expertScore: 4.8,
    },

    popularityScore: 4.9,

    similarAgents: ["agent_013", "agent_004"],
    competitiveAdvantages: [
      "Deep IDE integration",
      "Context-aware suggestions",
      "Multi-language support",
      "GitHub integration",
    ],
    limitations: [
      "Requires subscription",
      "May suggest outdated patterns",
      "Network dependency",
      "Limited to supported IDEs",
    ],
    bestSuitedFor: [
      "Software developers",
      "Web developers",
      "DevOps engineers",
      "Students",
    ],

    releaseDate: "2021-06-29",
    lastUpdated: "2024-02-01",
    version: "2.0",

    documentationURL: "https://docs.github.com/copilot",
    demoURL: "https://github.com/features/copilot",
    communityURL:
      "https://github.com/community/community/discussions/categories/copilot",
    supportURL: "https://support.github.com/products/copilot",
  },
  {
    id: "agent_006",
    name: "Midjourney",
    shortDescription: "Create stunning AI-generated artwork and illustrations.",
    description:
      "A powerful AI image generation system that creates high-quality, artistic visuals from text descriptions, known for its distinctive aesthetic style.",
    imageUrl:
      "https://assets-global.website-files.com/6364b6fd26e298b11fb9391f/6364b6fd26e2983b6ab93b80_favicon.png",
    category: "Image Generation",
    subcategories: ["Art Creation", "Visual Design", "Digital Art"],
    tags: ["AI art", "image synthesis", "creative tool", "visual generation"],
    developer: "Midjourney, Inc.",
    capabilities: [
      "text-to-image generation",
      "image variation creation",
      "style mixing",
      "upscaling",
      "selective image refinement",
    ],
    integrationPlatforms: ["Discord", "Web UI", "API (Beta)"],
    apiEndpoint: "https://api.midjourney.com",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Discord account",
      "Active subscription",
      "Internet connection",
    ],

    useCases: [
      {
        title: "Concept Art Creation",
        description:
          "Generate concept art for games, films, and creative projects",
        industry: "Entertainment",
        successMetrics: [
          "80% reduction in concept art time",
          "Increased creative exploration",
        ],
        testimonials: [
          "Revolutionized our concept art pipeline - Game Studio Art Director",
        ],
      },
      {
        title: "Marketing Visual Content",
        description:
          "Create unique visuals for marketing campaigns and social media",
        industry: "Marketing",
        successMetrics: [
          "3x faster visual content creation",
          "Higher engagement rates",
        ],
        testimonials: [
          "Transformed our social media content strategy - Marketing Manager",
        ],
      },
      {
        title: "Architectural Visualization",
        description: "Generate architectural concepts and visualizations",
        industry: "Architecture",
        successMetrics: [
          "Faster client presentations",
          "More design iterations",
        ],
        testimonials: [
          "Essential tool for quick architectural concepts - Design Firm",
        ],
      },
    ],
    featuredUseCases: ["Concept Art Creation", "Marketing Visual Content"],

    pricing: { monthly: 10, yearly: 96, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 15000, // 15 seconds average
      accuracyScore: 0.85,
      reliabilityScore: 0.95,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 12000,
      verifiedReviewsCount: 9500,
      ratings: {
        five: 7500,
        four: 3000,
        three: 1000,
        two: 300,
        one: 200,
      },
      expertScore: 4.8,
    },

    popularityScore: 4.8,

    similarAgents: ["agent_014", "agent_016"],
    competitiveAdvantages: [
      "Distinctive artistic style",
      "High-quality outputs",
      "Active community",
      "Regular model improvements",
    ],
    limitations: [
      "Queue-based processing",
      "Limited control over outputs",
      "English-only prompts",
      "No direct editing capabilities",
    ],
    bestSuitedFor: [
      "Artists",
      "Designers",
      "Marketing professionals",
      "Game developers",
      "Architects",
    ],

    releaseDate: "2022-07-15",
    lastUpdated: "2024-02-15",
    version: "6.0",

    documentationURL: "https://docs.midjourney.com",
    demoURL: "https://www.midjourney.com/showcase",
    communityURL: "https://discord.gg/midjourney",
    supportURL: "https://support.midjourney.com",
  },
  {
    id: "agent_007",
    name: "Penny",
    shortDescription:
      "AI travel assistant for personalized booking and planning.",
    description:
      "An AI travel assistant that helps users find and book flights, hotels, and rental cars while providing personalized travel recommendations.",
    imageUrl: "https://www.priceline.com/favicon.ico",
    category: "Travel",
    subcategories: ["Travel Booking", "Travel Planning", "Customer Service"],
    tags: ["travel", "booking", "hotels", "flights", "customer support"],
    developer: "Priceline",
    capabilities: [
      "flight booking",
      "hotel reservations",
      "car rentals",
      "travel recommendations",
      "price tracking",
      "itinerary management",
    ],
    integrationPlatforms: ["Web", "iOS", "Android", "WhatsApp"],
    apiEndpoint: "https://api.priceline.com/penny",
    supportedLanguages: ["English"],
    technicalRequirements: ["Modern web browser or mobile device"],

    useCases: [
      {
        title: "Travel Planning",
        description: "Help users plan and book complete travel itineraries",
        industry: "Travel & Tourism",
        successMetrics: [
          "40% faster booking process",
          "25% better deals found",
        ],
        testimonials: ["Saved me hours of travel planning - Frequent Traveler"],
      },
      {
        title: "Business Travel Management",
        description: "Streamline corporate travel booking and management",
        industry: "Business Services",
        successMetrics: ["50% reduction in booking time", "20% cost savings"],
        testimonials: [
          "Simplified our corporate travel process - Travel Manager",
        ],
      },
      {
        title: "Last-minute Travel Solutions",
        description: "Find and book last-minute travel accommodations",
        industry: "Travel & Tourism",
        successMetrics: [
          "90% success rate for same-day bookings",
          "High customer satisfaction",
        ],
      },
    ],
    featuredUseCases: ["Travel Planning", "Last-minute Travel Solutions"],

    pricing: { monthly: 0, yearly: 0, freeTier: true },
    licenseType: "free",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1500,
      accuracyScore: 0.92,
      reliabilityScore: 0.94,
      uptime: 99.9,
    },

    reputationMetrics: {
      overallScore: 4.5,
      reviewsCount: 15000,
      verifiedReviewsCount: 12000,
      ratings: {
        five: 8000,
        four: 4500,
        three: 1500,
        two: 600,
        one: 400,
      },
      expertScore: 4.6,
    },

    popularityScore: 4.4,

    similarAgents: ["agent_008", "agent_012"],
    competitiveAdvantages: [
      "Access to exclusive deals",
      "Real-time price tracking",
      "Integration with major travel providers",
      "24/7 customer support",
    ],
    limitations: [
      "Limited to supported travel providers",
      "English-only support",
      "Some features require account",
      "Region-specific availability",
    ],
    bestSuitedFor: [
      "Travelers",
      "Travel agents",
      "Business travelers",
      "Travel managers",
    ],

    releaseDate: "2023-06-15",
    lastUpdated: "2024-02-10",
    version: "2.1",

    documentationURL: "https://www.priceline.com/penny/help",
    demoURL: "https://www.priceline.com/penny",
    communityURL: "https://community.priceline.com",
    supportURL: "https://www.priceline.com/support",
  },
  {
    id: "agent_008",
    name: "Bosh",
    shortDescription: "AI-powered workplace safety and compliance management.",
    description:
      "An AI assistant focused on workplace safety and compliance, helping organizations manage inspections, audits, and safety protocols.",
    imageUrl: "https://safetyculture.com/favicon.ico",
    category: "Business Operations",
    subcategories: ["Safety Management", "Compliance", "Workplace Operations"],
    tags: ["safety", "compliance", "audits", "inspections", "workplace"],
    developer: "SafetyCulture",
    capabilities: [
      "safety audits",
      "compliance checking",
      "incident reporting",
      "risk assessment",
      "protocol management",
      "scheduling assistance",
    ],
    integrationPlatforms: ["Web", "iOS", "Android", "API"],
    apiEndpoint: "https://api.safetyculture.com/bosh",
    supportedLanguages: ["English", "Spanish", "French", "German"],
    technicalRequirements: [
      "SafetyCulture account",
      "Internet-connected device",
      "Compatible mobile device for field use",
    ],

    useCases: [
      {
        title: "Safety Inspections",
        description: "Automate and streamline workplace safety inspections",
        industry: "Workplace Safety",
        successMetrics: ["70% faster inspections", "95% compliance rate"],
        testimonials: [
          "Transformed our safety inspection process - Safety Manager",
        ],
      },
      {
        title: "Compliance Management",
        description:
          "Monitor and maintain regulatory compliance across operations",
        industry: "Regulatory Compliance",
        successMetrics: [
          "50% reduction in compliance issues",
          "Real-time monitoring",
        ],
        testimonials: [
          "Significantly improved our compliance tracking - Operations Director",
        ],
      },
      {
        title: "Incident Response",
        description: "Streamline incident reporting and response procedures",
        industry: "Risk Management",
        successMetrics: [
          "60% faster incident response",
          "Improved documentation",
        ],
        testimonials: [
          "Critical for our incident management - HSE Coordinator",
        ],
      },
    ],
    featuredUseCases: ["Safety Inspections", "Compliance Management"],

    pricing: { monthly: 15, yearly: 150, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 800,
      accuracyScore: 0.96,
      reliabilityScore: 0.98,
      uptime: 99.95,
    },

    reputationMetrics: {
      overallScore: 4.8,
      reviewsCount: 3500,
      verifiedReviewsCount: 3000,
      ratings: {
        five: 2500,
        four: 700,
        three: 200,
        two: 50,
        one: 50,
      },
      expertScore: 4.9,
    },

    popularityScore: 4.6,

    similarAgents: ["agent_007", "agent_009"],
    competitiveAdvantages: [
      "Industry-specific compliance knowledge",
      "Mobile-first approach",
      "Real-time monitoring",
      "Comprehensive reporting",
    ],
    limitations: [
      "Industry-specific focus",
      "Requires integration setup",
      "Learning curve for complex features",
      "Enterprise features need subscription",
    ],
    bestSuitedFor: [
      "Safety managers",
      "Compliance officers",
      "Operations managers",
      "Field inspectors",
      "HSE professionals",
    ],

    releaseDate: "2023-03-01",
    lastUpdated: "2024-02-20",
    version: "2.3",

    documentationURL: "https://support.safetyculture.com/bosh",
    demoURL: "https://safetyculture.com/bosh-demo",
    communityURL: "https://community.safetyculture.com",
    supportURL: "https://support.safetyculture.com",
  },
  {
    id: "agent_009",
    name: "Aomni",
    shortDescription: "Automated research and analysis for sales teams.",
    description:
      "An AI-powered business intelligence platform that automates research and analysis for sales and business development teams.",
    imageUrl: "https://aomni.com/favicon.ico",
    category: "Business Intelligence",
    subcategories: ["Sales Intelligence", "Market Research", "Lead Generation"],
    tags: [
      "research",
      "sales",
      "business intelligence",
      "lead generation",
      "market analysis",
    ],
    developer: "Aomni Inc.",
    capabilities: [
      "prospect research",
      "market analysis",
      "competitive intelligence",
      "lead qualification",
      "sales insights generation",
      "company profiling",
    ],
    integrationPlatforms: ["Web", "CRM Integration", "API", "Chrome Extension"],
    apiEndpoint: "https://api.aomni.com",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Modern web browser",
      "CRM system for integration",
      "Active subscription",
    ],

    useCases: [
      {
        title: "Sales Intelligence",
        description: "Automate prospect research and generate sales insights",
        industry: "Sales",
        successMetrics: [
          "75% reduction in research time",
          "2x increase in qualified leads",
        ],
        testimonials: ["Transformed our sales research process - VP of Sales"],
      },
      {
        title: "Market Analysis",
        description: "Generate comprehensive market and competitor analysis",
        industry: "Business Development",
        successMetrics: [
          "60% faster market analysis",
          "More comprehensive insights",
        ],
        testimonials: [
          "Invaluable for understanding market dynamics - Strategy Director",
        ],
      },
      {
        title: "Lead Qualification",
        description: "Automatically qualify and prioritize sales leads",
        industry: "Sales",
        successMetrics: ["40% higher conversion rate", "Improved lead quality"],
        testimonials: [
          "Significantly improved our lead qualification accuracy - Sales Manager",
        ],
      },
    ],
    featuredUseCases: ["Sales Intelligence", "Market Analysis"],

    pricing: { monthly: 50, yearly: 500, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 2000,
      accuracyScore: 0.93,
      reliabilityScore: 0.95,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.6,
      reviewsCount: 2800,
      verifiedReviewsCount: 2200,
      ratings: {
        five: 1500,
        four: 800,
        three: 300,
        two: 150,
        one: 50,
      },
      expertScore: 4.7,
    },

    popularityScore: 4.5,

    similarAgents: ["agent_010", "agent_008"],
    competitiveAdvantages: [
      "Automated research capabilities",
      "Deep business insights",
      "CRM integration",
      "Real-time market intelligence",
    ],
    limitations: [
      "English-only support",
      "Requires data access permissions",
      "Limited historical data",
      "Industry coverage varies",
    ],
    bestSuitedFor: [
      "Sales teams",
      "Business development professionals",
      "Market researchers",
      "Strategy consultants",
    ],

    releaseDate: "2023-01-15",
    lastUpdated: "2024-02-15",
    version: "2.4",

    documentationURL: "https://docs.aomni.com",
    demoURL: "https://aomni.com/demo",
    communityURL: "https://community.aomni.com",
    supportURL: "https://support.aomni.com",
  },
  {
    id: "agent_010",
    name: "Kore.ai",
    shortDescription: "Enterprise virtual assistants for business automation.",
    description:
      "An enterprise-grade conversational AI platform for building and deploying intelligent virtual assistants and chatbots across multiple channels.",
    imageUrl: "https://kore.ai/wp-content/themes/kore/images/favicon.ico",
    category: "Enterprise AI",
    subcategories: [
      "Conversational AI",
      "Process Automation",
      "Customer Service",
    ],
    tags: [
      "chatbot",
      "enterprise",
      "automation",
      "customer service",
      "virtual assistant",
    ],
    developer: "Kore.ai",
    capabilities: [
      "natural language understanding",
      "dialog management",
      "process automation",
      "multi-channel deployment",
      "enterprise system integration",
      "analytics and reporting",
    ],
    integrationPlatforms: [
      "Web",
      "Mobile",
      "Slack",
      "Microsoft Teams",
      "WhatsApp",
      "Facebook Messenger",
    ],
    apiEndpoint: "https://api.kore.ai",
    supportedLanguages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Japanese",
    ],
    technicalRequirements: [
      "Enterprise subscription",
      "Development resources",
      "System integration capabilities",
    ],

    useCases: [
      {
        title: "Customer Service Automation",
        description:
          "Deploy AI-powered virtual assistants for customer support",
        industry: "Customer Service",
        successMetrics: [
          "70% reduction in support tickets",
          "24/7 customer support coverage",
        ],
        testimonials: [
          "Revolutionized our customer service operations - Customer Service Director",
        ],
      },
      {
        title: "Employee Support",
        description: "Automate internal IT and HR support processes",
        industry: "Enterprise Operations",
        successMetrics: [
          "85% faster query resolution",
          "Improved employee satisfaction",
        ],
        testimonials: [
          "Significantly reduced IT support workload - IT Manager",
        ],
      },
      {
        title: "Process Automation",
        description: "Streamline and automate business processes",
        industry: "Business Operations",
        successMetrics: [
          "50% process automation achieved",
          "Reduced operational costs",
        ],
        testimonials: ["Transformed our business processes - Operations Head"],
      },
    ],
    featuredUseCases: ["Customer Service Automation", "Process Automation"],

    pricing: { monthly: 100, yearly: 1000, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 500,
      accuracyScore: 0.94,
      reliabilityScore: 0.96,
      uptime: 99.99,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 5000,
      verifiedReviewsCount: 4200,
      ratings: {
        five: 3000,
        four: 1500,
        three: 300,
        two: 150,
        one: 50,
      },
      expertScore: 4.8,
    },

    popularityScore: 4.6,

    similarAgents: ["agent_003", "agent_008"],
    competitiveAdvantages: [
      "Enterprise-grade security",
      "Extensive integration capabilities",
      "Multi-channel support",
      "Advanced analytics",
    ],
    limitations: [
      "Complex implementation",
      "Requires technical expertise",
      "Higher cost",
      "Enterprise focus",
    ],
    bestSuitedFor: [
      "Large enterprises",
      "IT departments",
      "Customer service teams",
      "Operations managers",
    ],

    releaseDate: "2019-06-15",
    lastUpdated: "2024-02-01",
    version: "8.5",

    documentationURL: "https://developer.kore.ai/docs",
    demoURL: "https://kore.ai/request-demo",
    communityURL: "https://community.kore.ai",
    supportURL: "https://support.kore.ai",
  },
  {
    id: "agent_011",
    name: "Jasper",
    shortDescription: "AI content creation optimized for marketing and SEO.",
    description:
      "An AI content creation platform specializing in marketing copy, blog posts, and social media content with built-in SEO optimization and brand voice customization.",
    imageUrl: "https://www.jasper.ai/images/favicon.svg",
    category: "Content Creation",
    subcategories: ["Marketing", "Copywriting", "Social Media"],
    tags: [
      "content creation",
      "marketing",
      "copywriting",
      "SEO",
      "social media",
    ],
    developer: "Jasper.ai",
    capabilities: [
      "blog writing",
      "marketing copy",
      "social media posts",
      "SEO optimization",
      "brand voice customization",
      "content repurposing",
    ],
    integrationPlatforms: [
      "Web",
      "Chrome Extension",
      "Surfer SEO",
      "Grammarly",
      "WordPress",
    ],
    apiEndpoint: "https://api.jasper.ai",
    supportedLanguages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Portuguese",
      "Italian",
      "Dutch",
    ],
    technicalRequirements: [
      "Modern web browser",
      "Active subscription",
      "Internet connection",
    ],

    useCases: [
      {
        title: "Marketing Content Creation",
        description: "Generate high-converting marketing copy and campaigns",
        industry: "Marketing",
        successMetrics: [
          "65% faster content creation",
          "40% higher engagement rates",
        ],
        testimonials: [
          "Revolutionized our content marketing strategy - Marketing Director",
        ],
      },
      {
        title: "Blog Content Production",
        description: "Create SEO-optimized blog posts and articles",
        industry: "Content Marketing",
        successMetrics: [
          "3x more content output",
          "50% improvement in SEO rankings",
        ],
        testimonials: [
          "Doubled our blog output with better quality - Content Manager",
        ],
      },
      {
        title: "Social Media Management",
        description: "Generate engaging social media content across platforms",
        industry: "Social Media Marketing",
        successMetrics: [
          "80% time saved on social posts",
          "Higher engagement rates",
        ],
        testimonials: [
          "Perfect for consistent social media presence - Social Media Manager",
        ],
      },
    ],
    featuredUseCases: ["Marketing Content Creation", "Blog Content Production"],

    pricing: { monthly: 49, yearly: 468, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1000,
      accuracyScore: 0.89,
      reliabilityScore: 0.93,
      uptime: 99.9,
    },

    reputationMetrics: {
      overallScore: 4.6,
      reviewsCount: 10000,
      verifiedReviewsCount: 8500,
      ratings: {
        five: 6000,
        four: 2500,
        three: 1000,
        two: 300,
        one: 200,
      },
      expertScore: 4.7,
    },

    popularityScore: 4.7,

    similarAgents: ["agent_003", "agent_013"],
    competitiveAdvantages: [
      "Advanced content optimization",
      "Brand voice consistency",
      "Multi-language support",
      "SEO integration",
    ],
    limitations: [
      "Learning curve for advanced features",
      "Premium pricing",
      "Quality varies by language",
      "Template limitations",
    ],
    bestSuitedFor: [
      "Content marketers",
      "Digital marketing agencies",
      "Social media managers",
      "Blog writers",
      "Marketing teams",
    ],

    releaseDate: "2021-01-15",
    lastUpdated: "2024-02-15",
    version: "3.5",

    documentationURL: "https://help.jasper.ai",
    demoURL: "https://www.jasper.ai/demo",
    communityURL: "https://community.jasper.ai",
    supportURL: "https://support.jasper.ai",
  },
  {
    id: "agent_012",
    name: "Synthesia",
    shortDescription: "Create professional videos with AI avatars and voices.",
    description:
      "An AI video generation platform that creates professional videos using synthetic avatars and voices, enabling quick production of training, marketing, and educational content.",
    imageUrl: "https://www.synthesia.io/favicon.ico",
    category: "Video Production",
    subcategories: ["Content Creation", "Video Generation", "Training"],
    tags: [
      "video creation",
      "AI avatars",
      "synthetic media",
      "video production",
    ],
    developer: "Synthesia Ltd.",
    capabilities: [
      "AI avatar generation",
      "text-to-speech synthesis",
      "video customization",
      "multi-language video creation",
      "template management",
      "script generation",
    ],
    integrationPlatforms: ["Web", "API", "LMS Integration", "Zapier"],
    apiEndpoint: "https://api.synthesia.io",
    supportedLanguages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Chinese",
      "Japanese",
    ],
    technicalRequirements: [
      "Modern web browser",
      "Active subscription",
      "Stable internet connection",
    ],

    useCases: [
      {
        title: "Corporate Training",
        description: "Create engaging training videos with AI presenters",
        industry: "Corporate Learning",
        successMetrics: [
          "90% reduction in video production time",
          "60% cost savings",
        ],
        testimonials: [
          "Transformed our training content creation - L&D Director",
        ],
      },
      {
        title: "Marketing Videos",
        description: "Generate multilingual marketing content at scale",
        industry: "Marketing",
        successMetrics: ["75% faster video production", "Global market reach"],
        testimonials: ["Game-changer for our international marketing - CMO"],
      },
      {
        title: "Product Demonstrations",
        description: "Create product demos and tutorials efficiently",
        industry: "Product Marketing",
        successMetrics: ["85% time saved on demos", "Increased engagement"],
        testimonials: [
          "Streamlined our product demo process - Product Manager",
        ],
      },
    ],
    featuredUseCases: ["Corporate Training", "Marketing Videos"],

    pricing: { monthly: 30, yearly: 300, freeTier: false },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 3000,
      accuracyScore: 0.91,
      reliabilityScore: 0.94,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.5,
      reviewsCount: 3000,
      verifiedReviewsCount: 2500,
      ratings: {
        five: 1800,
        four: 500,
        three: 400,
        two: 200,
        one: 100,
      },
      expertScore: 4.6,
    },

    popularityScore: 4.4,

    similarAgents: ["agent_014", "agent_016"],
    competitiveAdvantages: [
      "Quick video production",
      "Multi-language support",
      "Professional AI avatars",
      "Customizable templates",
    ],
    limitations: [
      "Limited animation options",
      "Avatar customization constraints",
      "Internet-dependent",
      "Processing time for long videos",
    ],
    bestSuitedFor: [
      "Training departments",
      "Marketing teams",
      "Educational institutions",
      "Content creators",
      "Sales teams",
    ],

    releaseDate: "2021-03-01",
    lastUpdated: "2024-02-10",
    version: "4.0",

    documentationURL: "https://docs.synthesia.io",
    demoURL: "https://www.synthesia.io/demo",
    communityURL: "https://community.synthesia.io",
    supportURL: "https://support.synthesia.io",
  },
  {
    id: "agent_013",
    name: "Hyperwrite",
    shortDescription: "Advanced AI writing assistant for better content.",
    description:
      "An AI writing assistant that helps users create high-quality content with advanced grammar checking, style suggestions, and content optimization features.",
    imageUrl: "https://hyperwrite.ai/favicon.ico",
    category: "Writing Assistant",
    subcategories: [
      "Content Creation",
      "Grammar Checking",
      "Writing Enhancement",
    ],
    tags: [
      "writing",
      "grammar",
      "content optimization",
      "productivity",
      "editing",
    ],
    developer: "OthersideAI",
    capabilities: [
      "grammar checking",
      "style enhancement",
      "content suggestions",
      "tone adjustment",
      "sentence rewriting",
      "vocabulary enhancement",
    ],
    integrationPlatforms: [
      "Web",
      "Chrome Extension",
      "Google Docs",
      "Microsoft Word Online",
    ],
    apiEndpoint: "https://api.hyperwrite.ai",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Modern web browser",
      "Internet connection",
      "Active subscription for premium features",
    ],

    useCases: [
      {
        title: "Academic Writing",
        description:
          "Help students and researchers write better academic papers",
        industry: "Education",
        successMetrics: [
          "30% improvement in writing quality",
          "Reduced editing time",
        ],
        testimonials: [
          "Significantly improved my research papers - PhD Student",
        ],
      },
      {
        title: "Professional Communication",
        description: "Enhance business emails and professional documents",
        industry: "Business",
        successMetrics: [
          "40% faster email composition",
          "Higher response rates",
        ],
        testimonials: [
          "Essential tool for our business communications - Business Executive",
        ],
      },
      {
        title: "Content Creation",
        description: "Assist in creating engaging blog posts and articles",
        industry: "Digital Media",
        successMetrics: [
          "50% faster content production",
          "Improved engagement",
        ],
        testimonials: [
          "Streamlined our content creation process - Content Manager",
        ],
      },
    ],
    featuredUseCases: ["Academic Writing", "Professional Communication"],

    pricing: { monthly: 20, yearly: 190, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 300,
      accuracyScore: 0.95,
      reliabilityScore: 0.97,
      uptime: 99.9,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 5000,
      verifiedReviewsCount: 4200,
      ratings: {
        five: 3000,
        four: 1000,
        three: 600,
        two: 300,
        one: 100,
      },
      expertScore: 4.8,
    },

    popularityScore: 4.5,

    similarAgents: ["agent_011", "agent_003"],
    competitiveAdvantages: [
      "Advanced grammar analysis",
      "Context-aware suggestions",
      "Real-time feedback",
      "Integration with popular platforms",
    ],
    limitations: [
      "English-only support",
      "Some advanced features require subscription",
      "Limited formatting options",
      "Internet connection required",
    ],
    bestSuitedFor: [
      "Students",
      "Academics",
      "Business professionals",
      "Content creators",
      "Non-native English speakers",
    ],

    releaseDate: "2022-05-01",
    lastUpdated: "2024-02-15",
    version: "2.8",

    documentationURL: "https://docs.hyperwrite.ai",
    demoURL: "https://hyperwrite.ai/demo",
    communityURL: "https://community.hyperwrite.ai",
    supportURL: "https://support.hyperwrite.ai",
  },
  {
    id: "agent_014",
    name: "Runway",
    shortDescription: "AI-powered video editing and visual effects creation.",
    description:
      "A creative suite powered by AI that enables video editing, visual effects, and motion graphics creation with advanced generative capabilities.",
    imageUrl: "https://runway.com/favicon.ico",
    category: "Creative Tools",
    subcategories: ["Video Editing", "Visual Effects", "Motion Graphics"],
    tags: [
      "video editing",
      "AI effects",
      "motion graphics",
      "creative tools",
      "visual effects",
    ],
    developer: "Runway AI, Inc.",
    capabilities: [
      "video editing",
      "motion graphics generation",
      "visual effects creation",
      "green screen removal",
      "motion tracking",
      "text-to-video generation",
      "image-to-video generation",
    ],
    integrationPlatforms: ["Web", "Desktop App", "API", "Adobe Premiere Pro"],
    apiEndpoint: "https://api.runway.com",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Modern web browser",
      "High-speed internet connection",
      "GPU recommended for desktop app",
      "Active subscription",
    ],

    useCases: [
      {
        title: "Video Content Creation",
        description: "Create professional-quality videos with AI-powered tools",
        industry: "Media Production",
        successMetrics: [
          "70% faster video production",
          "Reduced post-production costs",
        ],
        testimonials: ["Revolutionized our video workflow - Production Studio"],
      },
      {
        title: "Visual Effects Generation",
        description: "Generate and apply complex visual effects using AI",
        industry: "Film & Video",
        successMetrics: ["80% time saved on VFX", "Higher quality outputs"],
        testimonials: [
          "Game-changing VFX capabilities - Independent Filmmaker",
        ],
      },
      {
        title: "Motion Graphics Design",
        description: "Create dynamic motion graphics with AI assistance",
        industry: "Design",
        successMetrics: [
          "60% faster motion graphics creation",
          "Expanded creative possibilities",
        ],
        testimonials: [
          "Transformed our motion design process - Creative Agency",
        ],
      },
    ],
    featuredUseCases: ["Video Content Creation", "Visual Effects Generation"],

    pricing: { monthly: 35, yearly: 336, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 2000,
      accuracyScore: 0.9,
      reliabilityScore: 0.93,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.6,
      reviewsCount: 4000,
      verifiedReviewsCount: 3500,
      ratings: {
        five: 2500,
        four: 800,
        three: 400,
        two: 200,
        one: 100,
      },
      expertScore: 4.7,
    },

    popularityScore: 4.5,

    similarAgents: ["agent_012", "agent_016"],
    competitiveAdvantages: [
      "Advanced AI video tools",
      "Professional-grade outputs",
      "Intuitive interface",
      "Regular feature updates",
    ],
    limitations: [
      "Resource-intensive processing",
      "Learning curve for advanced features",
      "Limited export options in free tier",
      "Some features require powerful hardware",
    ],
    bestSuitedFor: [
      "Video editors",
      "Motion designers",
      "Content creators",
      "Filmmakers",
      "Marketing teams",
    ],

    releaseDate: "2022-01-15",
    lastUpdated: "2024-02-20",
    version: "3.2",

    documentationURL: "https://docs.runway.com",
    demoURL: "https://runway.com/demo",
    communityURL: "https://community.runway.com",
    supportURL: "https://support.runway.com",
  },
  {
    id: "agent_015",
    name: "Tome",
    shortDescription: "AI-generated dynamic presentations and storytelling.",
    description:
      "An AI-powered presentation platform that generates dynamic, narrative-driven presentations with automated design and content suggestions.",
    imageUrl: "https://tome.app/favicon.ico",
    category: "Presentation Tools",
    subcategories: ["Content Creation", "Design", "Storytelling"],
    tags: [
      "presentations",
      "storytelling",
      "design",
      "content creation",
      "slides",
    ],
    developer: "Tome, Inc.",
    capabilities: [
      "presentation generation",
      "design automation",
      "content suggestions",
      "narrative structuring",
      "image generation",
      "responsive layouts",
    ],
    integrationPlatforms: ["Web", "Mobile", "API", "Figma"],
    apiEndpoint: "https://api.tome.app",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Modern web browser",
      "Internet connection",
      "Active subscription for premium features",
    ],

    useCases: [
      {
        title: "Sales Presentations",
        description: "Create compelling sales decks and proposals",
        industry: "Sales",
        successMetrics: ["60% faster deck creation", "Higher conversion rates"],
        testimonials: [
          "Revolutionized our sales pitch process - Sales Director",
        ],
      },
      {
        title: "Startup Pitches",
        description: "Generate professional investor pitch decks",
        industry: "Startups",
        successMetrics: [
          "75% time saved on deck design",
          "Improved pitch success rate",
        ],
        testimonials: [
          "Essential tool for our fundraising efforts - Startup Founder",
        ],
      },
      {
        title: "Educational Content",
        description: "Create engaging educational presentations",
        industry: "Education",
        successMetrics: [
          "50% faster content creation",
          "Increased student engagement",
        ],
        testimonials: [
          "Transformed our lesson presentations - Education Professional",
        ],
      },
    ],
    featuredUseCases: ["Sales Presentations", "Startup Pitches"],

    pricing: { monthly: 25, yearly: 240, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1500,
      accuracyScore: 0.88,
      reliabilityScore: 0.92,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.5,
      reviewsCount: 2000,
      verifiedReviewsCount: 1800,
      ratings: {
        five: 1200,
        four: 400,
        three: 250,
        two: 100,
        one: 50,
      },
      expertScore: 4.6,
    },

    popularityScore: 4.4,

    similarAgents: ["agent_011", "agent_013"],
    competitiveAdvantages: [
      "AI-powered design automation",
      "Narrative-first approach",
      "Dynamic content generation",
      "Modern design templates",
    ],
    limitations: [
      "Limited offline capabilities",
      "Some advanced features require subscription",
      "English-only support",
      "Template customization constraints",
    ],
    bestSuitedFor: [
      "Sales professionals",
      "Startup founders",
      "Educators",
      "Marketing teams",
      "Business professionals",
    ],

    releaseDate: "2022-08-15",
    lastUpdated: "2024-02-18",
    version: "2.5",

    documentationURL: "https://help.tome.app",
    demoURL: "https://tome.app/demo",
    communityURL: "https://community.tome.app",
    supportURL: "https://support.tome.app",
  },
  {
    id: "agent_016",
    name: "Descript",
    shortDescription: "Text-based video and audio editing with AI tools.",
    description:
      "An AI-powered video and audio editing platform that enables text-based editing, voice cloning, and automated transcription for content creators.",
    imageUrl: "https://www.descript.com/favicon.ico",
    category: "Media Production",
    subcategories: ["Video Editing", "Audio Editing", "Content Creation"],
    tags: [
      "video editing",
      "audio editing",
      "transcription",
      "voice cloning",
      "podcast production",
    ],
    developer: "Descript, Inc.",
    capabilities: [
      "text-based video editing",
      "audio transcription",
      "voice cloning",
      "filler word removal",
      "automated editing",
      "screen recording",
      "multitrack editing",
    ],
    integrationPlatforms: ["Desktop App", "Web", "API", "Cloud Storage"],
    apiEndpoint: "https://api.descript.com",
    supportedLanguages: ["English"],
    technicalRequirements: [
      "Modern computer",
      "High-speed internet",
      "Active subscription",
      "Storage space for media files",
    ],

    useCases: [
      {
        title: "Podcast Production",
        description: "Streamline podcast editing and production workflow",
        industry: "Media & Entertainment",
        successMetrics: ["70% faster editing time", "Improved audio quality"],
        testimonials: [
          "Revolutionized our podcast workflow - Professional Podcaster",
        ],
      },
      {
        title: "Video Content Creation",
        description: "Create and edit professional video content efficiently",
        industry: "Content Creation",
        successMetrics: [
          "65% faster video production",
          "Seamless editing experience",
        ],
        testimonials: ["Game-changing for our video content - YouTuber"],
      },
      {
        title: "Corporate Communications",
        description: "Produce internal and external video communications",
        industry: "Corporate",
        successMetrics: ["80% faster turnaround time", "Professional results"],
        testimonials: [
          "Essential for our corporate videos - Communications Director",
        ],
      },
    ],
    featuredUseCases: ["Podcast Production", "Video Content Creation"],

    pricing: { monthly: 15, yearly: 144, freeTier: true },
    licenseType: "subscription",
    enterpriseOptions: true,

    performanceMetrics: {
      responseTime: 1800,
      accuracyScore: 0.92,
      reliabilityScore: 0.94,
      uptime: 99.8,
    },

    reputationMetrics: {
      overallScore: 4.7,
      reviewsCount: 3500,
      verifiedReviewsCount: 3000,
      ratings: {
        five: 2200,
        four: 800,
        three: 300,
        two: 150,
        one: 50,
      },
      expertScore: 4.8,
    },

    popularityScore: 4.6,

    similarAgents: ["agent_012", "agent_014"],
    competitiveAdvantages: [
      "Text-based editing",
      "Advanced voice cloning",
      "Integrated transcription",
      "Collaborative features",
    ],
    limitations: [
      "Resource-intensive processing",
      "Limited offline capabilities",
      "Storage space requirements",
      "Learning curve for advanced features",
    ],
    bestSuitedFor: [
      "Podcasters",
      "Video creators",
      "Content producers",
      "Corporate communications",
      "Educators",
    ],

    releaseDate: "2019-09-01",
    lastUpdated: "2024-02-15",
    version: "5.0",

    documentationURL: "https://help.descript.com",
    demoURL: "https://www.descript.com/demo",
    communityURL: "https://community.descript.com",
    supportURL: "https://support.descript.com",
  },
];

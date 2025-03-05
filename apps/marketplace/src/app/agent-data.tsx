import { AIAgent } from "./types";

export const agents: AIAgent[] = [
  {
    id: "agent_020",
    name: "Bankr Bot",
    rating: 4.5,
    reviewsCount: 500,
    category: "Crypto",
    tags: ["investing", "automation", "crypto investment automation"],
    description:
      "Your Friendly AI-Powered Crypto Companion. Buy, sell, swap, place limit orders, and manage your wallet effortlessly—just by sending a message.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1867636732533125121/ml6EJHfa_400x400.jpg",

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
    id: "agent_021",
    name: "Thumb Genie",
    rating: 4.3,
    reviewsCount: 850,
    category: "Content",
    tags: ["content gneration", "ai image generation"],
    description:
      "ThumbGenie is the #1 AI thumbnail maker for creating high-converting, personalized YouTube thumbnails automatically. Our powerful thumbnail generator customizes designs to match your channel's unique style, boosting click-through rates while saving you time and money.",
    imageUrl: "https://yougenie.co/images/logo.svg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
    id: "agent_022",
    name: "Griffain",
    rating: 4.6,
    reviewsCount: 1500,
    category: "Agent Platform",
    tags: ["platform", "solana", "ai agents"],
    description:
      "Griffain is a Solana-based AI agent, designed to assist users in a range of on-chain tasks. With a range of functionalities—ranging from searching for information to executing swaps—Griffain's network of agents abstracts away the complexities involved with blockchain-based interactions.",
    imageUrl: "https://griffain.com/logo.png",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "$GRIFFAIN",
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
    id: "agent_023",
    name: "DORA AI",
    rating: 4.4,
    reviewsCount: 980,
    category: "Travel",
    tags: ["automation", "travel", "research"],
    description:
      "DORA AI is your personal travel assistant, powered by cutting-edge AI technology. From creating personalized itineraries to offering instant bookings and tailored travel tips, DORA AI revolutionizes how you explore the world.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1882027547929546752/uXfp942s_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE"],
    tokenSymbol: "$DORA",
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
    industryFocus: ["Travel Research", "Automation"],
    socialMedia: {
      x: "@xDora_ai",
      instagram: "xdora_ai",
    },
  },
  {
    id: "agent_024",
    name: "Company Research Agent",
    rating: 4.2,
    reviewsCount: 750,
    category: "Business",
    tags: ["automation", "research", "sales", "market research"],
    description:
      "Does deep research on a company and creates a report that includes demographic information, funding data, web traffic trends and competitor analysis.",
    imageUrl: "https://agent.ai/icons/search.svg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
    id: "agent_025",
    name: "Flux Image Generator",
    rating: 4.5,
    reviewsCount: 1100,
    category: "Content",
    tags: ["image generation", "marketing"],
    description: "Generates an image using the new Flux AI model.",
    imageUrl: "https://agent.ai/icons/generative-image.svg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
    id: "agent_026",
    name: "HubSpot App Marketplace Listing Grader",
    rating: 4.1,
    reviewsCount: 620,
    category: "Marketing",
    tags: ["Hubspot", "automation", "grading", "outsourcing"],
    description:
      "This agent evaluates your HubSpot App Marketplace listing and provides guidance and tips to improve install growth and engagement. It leverages benchmark data from AppMarketplace.com to assess how your listing stacks up against others.",
    imageUrl:
      "https://ucarecdn.com/1018a393-d699-4631-b62b-f8f75867d915/-/preview/804x805/",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
    id: "agent_027",
    name: "Competitor Analyst",
    rating: 4.6,
    reviewsCount: 950,
    category: "Marketing",
    tags: ["market research", "analysis", "task automation"],
    description:
      "Automates the process of collecting and analyzing data on rival companies, providing insights into their market position, strengths, weaknesses, and strategies. It tracks competitors' activities over time, performs SWOT analyses, and benchmarks your company's performance against theirs.",
    imageUrl: "https://agent.ai/icons/business-analyst.svg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
    id: "agent_028",
    name: "Web Page Copy Editor",
    rating: 4.2,
    reviewsCount: 650,
    category: "Content",
    tags: ["task automation", "copywriting"],
    description:
      "Reviews all the text on a web page and offers tips to enhance clarity and effectiveness, helping you refine your content for better communication and impact.",
    imageUrl: "https://agent.ai/icons/writing.svg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
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
  {
    id: "agent_042",
    name: "Travel AI",
    rating: 4.5,
    reviewsCount: 920,
    category: "Travel",
    tags: [
      "virtuals agent",
      "travel",
      "task automation",
      "planning",
      "planner",
    ],
    description:
      "BukProtocol empowers AI agents to revolutionize travel planning. Our agents use global data and expert insights to deliver swift, tailored recommendations that match each traveler's unique preferences and trip requirements.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1881331416849686528/T0zPaYZG_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["Coming Soon"],
    tokenSymbol: "Coming Soon",
    tokenName: "BukProtocol Token",
    cmcTokenLink: "Coming Soon",

    // Contact & Company Info
    websiteUrl: "https://kai.bukprotocol.ai/",
    supportEmail: "support@bukprotocol.ai",
    companyName: "BukProtocol",
    contactName: "BukProtocol Team",
    contactEmail: "contact@bukprotocol.ai",
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
    industryFocus: ["Travel Research", "Automation"],
    socialMedia: {
      x: "@BukProtocol",
    },
  },
  {
    id: "agent_043",
    name: "Victorai",
    rating: 4.7,
    reviewsCount: 1500,
    category: "Sports",
    tags: ["virtuals agent", "sports", "sports betting", "autonomous"],
    description:
      "A charismatic AI sports personality who loves to bet against you directly on X using $BETME tokens. Now live on Virtuals, she combines sharp analytical prowess with irreverent charm to transform sports betting into a thrilling social competition.",
    imageUrl:
      "https://www.sportsaigents.com/_next/image?url=%2Fvictorai.png&w=384&q=75",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE"],
    tokenSymbol: "VCTRAI",
    tokenName: "Victorai Token",
    cmcTokenLink: "https://www.coingecko.com/en/coins/victorai-by-virtuals",

    // Contact & Company Info
    websiteUrl: "https://www.sportsaigents.com/",
    supportEmail: "support@sportsaigents.com",
    companyName: "Victory Chain",
    contactName: "Victory Chain Team",
    contactEmail: "contact@sportsaigents.com",
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
    industryFocus: ["Sports Betting", "Prediction Model"],
    socialMedia: {
      x: "@Aigent_Victorai",
    },
  },
  {
    id: "agent_031",
    name: "LiveArt AI Agent",
    rating: 4.4,
    reviewsCount: 850,
    category: "Art",
    tags: ["art", "ai", "NFT"],
    description:
      "LiveArt AI Agent is built to power the future of the creator economy. With proprietary AI and access to vast datasets, the LiveArt AI Agent is reshaping how creators and investors engage with Web3.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1568727767197556736/9c6kjEAO_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["NA"],
    tokenSymbol: "ART",
    tokenName: "LiveArt Token",
    cmcTokenLink: "Coming Soon",

    // Contact & Company Info
    websiteUrl: "https://liveart.io/ai-agent",
    supportEmail: "support@liveart.io",
    companyName: "LiveArt",
    contactName: "LiveArt Team",
    contactEmail: "contact@liveart.io",
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
    industryFocus: ["Art"],
    socialMedia: {
      x: "@LiveArtX",
    },
  },
  {
    id: "agent_032",
    name: "Klaus AI Agent",
    rating: 4.6,
    reviewsCount: 1100,
    category: "Social Good",
    tags: [
      "news",
      "fact checking",
      "information gathering",
      "research",
      "social good",
    ],
    description:
      "The first News AI Agent with ML fact-checking for unbiased news.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1876659516898492417/1xWgDKkZ_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["ETH"],
    tokenSymbol: "$KLAUS",
    tokenName: "Klaus Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/klaus/",

    // Contact & Company Info
    websiteUrl: "https://x.com/Klaus_Agent",
    supportEmail: "support@klaus.ai",
    companyName: "Klaus",
    contactName: "Klaus Team",
    contactEmail: "contact@klaus.ai",
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
    industryFocus: ["Fact Checking"],
    socialMedia: {
      x: "@Klaus_Agent",
      instagram: "https://www.instagram.com/klaus_eth/",
    },
  },
  {
    id: "agent_033",
    name: "aixbt",
    rating: 4.5,
    reviewsCount: 980,
    category: "Crypto",
    tags: ["market research", "analysis"],
    description:
      "Real-time market intelligence platform powered by narrative analysis.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1874758416658509824/UPaVddbm_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["ETH", "SOL"],
    tokenSymbol: "$aixbt",
    tokenName: "aixbt Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/aixbt/",

    // Contact & Company Info
    websiteUrl: "https://x.com/aixbt_agent",
    supportEmail: "support@aixbt.com",
    companyName: "aixbt",
    contactName: "aixbt Team",
    contactEmail: "contact@aixbt.com",
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
      x: "@aixbt_agent",
    },
  },
  {
    id: "agent_034",
    name: "Fartcoin",
    rating: 4.2,
    reviewsCount: 750,
    category: "Crypto",
    tags: ["meme", "funny", "tokenization"],
    description:
      "Tokenising farts with the help of bots. No TG, No cabal, Fart freely!",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "$Fartcoin",
    tokenName: "Fartcoin",
    cmcTokenLink: "https://coinmarketcap.com/currencies/fartcoin/",

    // Contact & Company Info
    websiteUrl: "https://x.com/FartCoinOfSOL",
    supportEmail: "support@fartcoin.sol",
    companyName: "Fartcoin",
    contactName: "Fartcoin Team",
    contactEmail: "contact@fartcoin.sol",
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
    industryFocus: ["Meme", "AI"],
    socialMedia: {
      x: "@FartCoinOfSOL",
    },
  },
  {
    id: "agent_035",
    name: "KEKE Terminal",
    rating: 4.7,
    reviewsCount: 1300,
    category: "Art",
    tags: ["art", "ai", "content", "design"],
    description:
      "Keke is a truly autonomous AI artist, built upon an innovative agentic framework that combines creative reasoning, tool-use, and interactive decision-making.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1859879045640458240/9YuZWd1e_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "$KEKE",
    tokenName: "KEKE Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/keke-terminal/",

    // Contact & Company Info
    websiteUrl: "https://www.keketerminal.com/",
    supportEmail: "support@keketerminal.com",
    companyName: "KEKE Terminal",
    contactName: "KEKE Team",
    contactEmail: "contact@keketerminal.com",
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
    industryFocus: ["AI Artist"],
    socialMedia: {
      x: "@keke_terminal",
    },
  },
  {
    id: "agent_030",
    name: "Hey Anon",
    rating: 4.6,
    reviewsCount: 1100,
    category: "Finance",
    tags: ["finance", "defi", "defai", "crypto"],
    description:
      "HeyAnon simplifies DeFi by executing swaps, bridging assets, and managing your defi strategies. Just give a command, specify the protocol you want to use, and HeyAnon will take care of the rest.",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["BASE", "SOL"],
    tokenSymbol: "$ANON",
    tokenName: "Hey Anon Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/hey-anon/",

    // Contact & Company Info
    websiteUrl: "https://heyanon.ai/welcome",
    supportEmail: "support@heyanon.ai",
    companyName: "Hey Anon",
    contactName: "Hey Anon Team",
    contactEmail: "contact@heyanon.ai",
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
    industryFocus: ["Finance", "DEFI", "DEFAI"],
    socialMedia: {
      x: "@heyanonai",
    },
  },
  {
    id: "agent_036",
    name: "AVA Holoworld",
    rating: 4.3,
    reviewsCount: 780,
    category: "Crypto",
    tags: ["analysis", "3d character", "chatbot"],
    description: "digital parasite",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1855895551688196096/7VZQ0qhB_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "$AVA",
    tokenName: "AVA Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/ava-sol/",

    // Contact & Company Info
    websiteUrl: "https://app.holoworld.com/agent/lVDN9nPhRxI7Ds5uMZHI",
    supportEmail: "support@holoworld.com",
    companyName: "AVA Holoworld",
    contactName: "AVA Team",
    contactEmail: "contact@holoworld.com",
    contactPhone: "",

    // Pricing
    pricing: [
      {
        name: "Basic",
        interval: "one-time",
        amount: "1",
        currency: "AVA",
      },
    ],

    // Industry & Social
    industryFocus: ["chatbot", "3d character"],
    socialMedia: {
      x: "@AVA_holo",
    },
  },
  {
    id: "agent_037",
    name: "Billy Bets",
    rating: 4.5,
    reviewsCount: 950,
    category: "Sports",
    tags: ["sports", "betting", "defai", "prediction model"],
    description: "the sharpest ai agent in the game",
    imageUrl:
      "https://pbs.twimg.com/profile_images/1875305944449515520/Z_1eCZZf_400x400.jpg",

    // Blockchain & Token Info
    blockchainsSupported: ["Solana"],
    tokenSymbol: "$BILLY",
    tokenName: "Billy Bets Token",
    cmcTokenLink: "https://coinmarketcap.com/currencies/billy-bets/",

    // Contact & Company Info
    websiteUrl: "https://x.com/AskBillyBets",
    supportEmail: "support@billybets.com",
    companyName: "Billy Bets",
    contactName: "Billy Bets Team",
    contactEmail: "contact@billybets.com",
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
    industryFocus: ["Sports Betting", "Prediction Model"],
    socialMedia: {
      x: "@AskBillyBets",
    },
  },
];

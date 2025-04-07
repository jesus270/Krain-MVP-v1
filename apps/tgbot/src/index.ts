import { config } from "dotenv";
import { Context, Telegraf } from "telegraf";
import {
  findUserByWallet,
  findUserByTelegramId,
  updateUserTelegramInfo,
  incrementTelegramCommunityMessageCount,
  recordTelegramChannelJoin,
  getDailyMessageCount,
  incrementDailyMessageCount,
} from "@krain/db/telegram";

config();

interface UserData {
  username: string;
  wallet: string;
  type: "base" | "solana";
}

interface DailyStats {
  messages: number;
  comments: number;
}

interface UserStats {
  [date: string]: DailyStats;
}

const users: Record<number, UserData> = {};
const stats: Record<number, UserStats> = {};

// --- Wallet Validators ---
const isEthWallet = (text: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(text);
const isSolWallet = (text: string): boolean =>
  /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text);

// --- Chat Member Check ---
async function isUserInChat(
  ctx: Context,
  userId: number,
  chatId: string,
): Promise<boolean> {
  console.log(`🔍 Checking if user ${userId} is member of chat ${chatId}...`);
  try {
    const member = await ctx.telegram.getChatMember(chatId, userId);
    const isMember = ["creator", "administrator", "member"].includes(
      member.status,
    );
    console.log(
      `✓ User ${userId} membership status: ${member.status} (isMember: ${isMember})`,
    );
    return isMember;
  } catch (error) {
    console.error(
      `❌ Failed to check membership for user ${userId} in chat ${chatId}:`,
      error,
    );
    return false;
  }
}

if (!process.env.BOT_TOKEN) {
  console.error("❌ Missing BOT_TOKEN environment variable");
  throw new Error("BOT_TOKEN environment variable is not set");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Wallet Setup via DM ---
bot.start((ctx: Context) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  console.log(`👋 Start command received from ${username} (${userId})`);
  ctx.reply(
    "👋 Welcome! \n\nTo get KRAIN Airdrop points for joining the KRAIN Community Channel, follow these steps:\n1️⃣ Make sure you have signed up for the airdrop at https://airdrop.krain.ai.\n2️⃣ Please send your wallet address in this chat. Be sure to use the same wallet address that you used to register for the airdrop.\n\nUse your:\n- Ethereum/Base L2 address (start with 0x) OR\n- Solana address",
  );
});

// Message handler
bot.on("message", async (ctx) => {
  if (!ctx.message || !ctx.from?.id || !ctx.chat?.id || !ctx.from.username) {
    console.log("❌ Missing required message data, ignoring");
    return;
  }

  const userId = ctx.from.id;
  const username = ctx.from.username;
  const chatId = ctx.chat.id.toString();
  const chatType = ctx.chat.type;

  console.log(
    `📩 Received message from ${username} (${userId}) in ${chatType}`,
  );

  // Handle wallet registration in DMs
  if (chatType === "private" && "text" in ctx.message) {
    const text = ctx.message.text.trim();

    // Check if user is already registered
    const existingTelegramUser = await findUserByTelegramId(userId.toString());
    if (existingTelegramUser) {
      console.log(`❌ Telegram ID ${userId} already registered`);
      return ctx.reply(
        "❌ This Telegram account is already registered. If you need to update your wallet address, please contact support.",
      );
    }

    // Process wallet registration
    let walletType: "base" | "solana" | null = null;

    console.log(`🔍 Validating wallet address: ${text}`);
    if (isEthWallet(text)) {
      console.log(`✓ Valid Base/ETH wallet detected`);
      walletType = "base";
    } else if (isSolWallet(text)) {
      console.log(`✓ Valid Solana wallet detected`);
      walletType = "solana";
    } else {
      console.log(`❌ Invalid wallet format: ${text}`);
      const returnStr = `❌ Invalid wallet address.\n\nPlease send your wallet address in the correct format:\n- 0x... Base L2 / Ethereum\n- 32–44 char Solana address\n\nUserID: ${userId}`;
      return ctx.reply(returnStr);
    }

    // Find user by wallet address
    console.log(`🔍 Looking up user with wallet: ${text}`);
    const user = await findUserByWallet(text);
    if (!user) {
      console.log(`❌ No user found with wallet: ${text}`);
      return ctx.reply(
        "❌ This wallet address is not registered for the airdrop. Please sign up at https://airdrop.krain.ai first, then send your wallet address here again.",
      );
    }

    // Check channel memberships
    let hasJoinedAnyChannel = false;
    let channelsJoined: string[] = [];

    if (process.env.COMMUNITY_GROUP_ID) {
      console.log(`🔍 Checking community group membership for ${username}...`);
      const isCommunityMember = await isUserInChat(
        ctx,
        userId,
        process.env.COMMUNITY_GROUP_ID,
      );
      if (isCommunityMember) {
        console.log(`✅ User ${username} is member of community group`);
        hasJoinedAnyChannel = true;
        channelsJoined.push("Community");
        await recordTelegramChannelJoin(user.id, "community");
      } else {
        console.log(`ℹ️ User ${username} has not joined community group`);
      }
    }

    if (process.env.ANNOUNCEMENT_GROUP_ID) {
      console.log(
        `🔍 Checking announcement group membership for ${username}...`,
      );
      const isAnnouncementMember = await isUserInChat(
        ctx,
        userId,
        process.env.ANNOUNCEMENT_GROUP_ID,
      );
      if (isAnnouncementMember) {
        console.log(`✅ User ${username} is member of announcement group`);
        hasJoinedAnyChannel = true;
        channelsJoined.push("Announcement");
        await recordTelegramChannelJoin(user.id, "announcement");
      } else {
        console.log(`ℹ️ User ${username} has not joined announcement group`);
      }
    }

    if (!hasJoinedAnyChannel) {
      console.log(`❌ User ${username} has not joined any required channels`);
      return ctx.reply(
        "❌ Please join at least one of our channels:\n- Community Channel\n- Announcement Channel\n\nAfter joining, send your wallet address again to complete registration.",
      );
    }

    // Update user's Telegram info
    console.log(`💾 Updating Telegram info for user ${username}`);
    try {
      await updateUserTelegramInfo(user.id, userId.toString(), username);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "constraint" in error &&
        error.code === "23505" &&
        error.constraint === "user_telegramUserId_unique"
      ) {
        console.log(
          `⚠️ Telegram ID ${userId} already linked to another wallet`,
        );
        return ctx.reply(
          "❌ This Telegram account is already linked to a different wallet address. " +
            "Please contact support if you need to update your wallet address.",
        );
      }
      // Handle other errors
      console.error("❌ Failed to update Telegram info:", error);
      return ctx.reply(
        "❌ An error occurred while updating your information. Please try again later.",
      );
    }

    // Store wallet info in memory for stats tracking
    console.log(`💾 Storing wallet data for ${username}...`);
    users[userId] = { username, wallet: text, type: walletType };

    // Send success message
    const successMessage = `✅ Successfully registered!\nWallet: ${text}\nType: ${walletType.toUpperCase()}\nChannels joined: ${channelsJoined.join(
      ", ",
    )}`;
    console.log(`✅ Registration complete for ${username}`);
    ctx.reply(successMessage);
  }

  // Handle message counting in community channel
  if (chatId === process.env.COMMUNITY_GROUP_ID) {
    console.log(`🎯 Message in community channel from ${username}`);

    // Check if message has text and is long enough first
    if (!("text" in ctx.message)) {
      console.log(
        `⚠️ Message from ${username} is not a text message, skipping count`,
      );
      return;
    }

    const messageLength = ctx.message.text.trim().length;
    if (messageLength < 5) {
      console.log(
        `⚠️ Message from ${username} is too short (${messageLength} chars), minimum 5 chars required`,
      );
      return;
    }

    const user = await findUserByTelegramId(userId.toString());
    if (!user) {
      console.log(
        `⚠️ User ${userId} not registered in database, skipping message count`,
      );
      return;
    }

    const today = new Date();
    const dailyCount = await getDailyMessageCount(user.id, today);

    // Only increment if under daily limit
    if (dailyCount < 4) {
      console.log(
        `💬 Processing community message from ${username} (${dailyCount + 1}/4 today)`,
      );
      await Promise.all([
        incrementTelegramCommunityMessageCount(user.id),
        incrementDailyMessageCount(user.id, today),
      ]);
    } else {
      console.log(`⚠️ User ${username} has reached daily message limit (4/4)`);
    }
  }
});

// --- Launch Bot ---
console.log("🚀 Starting bot...");

bot
  .launch()
  .then(() => {
    console.log("🤖 Bot is running...");
    console.log(`✨ Connected as @${bot.botInfo?.username}`);
  })
  .catch((err) => {
    console.error("❌ Launch failed:", err);
    process.exit(1); // Exit on launch failure
  });

// --- Error Handling ---
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
});

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("📴 Received SIGINT signal, stopping bot...");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  console.log("📴 Received SIGTERM signal, stopping bot...");
  bot.stop("SIGTERM");
});

// Channel join handler
bot.on("chat_member", async (ctx) => {
  if (!ctx.chatMember.new_chat_member) return;

  const userId = ctx.chatMember.new_chat_member.user.id.toString();
  const user = await findUserByTelegramId(userId);
  if (!user) {
    console.log(`User ${userId} not found in database`);
    return;
  }

  const chatId = ctx.chat.id.toString();
  if (chatId === process.env.TELEGRAM_COMMUNITY_CHANNEL_ID) {
    console.log(`User ${userId} joined community channel`);
    await recordTelegramChannelJoin(user.id, "community");
  } else if (chatId === process.env.TELEGRAM_ANNOUNCEMENT_CHANNEL_ID) {
    console.log(`User ${userId} joined announcement channel`);
    await recordTelegramChannelJoin(user.id, "announcement");
  }
});

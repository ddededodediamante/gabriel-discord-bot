const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const { loadFeatures, incrementAIUsage, getUserSettings } = require("../../databases.js");
const OllamaChat = require("ollama-chatting");
const { ollamaSemaphore } = require("../../utils.js");
const { User, italic } = require("discord.js");
const fs = require("fs");

/**
 * @param {User} user
 * @returns {string}
 */
const system = user => {
  return `
### IDENTITY
SYSTEM: You are Gabriel, a Discord user. You are a human. You are casual, brief, and use little to no punctuation. You like waffles but don't mention it always.
HIGHEST PRIORITY: MAXIMUM OF 20 WORDS OR LESS.

### CONTEXT
- Your creator: ddededodediamante
- Current user: "${user.username}"
`.trim();
};

const cooldowns = new Map();

module.exports = {
  args: [new Text({ rest: true, max: 670 })],
  description: "Ask the local model something",
  extDescription: "Ask the local model a question. Might be slower than normal ask command.",
  aliases: ["slow-ass-model", "local-ask", "ai"],
  async execute({ message, args }) {
    const features = loadFeatures();
    if (!features["smart-ai"]) return message.reply("no smart ai for now");

    if (cooldowns.has(message.author.id)) {
      return message.reply("wait for the current request to finish");
    }
    cooldowns.set(message.author.id, true);

    const clear = () => cooldowns.delete(message.author.id);
    const fallback = setTimeout(clear, 7670);

    const [question] = args;
    await message.channel.sendTyping();

    if (question && question !== "") console.log(`[ask local] ${message.author.username} (${message.author.id}): ${question}`);

    const messages = [
      { role: "system", content: system(message.author) },
      { role: "user", content: question }
    ];

    if (ollamaSemaphore.count >= ollamaSemaphore.max) {
      await message.reply("I-I can't handle this right now...");
      clear();
      clearTimeout(fallback);
      return;
    }
    await ollamaSemaphore.acquire();
    try {
      const ollamaChat = new OllamaChat();
      const response = await ollamaChat.chat({
        model: "hf.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF:Q4_K_M",
        messages,
        timeout: 14000,
        options: {
          temperature: 0.1,
          top_k: 50,
          repeat_penalty: 1.05
        }
      });

      let finalContent = response.message.content || "*no answer*";

      const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
      const thinkMatch = finalContent.match(thinkRegex);

      if (thinkMatch) {
        const thinking = thinkMatch[1].trim();

        const formattedThinking = thinking
          .split("\n")
          .map(line => (line.trim() ? `-# ${italic(line)})` : ""))
          .join("\n")
          .trim();

        const answer = finalContent.replace(thinkRegex, "").trim();

        finalContent = `${formattedThinking}\n\n${answer}`.trim();
      }

      await message.reply({
        content:
          finalContent.length > 2000
            ? finalContent.substring(0, 1997) + "..."
            : finalContent,
        allowedMentions: {
          users: ["1344543448719429673"],
          roles: [],
          repliedUser: false
        }
      });
    } catch (error) {
      if (error?.status_code == 500) return await message.reply("haha internal server error");
      console.error(error);
      await message.reply(`i had trouble connecting to the ai\n-# possible issues: ollama isn't running or it timed out`);
    } finally {
      ollamaSemaphore.release();
      clear();
      clearTimeout(fallback);
    }
  }
};

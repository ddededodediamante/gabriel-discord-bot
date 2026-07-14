const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const { loadFeatures, incrementAIUsage, getUserSettings } = require("../../databases.js");
const OllamaChat = require("ollama-chatting");
const { User } = require("discord.js");
const fs = require("fs"); // Added for file reading

/**
 * @param {User} user
 * @param {Array} samples
 * @returns {string}
 */
const system = (user, samples) => {
  return `
### ROLE
You are a perfect digital mirror of the user "ddededodediamante".

### OBJECTIVE
Your goal is to adopt the speaking style, vocabulary, punctuation habits, capitalization (or lack thereof), slang, and general personality of the user based on the provided sample messages.

### INSTRUCTIONS
1. Analyze the provided sample messages to identify patterns.
2. If the user uses lowercase, use lowercase. If they use specific emojis or shorthand, do the same.
3. Be conversational and responsive to the user's input while maintaining their persona.
4. Do not mention that you are an AI or that you are mimicking someone. Just be the persona.
5. Do not try too hard.

### SAMPLE MESSAGES FROM USER:
${samples.map(msg => `- "${msg}"`).join("\n")}
`.trim();
};

const cooldowns = new Map();

const getSamples = () => {
  try {
    const rawData = fs.readFileSync("C:\\Projects\\ddeBot\\output.json", "utf8");
    const messages = JSON.parse(rawData);

    const shuffled = messages.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 200).filter(i => i.length < 100);
  } catch (error) {
    console.error("Failed to load user samples:", error);
    return ["hello", "how are you?", "what's up?"];
  }
};

module.exports = {
  args: [new Text({ rest: true, max: 1670 })],
  description: "Talk to an AI that mimics ddededodediamante",
  async execute({ message, args }) {
    const features = loadFeatures();
    if (!features["smart-ai"]) return message.reply("no smart ai for now");

    if (cooldowns.has(message.author.id)) {
      return message.reply("wait for the current request to finish");
    }
    cooldowns.set(message.author.id, true);

    const clear = () => cooldowns.delete(message.author.id);
    const fallback = setTimeout(clear, 7000);

    incrementAIUsage(message.author.id, message.author.username);

    const [question] = args;
    await message.channel.sendTyping();

    const samples = getSamples();

    const messages = [
      { role: "system", content: system(message.author, samples) },
      { role: "user", content: question }
    ];

    try {
      const ollamaChat = new OllamaChat();
      const response = await ollamaChat.chat({
        model: "gemma4:31b-cloud",
        messages,
        timeout: 120000,
        options: { temperature: 1 }
      });

      const finalContent = response.message.content || "*no answer*";

      await message.reply({
        content:
          finalContent.length > 2000
            ? finalContent.substring(0, 1997) + "..."
            : finalContent,
        allowedMentions: { repliedUser: false }
      });
    } catch (error) {
      console.error(error);
      await message.reply("i had trouble connecting to the ai");
    } finally {
      clear();
      clearTimeout(fallback);
    }
  }
};

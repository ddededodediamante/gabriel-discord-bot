const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { random } = require("../../utils.js");

module.exports = {
  args: [new Text({ rest: true })],
  description: "It's not just X—it's Y",
  aliases: ["ecks-why-sea"],
  execute({ message, args }) {
    const [first, second] = args[0].split(", ");
    if (!first || !second)
      return message.reply("are you stupid\nsend me a message with a comma on it");

    const emojisList = ["🔥", "✨", "⭐", "💯", "🎉", "🚀"];

    if (args[0].length > 1000) return message.reply("shut up send something shorter");

    const emojisCount = random(4, 10);
    const emojis = Array.from(
      { length: emojisCount },
      () => emojisList[random(0, emojisList.length - 1)]
    );

    message.reply(`it’s not *just* ${first.trim()}—it’s ${second.trim()}. ${emojis.join("")}`);
  }
};

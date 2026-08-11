const Sentiment = require("sentiment");
const { EmbedBuilder, inlineCode } = require("discord.js");
const { Text } = require("../../args.js");
const { client } = require("../../index.js");

const sentiment = new Sentiment();

module.exports = {
  args: [new Text({ rest: true, optional: true, max: 1670 })],
  description: "Analyzes the sentiment of a message or the recent channel chat",
  aliases: ["howami", "sentiment"],
  async execute({ message, args }) {
    const text = args[0]?.trim();

    let result;
    let label;
    if (text) {
      result = sentiment.analyze(text);
      label = "Message";
    } else {
      const fetched = await message.channel.messages.fetch({ limit: 20 });
      const recent = fetched
        .filter(msg => msg.author.id !== client.user.id && msg.content)
        .first(10)
        .map(msg => msg.content)
        .join("\n");

      if (!recent) {
        return message.reply("there's nothing to analyze here");
      }

      result = sentiment.analyze(recent);
      label = "Recent chat";
    }
    const fields = [
      {
        name: label,
        value: text ? `> ${text}` : "last 10 messages (from everyone not just you)",
        inline: false
      },
      { name: "Score", value: String(result.score), inline: true },
      { name: "Comparative", value: result.comparative.toFixed(2), inline: true }
    ];
    const positive = [...new Set(result.positive)];
    const negative = [...new Set(result.negative)];
    let positiveValue = positive.map(inlineCode).join(", ");
    let negativeValue = negative.map(inlineCode).join(", ");
    if (positiveValue.length >= 1000) positiveValue = "why so positive?";
    if (negativeValue.length >= 1000) negativeValue = "why so negative?";

    if (positive.length) {
      fields.push({
        name: `Positive (${positive.length})`,
        value: positiveValue,
        inline: false
      });
    }
    if (negative.length) {
      fields.push({
        name: `Negative (${negative.length})`,
        value: negativeValue,
        inline: false
      });
    }

    const embed = new EmbedBuilder()
      .setColor(result.score === 0 ? "Blurple" : result.score >= 0 ? "Green" : "Red")
      .addFields(fields);

    return message.reply({ embeds: [embed] });
  }
};

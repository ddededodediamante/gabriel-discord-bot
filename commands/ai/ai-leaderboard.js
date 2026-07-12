const { EmbedBuilder } = require("discord.js");
const { getTopAIUsers, getUserSettings } = require("../../databases.js");

const approximation = 12.5;
const cupSize = 250;

const formatVolume = ml => {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(2)} L 💦`;
  }
  return `${ml.toFixed(0)} ml`;
};

module.exports = {
  args: [],
  description: "Show the top 10 AI command users",
  execute({ message }) {
    const top = getTopAIUsers(10);
    if (top.length === 0) {
      return message.reply("no one has used any ai commands yet");
    }

    const totalUses = top.reduce((sum, entry) => sum + entry.count, 0);
    const totalWaterMl = totalUses * approximation;
    const totalCups = (totalWaterMl / cupSize).toFixed(1);

    const lines = top.map((entry, i) => {
      const hidden = getUserSettings(entry.id)["hide-from-leaderboard"];
      const display = hidden ? "😋 Anonymous" : `<@${entry.id}>`;
      return `${i + 1}. ${display}: **${entry.count} use${entry.count === 1 ? "" : "s"}** (${formatVolume(entry.count * approximation)})`;
    });

    const embed = new EmbedBuilder()
      .setTitle("💧 AI Usage Leaderboard 💧")
      .setColor("Blue")
      .setDescription(lines.join("\n"))
      .addFields({
        name: "Total Usage",
        value: `Commands: **${totalUses}**\nWater: **${formatVolume(totalWaterMl)}** (~${totalCups} cups)`
      })
      .setFooter({ text: "Only ask and draw count, 1 cup ≈ 250ml" });

    return message.reply({ embeds: [embed] });
  }
};

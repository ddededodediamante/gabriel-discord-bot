const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  args: [],
  description: "Information about gabriel",
  execute({ message, args }) {
    const packagePath = path.join(__dirname, "../../package.json");
    const packages = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    const { dependencies } = packages;

    const depList = Object.entries(dependencies)
      .map(([name, version]) => `- **${name}:** v${version.replace("^", "").replace("~", "")}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Gabriel Information")
      .setColor("Yellow")
      .addFields({
        name: "Dependencies",
        value: depList || "No dependencies found."
      });

    return message.reply({ embeds: [embed] });
  }
};

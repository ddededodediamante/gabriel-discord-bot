const { inlineCode } = require("discord.js");
const { Text } = require("../../args.js");
const { loadFeatures, saveFeatures, config } = require("../../databases.js");

module.exports = {
  args: null,
  description: "View the current bot config",
  extDescription: "View the bot's current configuration.",
  async execute({ message, args }) {
    const user = i => `<@${i}> (${inlineCode(i)})`;

    const content = [];
    content.push(`- prefix: ${inlineCode(config.prefix)}`);
    content.push(`- suggestion channel: <#${config.suggestionChannel}>`);
    content.push(`- permissions:`);
    content.push(`  - admins: ${config.permissions.admins.map(user).join(", ")}`);
    content.push(`  - eval perms: ${config.permissions.evalPerms.map(user).join(", ")}`);
    message.reply({ content: content.join("\n"), allowedMentions: { parse: [] } });
  }
};

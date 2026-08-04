const { Text } = require("../../args.js");
const { PermissionFlagsBits } = require("discord.js");
const { getServerSettings, setServerSetting } = require("../../databases.js");

const availableSettings = {
  "disable-ai": {
    type: "boolean",
    description: "Disable all AI commands & responses in this server."
  }
};

module.exports = {
  args: [new Text({ rest: true, optional: true })],
  description: "View or change the server settings (for admins)",
  async execute({ message, args }) {
    if (!message.guild) {
      return message.reply("this command only works in a server");
    }

    const isGuildAdmin =
      message.author.id === message.guild.ownerId ||
      message.member?.permissions.has(PermissionFlagsBits.Administrator);

    if (!isGuildAdmin) {
      return message.reply(
        "you need admin permissions (or be the server owner) to use this"
      );
    }

    const guildId = message.guild.id;
    const settings = getServerSettings(guildId);
    const input = (args[0] || "").trim();

    if (!input || input === "list") {
      const lines = Object.entries(settings).map(
        ([name, value]) =>
          `${value ? "✅" : "❌"} \`${name}\`: ${availableSettings[name].description}`
      );
      return message.reply(
        `usage: \`server-settings <key> <on/off>\`\nserver's current settings:\n${lines.join("\n")}`
      );
    }

    const parts = input.split(/\s+/);
    if (parts.length < 2) {
      return message.reply("usage: `server-settings <key> <on/off>`");
    }

    const [key, state] = parts;

    if (!(key in availableSettings)) {
      return message.reply(
        `what kind of setting is \`${key}\`? available settings: ${Object.keys(availableSettings).join(", ")}`
      );
    }

    const enabled = /^(on|true|1|enable)$/i.test(state);
    const disabled = /^(off|false|0|disable)$/i.test(state);

    if (!enabled && !disabled) {
      return message.reply("state must be `on` or `off`");
    }

    setServerSetting(guildId, key, enabled);

    message.reply(`setting \`${key}\` is now ${enabled ? "enabled" : "disabled"}`);
  }
};

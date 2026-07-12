const { Text } = require("../../args.js");
const { getUserSettings, setUserSetting } = require("../../databases.js");

const availableSettings = {
  "hide-from-leaderboard": {
    type: "boolean",
    description: 'Show up as "Anonymous" on leaderboards.'
  },
  "be-hated": { type: "boolean", description: "Gabriel will HATE you." },
  "no-reply": {
    type: "boolean",
    description: "Don't get an AI response when replying to Gabriel."
  },
  "no-human": {
    type: "boolean",
    description: "Gabriel won't try to act as a human."
  }
};

module.exports = {
  args: [new Text({ rest: true, optional: true })],
  description: "View or change your user settings",
  async execute({ message, args }) {
    const userId = message.author.id;
    const settings = getUserSettings(userId);
    const input = (args[0] || "").trim();

    if (!input || input === "list") {
      const lines = Object.entries(settings).map(
        ([name, value]) =>
          `${value ? "✅" : "❌"} \`${name}\`: ${availableSettings[name].description}`
      );
      return message.reply(
        `usage: \`settings <key> <on/off>\`\nyour current settings:\n${lines.join("\n")}`
      );
    }

    const parts = input.split(/\s+/);
    if (parts.length < 2) {
      return message.reply("usage: `settings <key> <on/off>`");
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

    setUserSetting(userId, key, enabled);

    message.reply(`setting \`${key}\` is now ${enabled ? "enabled" : "disabled"}`);
  }
};

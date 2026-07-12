const { Text } = require("../../args.js");
const { loadFeatures, saveFeatures } = require("../../databases.js");

module.exports = {
  args: [new Text({ rest: true, optional: true })],
  description: "View or toggle bot features",
  async execute({ message, args }) {
    const features = loadFeatures();
    const input = (args[0] || "").trim();

    if (!input || input === "list") {
      const lines = Object.entries(features).map(
        ([name, enabled]) => `${enabled ? "✅" : "❌"} \`${name}\``
      );
      return message.reply(
        `current bot features:\n${lines.join("\n")}`
      );
    }

    const parts = input.split(/\s+/);
    if (parts.length < 2) {
      return message.reply("do something`");
    }

    const [name, state] = parts;
    if (!(name in features)) {
      return message.reply(
        `what kind of feature is \`${name}\`? use one of these: ${Object.keys(features).join(", ")}`
      );
    }

    const enabled = /^(on|true|1|enable)$/i.test(state);
    if (!enabled && !/^(off|false|0|disable)$/i.test(state)) {
      return message.reply("State must be `on` or `off`");
    }

    features[name] = enabled;
    saveFeatures(features);
    message.reply(`feature \`${name}\` ${enabled ? "enabled" : "disabled"}`);
  },
};

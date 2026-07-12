const fs = require("fs");
const path = require("path");
const { Text, tokenize, parseCommandArgs } = require("../../args.js");

function clearCache(modulePath) {
  const resolvedPath = require.resolve(modulePath);
  if (require.cache[resolvedPath]) {
    delete require.cache[resolvedPath];
  }
}

function clearCommandsCache(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      clearCommandsCache(fullPath);
    } else if (file.endsWith(".js")) {
      clearCache(fullPath);
    }
  }
}

module.exports = {
  args: [new Text({ rest: true, optional: true })],
  description: "Reload commands and events, optionally run a command after",
  async execute({ message, args, client, config, isAdmin }) {
    try {
      clearCommandsCache(path.join(__dirname, "../../commands"));

      clearCache("../../commands.js");
      clearCache("../../utils.js");
      clearCache("../../databases.js");
      clearCache("../../args.js");
      clearCache("../../functions/powder.js");

      const { reloadEvents } = require("../../index.js");
      reloadEvents();

      // mister mc macenstein

      const {
        interval: oldInterval
      } = require("../../functions/mister-mc-macenstein.js");
      clearInterval(oldInterval);

      clearCache("../../functions/mister-mc-macenstein.js");

      const { startInterval } = require("../../functions/mister-mc-macenstein.js");
      startInterval();

      const runInput = args[0];
      if (!runInput) {
        return message.reply("✅ Successfully reloaded commands and events.");
      }

      const tokens = tokenize(runInput);
      const cmdName = tokens[0].toLowerCase();
      const commands = require("../../commands.js");
      const cmd = commands[cmdName];

      if (!cmd) {
        return message.reply("✅ Reloaded, but command `" + cmdName + "` not found.");
      }

      const parsed = parseCommandArgs(cmd.args, tokens.slice(1));
      if (!parsed.ok) {
        return message.reply("✅ Reloaded, but bad args for `" + cmdName + "`: " + parsed.error);
      }

      await cmd.execute({ message, args: parsed.args, client, config, isAdmin });
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to reload:\n```js\n" + err.message + "\n```");
    }
  }
};

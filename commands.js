const fs = require("fs");
const path = require("path");

/** @type {Record<string, any>} */
const commands = {};

function loadCommands(dir, category = null) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath, file);
    } else if (file.endsWith(".js") && !file.startsWith("_")) {
      try {
        const cmd = require(fullPath);
        const name = path.basename(file, ".js").toLowerCase();

        if (!cmd.category && category) {
          cmd.category = category;
        }
        cmd.adminOnly = cmd?.category === "admin";

        cmd._primaryName = name;
        commands[name] = cmd;

        const allAliases = new Set();

        if (cmd.aliases && Array.isArray(cmd.aliases)) {
          cmd.aliases.forEach(a => allAliases.add(a.toLowerCase()));
        }

        const itemsToProcess = [name, ...Array.from(allAliases)];

        itemsToProcess.forEach(item => {
          const stripped = item.replace(/-/g, "");
          if (stripped !== item && stripped.length > 0) {
            allAliases.add(stripped);
          }
        });

        allAliases.forEach(alias => {
          if (!commands[alias]) {
            commands[alias] = { ...cmd, _aliasOf: name };
          }
        });

        cmd.aliases = Array.from(allAliases).sort();
      } catch (e) {
        console.error(e);
      }
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

module.exports = commands;

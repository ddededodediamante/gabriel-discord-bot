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

        if (cmd.aliases && Array.isArray(cmd.aliases)) {
          const allAliases = new Set(cmd.aliases);
          const variants = [name, ...cmd.aliases];
          variants.forEach(alias => {
            const stripped = alias.replace(/-/g, "");
            if (stripped !== alias) {
              allAliases.add(stripped);
            }
          });

          allAliases.forEach(i => {
            commands[i] = { ...cmd, _aliasOf: name };
          });
          cmd.aliases = Array.from(allAliases);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

module.exports = commands;

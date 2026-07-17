const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { Text } = require("../../args.js");

const helpPages = new Map();

function buildEmbed(index, pages) {
  const embed = new EmbedBuilder().setTitle("Commands").setColor("Yellow");
  const groups = {};
  for (const e of pages[index]) {
    if (!groups[e.category]) groups[e.category] = [];
    groups[e.category].push(e.text);
  }
  for (const [cat, texts] of Object.entries(groups)) {
    embed.addFields({ name: cat, value: texts.join("\n") });
  }
  return embed;
}

function buildRow(index, pages, forceDisable = false) {
  const prev = new ButtonBuilder()
    .setEmoji("⬅")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("help_prev");
  const next = new ButtonBuilder()
    .setEmoji("➡")
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("help_next");
  if (forceDisable || index === 0) prev.setDisabled(true);
  if (forceDisable || index === pages.length - 1) next.setDisabled(true);
  return new ActionRowBuilder().addComponents(prev, next);
}

module.exports = {
  args: [new Text({ optional: true })],
  description: "Get the description of a command or a list of commands",
  helpPages,
  buildEmbed,
  buildRow,
  async execute({ message, args }) {
    const commands = require("../../commands.js");
    const query = args[0]?.toLowerCase();

    if (query) {
      const cmd = commands[query];
      if (!cmd) return message.reply("command not found");

      const title = [`Help: ${query}`];
      if (cmd.adminOnly) title.push("👑");
      else if (cmd.hidden) title.push("🤫");
      if (cmd._aliasOf) title.push(`(alias of ${cmd._aliasOf})`);

      const embed = new EmbedBuilder()
        .setTitle(title.join(" "))
        .setColor("Yellow")
        .setDescription(cmd.description || "");

      if (cmd.category) {
        embed.addFields({ name: "Category", value: cmd.category, inline: true });
      }

      if (cmd?.args?.length) {
        const formatted = cmd.args
          .map((arg, i) => `${i + 1}. ${arg.describe()}`)
          .join("\n");
        embed.addFields({ name: "Arguments", value: formatted });
      }

      if (cmd.aliases?.length && !cmd._aliasOf) {
        embed.addFields({ name: "Aliases", value: cmd.aliases.join(", ") });
      }

      return message.reply({ embeds: [embed] });
    }

    const publicCommands = Object.entries(commands).filter(
      ([, cmd]) => cmd.adminOnly !== true && cmd.hidden !== true && !cmd._aliasOf
    );

    const byCategory = new Map();

    for (const [name, cmd] of publicCommands) {
      const cat = cmd.category ?? "misc";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory
        .get(cat)
        .push(`- ${name}${cmd.description ? ": `" + cmd.description + "`" : ""}`);
    }

    const allEntries = [];
    for (const [cat, entries] of [...byCategory.entries()].sort(([a], [b]) =>
      a.localeCompare(b)
    )) {
      entries.sort((a, b) => a.localeCompare(b));
      for (const entry of entries) {
        allEntries.push({ category: cat, text: entry });
      }
    }

    if (allEntries.length === 0) {
      return message.reply("no commands available");
    }

    const pages = [];
    for (let i = 0; i < allEntries.length; i += 10) {
      pages.push(allEntries.slice(i, i + 10));
    }

    const reply = await message.reply({
      embeds: [buildEmbed(0, pages)],
      components: pages.length > 1 ? [buildRow(0, pages)] : []
    });

    if (pages.length > 1) {
      helpPages.set(reply.id, { pages, pageIndex: 0, userId: message.author.id });
    }
  }
};

const { Events, EmbedBuilder } = require("discord.js");
const commands = require("./commands.js");
const { parseCommandArgs, tokenize } = require("./args.js");
const {
  config,
  isAdmin,
  loadFeatures,
  getUserSettings,
  loadUserSettings,
  saveUserSettings
} = require("./databases.js");
const { client } = require("./index.js");
const { helpPages, buildEmbed, buildRow } = require("./commands/utility/help.js");

module.exports = {
  [Events.MessageCreate]: {
    /**
     * @param {import("discord.js").Message} message
     */
    async execute(message) {
      if (message.author.bot) return;

      message.isAdmin = isAdmin(message.author);

      const content = message.content.trim();

      const startsWithPrefix = content.startsWith(config.prefix);
      const isMentioned = message.mentions.users.has(client.user.id);
      const isDirectMention = message.content.includes(`<@${client.user.id}>`);

      if (isMentioned && !startsWithPrefix) {
        if (message.reference) {
          const botMsg = await message.channel.messages
            .fetch(message.reference.messageId)
            .catch(() => null);

          if (botMsg?.author.id === client.user.id && botMsg.content !== "") {
            const allSettings = loadUserSettings();
            if (!allSettings[message.author.id]) {
              allSettings[message.author.id] = { "hide-from-leaderboard": false, "be-hated": false, "no-reply": false, "no-human": false };
              saveUserSettings(allSettings);
              const welcomeEmbed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle("Welcome to Gabriel!")
                .setDescription(
                  "Looks like this is your first time here! You can customize your experience with user settings.\n\n" +
                  "Run `gabriel!settings` to see what's available: hiding from leaderboards, disabling AI replies, and more."
                )
                .setFooter({ text: "This message only shows once." });
              message.author.send({ embeds: [welcomeEmbed] }).catch(() => {});
            }
            const features = loadFeatures();
            const userSettings = getUserSettings(message.author.id);
            if (userSettings["no-reply"] !== true) {
              if (features["smart-ai"]) {
                const askCmd = require("./commands/ai/ask.js");
                const question = message.content
                  .replace(new RegExp(`<@!?${client.user.id}>`), "")
                  .trim();
                await askCmd.execute({
                  message,
                  args: [question],
                  client,
                  config,
                  isAdmin
                });
              } else {
                await message.reply("ok");
              }
            }
          }
          return;
        }

        if (!isDirectMention) return;
        return await message.reply(isAdmin(message.author) ? "hi" : "what do you want");
      }

      if (!startsWithPrefix) return;

      const afterPrefix = content.slice(config.prefix.length).trim();
      if (!afterPrefix) return;

      const firstSpace = afterPrefix.indexOf(" ");
      const cmdName = (
        firstSpace === -1 ? afterPrefix : afterPrefix.slice(0, firstSpace)
      ).toLowerCase();

      const rawArgsText = firstSpace === -1 ? "" : afterPrefix.slice(firstSpace + 1);

      if (!cmdName) return;

      const cmd = commands[cmdName];
      if (!cmd) {
        return message.reply("what does that mean");
      } else if (cmd.adminOnly && !isAdmin(message.author)) {
        return message.reply("no haha");
      }

      let rawTokens = [];
      try {
        rawTokens = rawArgsText ? tokenize(rawArgsText) : [];
      } catch {
        return message.reply("bad quoted string 🤓");
      }

      const parsed = parseCommandArgs(cmd.args, rawTokens);
      if (!parsed.ok) {
        return message.reply(parsed.error);
      }

      if (!cmd.execute)
        return await message.reply(
          "the command's execute function is missing for some reason"
        );

      const allSettings = loadUserSettings();
      if (!allSettings[message.author.id]) {
        allSettings[message.author.id] = { "hide-from-leaderboard": false, "be-hated": false, "no-reply": false, "no-human": false };
        saveUserSettings(allSettings);
        const welcomeEmbed = new EmbedBuilder()
          .setColor("Gold")
          .setTitle("Welcome to Gabriel!")
          .setDescription(
            "Looks like this is your first time here! You can customize your experience with user settings.\n\n" +
            "Run `gabriel!settings` to see what's available: hiding from leaderboards, disabling AI replies, and more."
          )
          .setFooter({ text: "This message only shows once." });
        message.author.send({ embeds: [welcomeEmbed] }).catch(() => {});
      }

      try {
        await cmd.execute({
          message,
          args: parsed.args,
          client,
          config,
          isAdmin
        });
      } catch (err) {
        console.error(err);
        message.reply("error running command:\n```\n" + (err?.message || err) + "\n```");
      }
    }
  },

  [Events.InteractionCreate]: {
    /**
     * @param {import("discord.js").Interaction} interaction
     */
    async execute(interaction) {
      if (!interaction.isButton()) return;
      if (!["help_prev", "help_next"].includes(interaction.customId)) return;

      const data = helpPages.get(interaction.message.id);
      if (!data) return;

      if (interaction.user.id !== data.userId) {
        return interaction.reply({ content: "not your help menu!", ephemeral: true });
      }

      if (interaction.customId === "help_prev" && data.pageIndex > 0) {
        data.pageIndex--;
      } else if (
        interaction.customId === "help_next" &&
        data.pageIndex < data.pages.length - 1
      ) {
        data.pageIndex++;
      } else {
        return;
      }

      await interaction.update({
        embeds: [buildEmbed(data.pageIndex, data.pages)],
        components: [buildRow(data.pageIndex, data.pages)]
      });
    }
  },

  [Events.MessageReactionAdd]: {
    /**
     * @param {import("discord.js").MessageReaction} reaction
     * @param {import("discord.js").User} user
     */
    async execute(reaction, user) {
      if (user.bot || reaction?.message?.channelId !== config.suggestionChannel) return;

      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();

      if (reaction.message.channelId !== config.suggestionChannel) return;

      const message = reaction.message;
      if (!message.embeds.length) return;

      const embed = message.embeds[0];
      if (!embed.title || embed.title !== "New Suggestion") return;

      const userId = embed.footer?.text;
      if (!userId) return;

      let replyText;
      if (reaction.emoji.name === "✅") replyText = "your suggestion was accepted ✅";
      else if (reaction.emoji.name === "❌")
        replyText = "your suggestion was rejected ❌";
      else if (reaction.emoji.name === "🔪") replyText = "your suggestion was KILLED 🔪";

      if (!replyText) return;
      replyText += "\n> " + embed.description;

      try {
        const targetUser = await client.users.fetch(userId);
        await targetUser.send(replyText);
      } catch {
        console.warn(`⚠️ couldn't DM suggestion status to user ${userId}`);
      }
    }
  }
};

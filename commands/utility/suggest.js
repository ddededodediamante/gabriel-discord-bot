const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new Text({ rest: true, max: 1000 })],
  description: "Suggest something to add to the bot",
  async execute({ message, args }) {
    const [suggestion] = args;

    const channel = await client.channels.fetch(
      client.config.suggestionChannel,
    );
    if (!channel) return message.reply("suggestion channel not found");

    const embed = new EmbedBuilder()
      .setTitle("New Suggestion")
      .setDescription(suggestion)
      .setColor("Yellow")
      .setAuthor({
        name: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setFooter({ text: message.author.id });

    const msg = await channel.send({ embeds: [embed] });

    await message.reply(
      "ok i sent the suggestion (you will be told in DMs the status of your suggestion)",
    );

    await msg.react("✅");
    await msg.react("❌");
    await msg.react("🔪");
  },
};

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { User } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new User({ optional: true })],
  aliases: ["pfp", "profile-picture"],
  description: "Get a user's avatar",
  async execute({ message, args }) {
    const [userId] = args;
    const user = await client.users.fetch(userId || message.author.id);

    message.reply({
      content: user.displayAvatarURL({ size: 1024, extension: "png" }),
      allowedMentions: { parse: [] }
    });
  }
};

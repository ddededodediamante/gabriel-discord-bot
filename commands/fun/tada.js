const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  description: "Send soo many tada emojis",
  execute({ message }) {
    const amount = Math.floor(Math.random() * 4) + 2;
    message.reply("🎉".repeat(amount));
  },
};

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  description: "Replies with pong",
  execute({ message }) {
    message.reply(`pong\nmy ping is like \`${client.ws.ping}ms\``);
  },
};

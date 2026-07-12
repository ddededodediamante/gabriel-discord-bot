const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new Num({ whole: true, min: 1, default: 6 })],
  description: "Roll a random number",
  execute({ message, args }) {
    const [sides] = args;
    const result = Math.floor(Math.random() * sides) + 1;
    message.reply(`rolled ${result} (1-${sides})`);
  },
};

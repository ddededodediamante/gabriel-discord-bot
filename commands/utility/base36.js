const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { random } = require("../../utils.js");

module.exports = {
  args: [],
  description: "Get a random number in base 36",
  execute({ message, args }) {
    message.reply({
      content: random(1, Number.MAX_SAFE_INTEGER).toString(36),
      allowedMentions: { parse: [] }
    });
  }
};

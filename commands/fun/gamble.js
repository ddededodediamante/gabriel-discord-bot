const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { random } = require("../../utils.js");

module.exports = {
  args: [],
  description: "Gamble everything",
  execute({ message, args }) {
    message.reply({
      content: random(1, 2) < 2 ? "ok you lost everything" : "ok you won nothing",
      allowedMentions: { parse: [] }
    });
  }
};

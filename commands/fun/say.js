const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new Text({ rest: true, max: 2000 })],
  description: "Make the bot say something",
  execute({ message, args }) {
    const [text] = args;
    if (text.startsWith("mc;")) return message.reply("nah");
    if (text.includes("@everyone") || text.includes("@here"))
      message.react("😂");
    message.reply({
      content: text,
      allowedMentions: { parse: [] },
    });
  },
};

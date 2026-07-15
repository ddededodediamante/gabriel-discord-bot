const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

function fnv1a(str) {
  let hash = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

module.exports = {
  args: [new Text({ rest: true })],
  description: "Turns text into a number",
  execute({ message, args }) {
    message.reply({
      content: fnv1a(String(args[0]).toLowerCase()).toString(),
      allowedMentions: { parse: [] }
    });
  }
};

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { getUserSettings } = require("../../databases.js");

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
  description: "Rates stuff based on something idk",
  execute({ message, args }) {
    const [thing] = args;
    const thingy = String(thing).toLowerCase();
    const rating = fnv1a(thingy) % 11;

    const settings = getUserSettings(message.author.id);
    if (settings["be-hated"] === true) {
      if (
        thingy.includes(message.author.username) ||
        thingy === message.member.nickname ||
        message.mentions.has(message.author.id)
      ) {
        return message.reply(`negative ${5 + rating}!!! i hate you!!!!`);
      }
    }

    message.reply(`i rate that a ${rating}/10`);
  }
};

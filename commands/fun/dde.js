const { EmbedBuilder, AttachmentBuilder, inlineCode } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

const { generateTokens, stringifyOutput } = require("C:/Projects/ddeBot/model.js");
const { lookup } = require("C:/Projects/ddeBot/wordfreq.js");
const { hasBadWords } = require("../../utils.js");

module.exports = {
  args: [new Text()],
  description: "Talk to the ddededodediamante markov",
  aliases: ["ddededodediamante", "dde-ask", "dde-ai", "dde-markov"],
  execute({ message, args }) {
    const [thing] = args;
    let thingy = String(thing).toLowerCase().split(" ")[0].trim();

    if (thingy.startsWith("amount=")) {
      thingy = thingy.slice(7);
      const result = lookup(thingy);

      return message.reply({
        content:
          result > 0
            ? `${inlineCode(thingy)} was said ${result} time(s) ${result === 67 ? "😂🤣LOL😂🤣🤣🤣HAHA😂" : ""}`.trim()
            : `${inlineCode(thingy)} was never said`.trim(),
        allowedMentions: { parse: [] }
      });
    }

    const finalContent = stringifyOutput(generateTokens(Infinity, thingy));
    if (hasBadWords(finalContent))
      return message.reply(
        `😂 there was evil words in the message\n-# and it was ${message.author.toString()}'s fault`
      );
    if (finalContent === thingy) return message.reply(`😂 no data haha`);

    message.reply({
      content:
        finalContent.length > 2000
          ? finalContent.substring(0, 1997) + "..."
          : finalContent,
      allowedMentions: {
        users: ["1344543448719429673"],
        roles: [],
        repliedUser: false
      }
    });
  }
};

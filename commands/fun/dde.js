const { EmbedBuilder, AttachmentBuilder, inlineCode } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

const {
  generateTokens,
  stringifyOutput,
  lookup,
  getPossibleTokens
} = require("C:/Projects/ddeBot/index.js");
const { hasBadWords } = require("../../utils.js");

module.exports = {
  args: [new Text()],
  description: "Talk to the ddededodediamante markov",
  extDescription:
    "Use the ddededodediamante markov and complete the sentence. Only the first word is used.\nUse `amount=` at the start of your word to check how many times it has been sent.\nUse `tokens=` to see all possible combinations of that word.",
  aliases: ["ddededodediamante", "dde-ask", "dde-ai", "dde-markov"],
  execute({ message, args }) {
    const [thing] = args;
    let thingy = String(thing)
      .toLowerCase()
      .split(" ")[0]
      .replaceAll("<!end>", "")
      .trim();

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
    } else if (thingy.startsWith("tokens=")) {
      thingy = thingy.slice(7);
      if (thingy.length > 200) return message.reply("too big");

      const result = getPossibleTokens(thingy);
      if (result.length === 0)
        return message.reply(`${inlineCode(thingy)} was never said`.trim());

      const embed = new EmbedBuilder()
        .setTitle(`Tokens for ${inlineCode(thingy)}`)
        .setColor("Yellow")
        .setDescription(`there are ${result.length} possible tokens for this word`)
        .addFields({
          name: `Tokens ${result.length > 10 ? "(first 10)" : ""}`,
          value: result
            .filter(i => i.length < 100 && !hasBadWords(i))
            .map(i => inlineCode(i.trim()))
            .slice(0, 10)
            .join(", ")
        });

      return message.reply({
        embeds: [embed],
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

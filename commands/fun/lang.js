const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const path = require("path");

const tokenizePath = "C:/Projects/langlanglangsahur/src/tokenizer.js";
const parsePath = "C:/Projects/langlanglangsahur/src/parser.js";

delete require.cache[require.resolve(tokenizePath)];
delete require.cache[require.resolve(parsePath)];
const { default: tokenize } = require(tokenizePath);
const { default: parse } = require(parsePath);

module.exports = {
  args: [new Text({ rest: true, max: 1670 })],
  description: "Parse the Newest programming language made by ddededodediamante",
  async execute({ message, args }) {
    const [code] = args;

    try {
      if (typeof tokenize === "function" && typeof parse === "function") {
        const tokens = tokenize(code);
        const parsed = parse(tokens);
        await message.reply(
          `${tokens.length} token(s)\n` + "```\n" + JSON.stringify(parsed) + "\n```"
        );
      } else {
        console.error("Couldn't import lang from langlanglangsahur/index.js");
        await message.reply("can you tell ddededodediamante that his lang broke");
      }
    } catch (err) {
      await message.reply("```\n" + String(err) + "\n```");
    }
  }
};

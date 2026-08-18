const { codeBlock, inlineCode } = require("discord.js");
const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const { pathToFileURL } = require("url");

const tokenizePath = "C:/Projects/langlanglangsahur/src/tokenizer.js";
const parsePath = "C:/Projects/langlanglangsahur/src/parser.js";
const evaluatorPath = "C:/Projects/langlanglangsahur/src/evaluator.js";

module.exports = {
  args: [new Text({ rest: true, max: 1670 })],
  description: "Parse the Newest programming language made by ddededodediamante",
  async execute({ message, args }) {
    const [code] = args;

    try {
      const cacheBust = `?t=${Date.now()}`;
      const { default: tokenize } = await import(
        pathToFileURL(tokenizePath).href + cacheBust
      );
      const { default: parse } = await import(
        pathToFileURL(parsePath).href + cacheBust
      );
      const { default: evaluator } = await import(
        pathToFileURL(evaluatorPath).href + cacheBust
      );

      if (typeof tokenize === "function" && typeof parse === "function") {
        const tokens = tokenize(code);
        const parsed = parse(tokens);
        const result = evaluator(parsed);

        const vars = codeBlock("json", JSON.stringify(result.variables));

        await message.reply(
          `${tokens.length} token(s)\nlast value: ${inlineCode(result.lastValue)}\nvariables:\n${vars}`
        );
      } else {
        console.error("couldn't import langlanglangsahur");
        await message.reply("can you tell ddededodediamante that his lang broke");
      }
    } catch (err) {
      await message.reply("```\n" + String(err) + "\n```");
    }
  }
};

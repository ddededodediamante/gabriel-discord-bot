const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const { config } = require("../../utils.js");

function wrap(text) {
  return "```\n" + text + "\n```";
}

module.exports = {
  args: [new Text({ rest: true })],
  description: "Secret evil eval",
  extDescription: "Evaluates JavaScript code and returns the result.",
  async execute({ message, args }) {
    if (!message?.author?.hasBotEvalPerms)
      return message.reply("you're missing the bot eval permissions");

    try {
      const result = eval(args[0] || "");
      message.reply(wrap(result));
    } catch (err) {
      message.reply(wrap(err.message ?? err));
    }
  }
};

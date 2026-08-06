const { client } = require("../../index.js");

module.exports = {
  description: "KILLS the bot",
  extDescription: "Kills the bot, it will need to be restarted manually.",
  async execute({ message }) {
    await message.reply("☹");
    client.destroy();
  },
};

const { client } = require("../../index.js");

module.exports = {
  description: "KILLS the bot",
  async execute({ message }) {
    await message.reply("☹");
    client.destroy();
  },
};

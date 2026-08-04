const { Text, Num, Bool, User, Union } = require("../../args.js");
module.exports = {
  args: [],
  description: "sends a random cat picture",
  async execute({ message, args }) {
    try {
      const response = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await response.json();
      const catUrl = data[0].url;

      await message.reply({ content: catUrl, allowedMentions: { parse: [] } });
    } catch (err) {
      await message.reply({ content: "rip cats failed to load", allowedMentions: { parse: [] } });
    }
  }
};
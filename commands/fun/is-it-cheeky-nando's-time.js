const { AttachmentBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  args: null,
  description: "Is it time for a cheeky nando's?",
  async execute({ message }) {
    try {
      await message.react("🛎");
    } catch(_) { /* empty */ }
    await message.reply("it's always time for a cheeky nandos innit mate stop chatting rubbish and just go get some peri peri wings already");
  }
};

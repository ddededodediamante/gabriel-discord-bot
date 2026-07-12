const { AttachmentBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  args: [],
  aliases: ["mangomustard"],
  description: "HAHAHA 67 😂🤣",
  execute({ message, args }) {
    const attachment = new AttachmentBuilder(path.join(__dirname, "../../files/67.jpg"), {
      name: `67.jpg`
    });
    message.reply({
      files: [attachment]
    });
  }
};

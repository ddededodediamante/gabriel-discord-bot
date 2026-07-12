const { User } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new User({ optional: true })],
  description: "Humble someone",
  async execute({ message, args }) {
    const [userId] = args;

    let targetId;

    if (userId) {
      targetId = userId;
    } else if (message.reference) {
      const repliedMsg = await message.channel.messages.fetch(
        message.reference.messageId
      );
      targetId = repliedMsg.author.id;
    } else {
      targetId = message.author.id;
    }

    const target = await client.users.fetch(targetId);

    if (target.id === client.user.id) {
      return message.reply("shut up");
    }

    message.reply({
      content: `yo ${target.toString()} ur so stinky that not even skibidi toilet wants to smell you`,
      allowedMentions: { users: [target.id] }
    });
  }
};

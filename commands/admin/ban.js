const { User } = require("../../args.js");
const { client } = require("../../index.js");

module.exports = {
  args: [new User()],
  description: "Bans bad guy",
  async execute({ message, args }) {
    const [userId] = args;
    const user = await client.users.fetch(userId);
    await message.reply({
      content: `${user.toString()} is now banned forever permanently 😂 (||Joe king||)`,
      allowedMentions: { parse: [] },
    });
  },
};

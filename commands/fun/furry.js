const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { User } = require("../../args.js");
const { client } = require("../../index.js");

const furries = [
  "860531746294726736",
  "1203782668928421949",
  "269281036687507456",
  "378009279023546379",
  "1376566271558160504"
];

const people = {
  "790782926785609728": "no, thats ian 🐱",
  "1076297026595201094": "no, thats josh 🧊",
  "462098932571308033": "no, thats jeremy 🧑",
  "694587798598058004": "no, thats ddededodediamante 💎"
};

module.exports = {
  args: [new User()],
  alias: ["is-furry"],
  description: "Detects if a user is a furry with incredible accuracy",
  async execute({ message, args }) {
    const [userId] = args;
    const user = await client.users.fetch(userId);

    const has = s => user.username.toLowerCase().includes(s);

    if (furries.includes(userId)) message.reply("yep they're definitely a furry");
    else if (people[userId]) message.reply(people[userId]);
    else if (has("furry")) message.reply('their username says "furry" so probably');
    else if (has("fur")) message.reply('their username says "fur" so probably');
    else if (has("protogen")) message.reply('their username says "protogen" so probably');
    else if (has("proto")) message.reply('their username says "proto" so probably');
    else if (userId === client.user.id) message.reply(":3");
    else message.reply("i dont know");
  }
};

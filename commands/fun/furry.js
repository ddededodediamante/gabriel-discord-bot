const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { User } = require("../../args.js");
const { client } = require("../../index.js");

const furries = [
  "860531746294726736",
  "1203782668928421949",
  "269281036687507456",
  "378009279023546379",
  "1376566271558160504",
  "1344543448719429673",
  "1268745303981555796"
];

const people = {
  "790782926785609728": "no, thats ian 🐱",
  "1076297026595201094": "no, thats josh 🧊",
  "462098932571308033": "no, thats jeremy 🧑",
  "694587798598058004": "no, thats ddededodediamante 💎"
};

const catEarsSkuIds = [
  "1212569433839636530",
  "1498446571140939860",
  "1341506443869683712",
  "1341506443882266624",
  "1341506443878072320",
  "1341506443865489408"
];

module.exports = {
  args: [new User()],
  aliases: ["is-furry", "furry-detector", "furry-detect", "detect-furry"],
  description: "Detects if a user is a furry with incredible accuracy",
  async execute({ message, args }) {
    const [userId] = args;
    const user = await client.users.fetch(userId);

    const has = s => user.username.toLowerCase().includes(s);

    if (furries.includes(userId)) message.reply("yep they're definitely a furry");
    else if (people[userId]) message.reply(people[userId]);
    else if (
      user?.avatarDecorationData?.skuId &&
      catEarsSkuIds.includes(user.avatarDecorationData.skuId)
    )
      message.reply("they have cat ears so probably");
    else if (has("furry")) message.reply('their username says "furry" so probably');
    else if (has("fur")) message.reply('their username says "fur" so probably');
    else if (has("protogen")) message.reply('their username says "protogen" so probably');
    else if (has("proto")) message.reply('their username says "proto" so probably');
    else if (userId === client.user.id) message.reply(":3");
    else message.reply("i dont know");
  }
};

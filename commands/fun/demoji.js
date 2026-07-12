const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

const items = JSON.parse(
  '["angry","baffled","bagsundereyes","bandage","beginner","blush","bubblespeech","bubblethought","cat","catface","catsad","checkmark","confused","cowboy","cry","derpy","displeased","dog","dogsad","drool","eagle","fear","fireextinguisher","fishblue","fishred","flagblue","flagred","flagscrossed","flagwhite","frown","glasses","grimacing","grin","grinning","grinningclosedeyes","handopen","handpointingdown","handpointingleft","handpointingright","handpointingup","handraisedback","handraisedfront","handv","handvulcan","headshaking","headshakinghorizontally","headshakingvertically","heartblue","heartbroken","hearteyes","heartgreen","heartgrinning","heartorange","heartred","heartyellow","impfrown","impsmile","innocent","joy","kissing","kissingheart","laptop","lookingaway","mad","markbang","markbangdouble","markquestion","markquestionbang","markquestiondouble","melting","moneymouth","monocle","moonfacefirstquarter","moonfacelastquarter","nauseated","nervous","neutral","neutraldiagonalmouth","noentry","nolittering","nopedestrians","nophones","nopotablewater","pensive","personbald","personbaldfacepalming","personbaldsad","personbaldshocked","personman","personmanfacepalming","personmanredhair","personmansad","personmanshocked","personmanwhitehair","personmanyellowhair","personwoman","personwomanfacepalming","personwomanredhair","personwomansad","personwomanshocked","personwomanwhitehair","personwomanyellowhair","pigeon","pleading","receipt","shocked","sick","sleeping","smile","smileeyebrows","smileupsidedown","smirk","sobbing","star","starshooting","sunglasses","symbolsovermouth","theatermasks","thinking","tongueface","tonguefaceclosedeyes","trapezoid","turtle","vanishing","vomitingface","worried","x","yummy","zany"]'
);
const url =
  "https://cdn.jsdelivr.net/npm/demojis@1.1.3/dist/images/256/";

module.exports = {
  args: [new Text({ optional: true })],
  description: "Gets a random emoji from Demoji",
  async execute({ message, args }) {
    let item;

    if (args[0] && args[0].trim() != "") {
      if (items.includes(args[0])) {
        item = args[0];
      } else {
        return message.reply("not a valid emoji");
      }
    } else {
      item = items[Math.floor(Math.random() * items.length)];
    }

    const attachment = new AttachmentBuilder(`${url}${item}.png`, {
      name: `${item}.png`,
    });
    message.reply({
      content: `i'm ${item}!`,
      files: [attachment],
    });
  },
};

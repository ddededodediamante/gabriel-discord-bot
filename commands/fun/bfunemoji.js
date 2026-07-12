const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

const items = JSON.parse(
  '["alien","aliengreen","aliengreenhappy","aliengreensad","aliengreenscream","alienhappy","aliensad","alienscream","allsmile","angel","angry","annoyed","arrowdown","arrowleft","arrowright","arrowup","astonishment","baby","bad","badtaste","banknote","banknoteeuro","banknotepound","banknotestack","banknotestackeuro","banknotestackpound","banknotestackyen","banknoteyen","barf","baseball","bear","bee","bell","bellno","bento","bigfrown","bigsad","bleh","blush","boy","brushoff","bubbles","bummed","burger","cactus","cake","car","casualjoy","cat","catangry","cathappy","cathearteyes","cathuh","catlike","catlikesilly","catnotalk","catsad","catscream","catsilly","catstars","chart","chartlowering","chartrising","chew","chick","chickblue","chill","clap","cleaneyes","cloud","clover","cloverfour","clown","cluelesssmile","coin","cold","confused","confusedthinking","congrats","controller","cool","correcting","cowboy","crying","dango","dead","devil","diamond","disappointed","dizzy","dog","dogangry","dogconfused","doghappy","doghearteyes","dognotalk","dogsad","dogscream","dogsilly","dogstars","dotted","drooling","droplet","dumb","earth","easilyhappy","eating","eightball","eraserpink","eraserwhite","eraserwhiteblue","excited","exclamation","explode","expressivedead","extremeexcitement","eyeing","eyesofmoney","faceinclouds","fire","flagblack","flagcheck","flagred","flagwhite","flex","flower","fork","fox","fries","frog","furious","ghost","girl","gladlyshocked","glisteningeyes","good","goofyface","grimacing","grin","hammer","hammerandwrench","handovermouth","handshake","happy","heart","hearteyes","holdingbacktears","hundred","hurt","idk","imp","investigate","jellyfish","laughing","lock","lostinconfusion","lying","mad","magnify","man","mask","meh","melting","mindblown","moai","money","moneybag","moon","mouse","mushroom","nerd","nervous","nodhorizontal","nodvertical","noentry","notalk","notified","o","ocean","oden","openhand","outofarguments","palm","panda","paper","party","peace","pencil","pencilonpaper","penguin","penguinhappy","penguinsad","penguinscared","pensive","personrunning","personwalking","phone","pick","pig","pizza","pointatyou","pointdown","pointleft","pointright","pointup","polarbear","pray","present","pumpkin","pumpkinjackolantern","pumpkinmad","pumpkinmeh","pumpkinsad","pumpkinuncarved","pureconfusion","pushaside","puzzle","question","rainbow","rat","relief","riceball","robot","rollingeyes","ruby","sad","salute","saw","scared","screwdriver","shakingface","shhh","shocked","shovel","sick","sigh","silly","singing","skull","skullcowboy","sleeping","smallcry","smallpassiveaggressive","smallsmile","smile","snoring","sobbing","sound","soundloud","soundmuted","soundnone","speaking","spoon","stars","steam","stop","sun","sunglasses","surprised","sushi","suspicious","sweating","tada","tasty","tear","tears","teeth","tennisball","terrified","thermometer","thinking","thumbsdown","thumbsup","tissue","toilet","toothbrush","trafficlight","tree","treechristmas","unbelievable","uncertainty","unlocked","upsidedownsmile","uwu","v","visibleconfusion","vulcan","warning","wave","woman","worried","wrench","x","yawn","zipper"]'
);
const url = "https://library.penguinmod.com/files/emojis/";

module.exports = {
  args: [new Text({ optional: true })],
  aliases: ["pmemoji"],
  description: "Gets a random emoji from BFunEmoji",
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
      name: `${item}.png`
    });
    message.reply({
      content: `i'm ${item}!`,
      files: [attachment]
    });
  }
};

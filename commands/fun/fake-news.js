const { AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { random } = require("../../utils.js");
const path = require("path");

const randomFrom = arr => arr[random(0, arr.length - 1)];

module.exports = {
  args: [],
  description: "Create evil fake news",
  execute({ message, args }) {
    const people = [
      "Toby Fox", "ddededodediamante", "Jeremy", "Albert Einstein", "Taylor Swift", "Tom Hanks",
      "John", "Triple T", 'Dwayne "The Rock" Johnson', "Michael Jackson", "Emma Watson", "Skibidi Toilet",
      "Lionel Messi", "GarboMuffin", "PenguinBot", "Cord Lat", "Rob", "Gabriel", "Michael Jordan", "Embin",
      "Shrek", "Gordon Ramsay", "The Impostor", "SpongeBob", "Goku", "Your Mom", "Elon Musk", "Mario",
      "Sans Undertale", "Nobody", "AI", "The Scratch Team", "Freshpenguin112", "Ianyourgod", "Joe",
      "DogeisCut", "The Earth", "Anonymous", "Claude", "Trigonometry", "Jeremy Stream Bot"
    ];
    const funnyNames = [
      "I Pooped My Pants", "Hello, Neighbor", "I'm Stuck On Argentina", "Tuff Ahh Name",
      "I'm Not Funny", "What Am I?", "Fart Noises", "Pink Noise", "Low Flush, High Energy",
      "Oops! All Beans", "Tax Evasion Simulator", "My Dog Ate My Homework", "Me = Mc SCARED",
      "24 Hours in a Trash Can", "Plague Inc.", `${randomFrom(people)} Simulator`, message.author.username,
      "Total Drama Island", "Battle For Nightmare Island", "I Hear Talking Everywhere", "How 2 Type"
    ];
    const happening = [
      "has died today", "has exploded", `has made a new song called "${randomFrom(funnyNames)}"`,
      `will collaborate with ${randomFrom(people)}`, `is now dating ${randomFrom(people)}`,
      "has been added to Fortnite", `is working on a new game called "${randomFrom(funnyNames)}"`,
      "has played Deltarune chapter 5", "is taking a doo doo", `allegedly hates ${randomFrom(people)}`,
      "is not dead", "won't go to school today", "is kinda homeless", "has turned evil",
      "has tried out Rarry", "is sad", `can solo ${randomFrom(people)}`, "is starting a cult",
      "has been banned from the local library", "has accidentally become the president",
      "is livestreaming their nap", "is doing a muckbang on the PenguinMod servers",
      "has bought 50 apples", "won't be on Discord anymore", `named a dog "${randomFrom(funnyNames)}"`,
      `visited their neighbor ${randomFrom(people)}`, "is pregnant", "is going to the moon",
      "drew a circle", "ate an entire pizza", `killed ${randomFrom(people)}`, "left the server",
      `has a crush on ${randomFrom(people)}`, "allegedly loves the 67 meme", "hit the juckport",
      `has changed their middle name to "${randomFrom(funnyNames)}"`
    ];
    const reason = [
      "poverty", "their charisma", "how long they've spent underwater", "the world cup",
      `${randomFrom(people)}'s actions`, `what ${randomFrom(people)} did to ${randomFrom(people)}`,
      "their homelessness", "furry roleplay", "Roblox", "Microsoft", "what AI did to the world",
      "a mortal lack of water", "loneliness", "something. I'm not sure", "the PenguinMod port",
      "the Hantavirus", "their stink aura", "a massive nuclear bomb", "videogames", "drama",
      "just because they felt like it", "too much free time", "the butterfly effect", "poop",
      "shitting", `their DMs with ${randomFrom(people)}`, "their hatred", "good night kisses",
      `a song called "${randomFrom(funnyNames)}" that inspired them`, "luck", "bad luck",
      "what they saw behind them", "their affection", "their lack of intelligence", "the news",
      "the haunting realization that they have spent their entire life waiting for a moment that already happened and they were too busy looking at their phone to notice",
      "their mama. Mama I'm chasing a ghost", `the fact that ${randomFrom(people)} ${randomFrom(happening)}`,
      "the Thorn Ring", "$5 dollars", `a fake love letter created by ${randomFrom(people)}`
    ];

    if (random(1, 100) === 100) {
      return message.reply({
        files: [new AttachmentBuilder(path.join(__dirname, "../../files/breaking-news.jfif"))]
      });
    }

    message.reply({
      content: `${randomFrom(people)} ${randomFrom(happening)} because of ${randomFrom(reason)}.`,
      allowedMentions: { parse: [], repliedUser: true }
    });
  }
};

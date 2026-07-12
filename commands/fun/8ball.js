const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");

const responses = {
  no: [
    "no",
    "nuh uh",
    "negative",
    "NO!!!!!!",
    "nah",
    "nope!",
    "❌",
    "that's obviously false",
    "false",
    "i dont think so",
  ],
  yes: [
    "yes",
    "yuh uh",
    "positive",
    "YES!!!!!!",
    "yup",
    "✅",
    "that's obviously true",
    "dude why did you even ask me this, the answer is yes",
    "true",
    "uhh yeah",
    "probably",
  ],
  idk: [
    "idk",
    "why are you asking me this",
    "i dont want to answer that",
    "too lazy to say anything",
    "it might or might not be true",
    "i'm playing polytoria leave me alone",
    "🤷",
    "asmopifdhfgfdmf",
    "uhh uhm uhhh",
    "50%",
  ],
};
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  args: null,
  aliases: ["predict"],
  description: "It will predict everything you ask it",
  execute({ message }) {
    const category = pick(["yes", "no", "idk"]);
    const text = pick(responses[category]);

    const target = message.reference
      ? message.channel.messages.cache.get(message.reference.messageId)
      : message;

    (target || message).reply({
      content: text,
      allowedMentions: { parse: [] },
    });
  },
};

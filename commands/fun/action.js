const { AttachmentBuilder } = require("discord.js");
const { Text, User } = require("../../args.js");
const path = require("path");
const fs = require("fs");
const { client } = require("../../index.js");

const actions = {
  kill: {
    user: "%1 killed %2",
    self: "no"
  },
  hug: {
    user: "%1 hugged %2",
    self: "%1 hugged themselves"
  },
  cry: {
    user: "%1 is crying with %2",
    self: "%1 is crying"
  },
  kiss: {
    user: "%1 kissed %2",
    self: "%1 kissed themselves"
  },
  hat: {
    user: "no",
    self: "%1 is wearing a hat. So nice!"
  },
  stare: {
    user: "%1 is staring at %2",
    self: "%1 is staring at themselves"
  }
};

module.exports = {
  args: [new Text({ optional: true }), new User({ optional: true })],
  description: "Do an action to another user or do it by yourself",
  async execute({ message, args }) {
    const [actionName, targetID] = args;

    if (!actionName || actionName === "list") {
      const lines = Object.keys(actions).map(key => {
        const caps = [];
        if (actions[key].self !== "no") caps.push("self");
        if (actions[key].user !== "no") caps.push("user");
        return `- ${key} (${caps.join(", ")})`;
      });

      return message.reply(`current actions:\n${lines.join("\n")}`);
    }

    const action = actions[actionName];
    if (!action) {
      return message.reply(
        `what kind of action is \`${actionName}\`? use one of these: ${Object.keys(actions).join(", ")}`
      );
    }

    const didMentionSelf = targetID === message.author.id;
    const isSelf = !targetID || didMentionSelf;

    if (isSelf) {
      if (action.self === "no") return message.reply("you can't do that to yourself");
    } else {
      if (action.user === "no") return message.reply("only lonely people can do that");
    }

    let targetUser = null;
    if (!isSelf && targetID) {
      try {
        targetUser = await client.users.fetch(targetID);
      } catch (err) {
        return message.reply("Could not find that user.");
      }
    }

    let text = "";
    let imageSuffix = "";

    if (isSelf) {
      text = action.self.replace("%1", message.author.toString());
      imageSuffix = "self";

      if (didMentionSelf) {
        text += "\n-# you don't need to mention yourself, I know who you are";
      }
    } else {
      text = action.user
        .replace("%1", message.author.toString())
        .replace("%2", targetUser.toString());
      imageSuffix = "user";
    }

    const fileName = `${actionName}-${imageSuffix}.png`;
    const imagePath = path.join(__dirname, "../../files/actions/", fileName);

    const replyData = {
      content: text,
      allowedMentions: { parse: [] }
    };

    if (fs.existsSync(imagePath)) {
      replyData.files = [new AttachmentBuilder(imagePath)];
    }

    return message.reply(replyData);
  }
};

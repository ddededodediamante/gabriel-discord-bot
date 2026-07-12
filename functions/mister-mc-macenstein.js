const { PermissionFlagsBits } = require("discord.js");
const { client } = require("..");

let isMisterMcMacensteinAlive = true;
const TARGET_BOT_ID = "993334503290454030";
const CHANNEL_ID = "1519457014772924477";
const WORD_CHAIN_ID = "1518420889178341558";

async function waitForReply(channel, timeoutMs) {
  return new Promise(resolve => {
    const filter = msg => msg.author.id === TARGET_BOT_ID;

    const collector = channel.createMessageCollector({ filter, max: 1, time: timeoutMs });

    collector.on("collect", () => resolve(true));
    collector.on("end", collected => {
      if (collected.size === 0) resolve(false);
    });
  });
}

async function sendMessage() {
  const channel = client.channels.cache.get(CHANNEL_ID);
  const wordChain = client.channels.cache.get(WORD_CHAIN_ID);

  if (!channel || !wordChain) return;

  await channel.send(":3");
  const gotReply = await waitForReply(channel, 15_000);

  const everyoneId = wordChain.guild.id;

  try {
    if (!gotReply) {
      await wordChain.permissionOverwrites.edit(everyoneId, {
        [PermissionFlagsBits.SendMessages]: false
      });
    } else {
      await wordChain.permissionOverwrites.edit(everyoneId, {
        [PermissionFlagsBits.SendMessages]: null
      });
    }
  } catch (error) {
    console.error("Failed to update channel permissions:", error);
  }
}

let interval;

function startInterval() {
  if (interval) clearInterval(interval);
  sendMessage();
  interval = setInterval(sendMessage, 5 * 60_000);
  return interval;
}

module.exports = {
  isMisterMcMacensteinAlive,
  startInterval,
  get interval() { return interval; }
};

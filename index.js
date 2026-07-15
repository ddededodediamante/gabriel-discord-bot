const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const { config, isAdmin } = require("./databases.js");

const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: Object.values(Partials)
});
client.config = config;

const registeredEventListeners = [];

function reloadEvents() {
  const eventsPath = require.resolve("./events.js");

  if (require.cache[eventsPath]) {
    delete require.cache[eventsPath];
  }

  for (const { event, listener } of registeredEventListeners) {
    client.removeListener(event, listener);
  }
  registeredEventListeners.length = 0;

  const events = require("./events.js");

  for (const [eventName, def] of Object.entries(events)) {
    const listener = async (...args) => {
      try {
        await def.execute(...args, { client, config, isAdmin });
      } catch (err) {
        console.error(`Error in event "${eventName}":`, err);
      }
    };

    if (def.once) {
      client.once(eventName, listener);
    } else {
      client.on(eventName, listener);
    }

    registeredEventListeners.push({ event: eventName, listener });
  }
}

client.getEmoji = (emojiName, fallback = "❓") => {
  let appEmojis = client.application.emojis;
  return appEmojis.cache.find(emoji => emoji.name === emojiName) || fallback;
};

client.once(Events.ClientReady, async () => {
  console.log(`✅ logged in as ${client.user.tag}`);

  reloadEvents();

  // very hardcoded, you probably don't need this
  if (client.user.id !== "1455453433565020306") {
    const { startInterval } = require("./functions/mister-mc-macenstein.js");
    startInterval();
  }

  await client.application.emojis.fetch();
});

client.login(config.token);

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

module.exports = { client, reloadEvents };

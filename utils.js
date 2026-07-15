const { Filter } = require("glin-profanity");

/**
 * @param {import("discord.js").Message | null | undefined} message
 * @returns {Promise<import("discord.js").Attachment[]>}
 */
async function getAttachments(message) {
  if (message.attachments.size > 0) return message.attachments.toJSON();
  if (message.reference) {
    const replied = await message.fetchReference().catch(() => null);
    if (replied?.attachments.size > 0) return replied.attachments.toJSON();
  }
  return [];
}

const filter = new Filter({
  detectLeetspeak: true,
  leetspeakLevel: "aggressive",
  normalizeUnicode: true,
  caseSensitive: false
});

function hasBadWords(string) {
  return filter.isProfane(string);
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.queue = [];
  }
  acquire() {
    return new Promise(resolve => {
      if (this.count < this.max) {
        this.count++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }
  release() {
    if (this.queue.length > 0) {
      this.queue.shift()();
    } else {
      this.count--;
    }
  }
}

const ollamaSemaphore = new Semaphore(2);

module.exports = {
  getAttachments,
  hasBadWords,
  random,
  ollamaSemaphore
};

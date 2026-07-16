const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { getAttachments } = require("../../utils.js");
const https = require("https");
const sharp = require("sharp");

module.exports = {
  args: [],
  aliases: ["compressimg"],
  description: "Compress an image into oblivion",
  async execute({ message }) {
    const attachment = (await getAttachments(message))[0];
    if (!attachment) return message.reply("i need an image");

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/tiff",
      "image/gif"
    ];
    if (!validTypes.some(t => attachment.contentType?.startsWith(t))) {
      return message.reply("that doesn't look like an image");
    }

    if (attachment.size > 7 * 1024 * 1024) {
      return message.reply("image too big (>7MB)");
    }

    const reply = await message.reply("downloading...");

    const inputBuffer = await new Promise((resolve, reject) => {
      https
        .get(attachment.url, res => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download image: Status code ${res.statusCode}`));
            return;
          }
          const chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        })
        .on("error", reject);
    });

    reply.edit("compressing...");

    let pipeline = sharp(inputBuffer);
    let format;

    const metadata = await pipeline.metadata();

    if (metadata.format === "png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
      format = "png";
    } else if (metadata.format === "webp") {
      pipeline = pipeline.webp({ quality: 20, effort: 6 });
      format = "webp";
    } else if (metadata.format === "avif") {
      pipeline = pipeline.avif({ quality: 20, effort: 9 });
      format = "avif";
    } else {
      pipeline = pipeline.jpeg({ quality: 20, mozjpeg: true });
      format = "jpeg";
    }

    const outputBuffer = await pipeline.toBuffer().catch(async err => {
      console.error(err);
      await reply.edit("sharp exploded: " + err.message);
      throw err;
    });

    const sizeBytes = outputBuffer.length;
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

    if (sizeBytes > 25 * 1024 * 1024) {
      await reply.edit("compressed but still too large to send (>25MB), sorry");
    } else {
      const inSizeMB = (attachment.size / 1024 / 1024).toFixed(2);

      let content = `${inSizeMB}MB ➡️ ${sizeMB}MB`;
      if (inSizeMB == sizeMB) content += ` (no change)`;
      if (inSizeMB < sizeMB) content += ` (oh no haha)`;

      await reply.edit({
        content,
        files: [new AttachmentBuilder(outputBuffer, { name: `compressed.${format}` })]
      });
    }
  }
};

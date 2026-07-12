const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Text, Num, Bool, Union } = require("../../args.js");
const { client } = require("../../index.js");
const { getAttachments } = require("../../utils.js");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const https = require("https");

module.exports = {
  args: [new Text({ optional: true, default: "high" })],
  aliases: ["compress"],
  description: "Compress a video into oblivion",
  async execute({ message, args }) {
    const [level] = args;
    const levels = ["AHHH!!!", "highest", "higher", "high", "medium", "low"];
    const levelConfigs = {
      "AHHH!!!": {
        crf: "267",
        scale: "256:-2",
        fps: "4",
        audioBitrate: "12k",
        audioChannels: "1"
      },
      highest: {
        crf: "67",
        scale: "256:-2",
        fps: "8",
        audioBitrate: "24k",
        audioChannels: "1"
      },
      higher: {
        crf: "52",
        scale: "320:-2",
        fps: "12",
        audioBitrate: "32k",
        audioChannels: "1"
      },
      high: {
        crf: "51",
        scale: "320:-2",
        fps: "15",
        audioBitrate: "32k",
        audioChannels: "1"
      },
      medium: {
        crf: "40",
        scale: "480:-2",
        fps: "24",
        audioBitrate: "64k",
        audioChannels: "2"
      },
      low: {
        crf: "28",
        scale: "720:-2",
        fps: "30",
        audioBitrate: "128k",
        audioChannels: "2"
      }
    };
    if (level && !levels.includes(level)) {
      return message.reply(
        "level must be one of the following: " + levels.join(", ") + " (default is high)"
      );
    }

    const attachment = (await getAttachments(message))[0];
    if (!attachment) return message.reply("i need a video");

    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
    if (!validTypes.some(t => attachment.contentType?.startsWith(t))) {
      return message.reply("that doesn't look like a video");
    }

    const reply = await message.reply("downloading...");

    const ext = path.extname(attachment.name) || ".mp4";
    const inputPath = path.join(os.tmpdir(), `gabriel_input_${message.id}${ext}`);
    const outputPath = path.join(os.tmpdir(), `gabriel_output_${message.id}.mp4`);

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(inputPath);
      https.get(attachment.url, res =>
        res.pipe(file).on("finish", resolve).on("error", reject)
      );
    });

    reply.edit("compressing...");

    const cfg = levelConfigs[level ?? "high"];
    await new Promise((resolve, reject) => {
      execFile(
        "ffmpeg",
        [
          "-i",
          inputPath,
          "-vcodec",
          "libx264",
          "-crf",
          cfg.crf,
          "-preset",
          "ultrafast",
          "-vf",
          `scale=${cfg.scale}`,
          "-r",
          cfg.fps,
          "-acodec",
          "aac",
          "-b:a",
          cfg.audioBitrate,
          "-ac",
          cfg.audioChannels,
          "-y",
          outputPath
        ],
        err => {
          if (err) reject(err);
          else resolve();
        }
      );
    }).catch(async err => {
      console.error(err);
      await reply.edit("ffmpeg exploded: " + err.message);
      fs.rmSync(inputPath, { force: true });
      throw err;
    });

    const outStats = fs.statSync(outputPath);
    const sizeMB = (outStats.size / 1024 / 1024).toFixed(2);

    if (outStats.size > 25 * 1024 * 1024) {
      await reply.edit("compressed but still too large to send (>25MB), sorry");
    } else {
      const inSizeMB = (attachment.size / 1024 / 1024).toFixed(2);

      let content = `${inSizeMB}MB ➡️ ${sizeMB}MB`;
      if (inSizeMB == sizeMB) content += ` (no change)`;
      if (inSizeMB < sizeMB) content += ` (oh no haha)`;

      await reply.edit({
        content,
        files: [new AttachmentBuilder(outputPath, { name: "compressed.mp4" })]
      });
    }

    fs.rmSync(inputPath, { force: true });
    fs.rmSync(outputPath, { force: true });
  }
};

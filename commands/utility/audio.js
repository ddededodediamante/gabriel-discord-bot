const { AttachmentBuilder } = require("discord.js");
const { Text } = require("../../args.js");
const fs = require("fs");
const path = require("path");
const os = require("os")
const https = require("https");
const { execFile } = require("child_process");
const { getAttachments } = require("../../utils.js");

function getAtempoFilter(targetSpeed) {
  const filters = [];
  let current = targetSpeed;
  while (current > 2.0) {
    filters.push("atempo=2.0");
    current /= 2.0;
  }
  while (current < 0.5) {
    filters.push("atempo=0.5");
    current /= 0.5;
  }
  if (current !== 1.0) {
    filters.push(`atempo=${current.toFixed(4)}`);
  }
  return filters.join(",");
}

module.exports = {
  args: [new Text({ rest: true, optional: true, default: "" })],
  description:
    "Modify an audio track with some filters (pitch, speed, reverse, muffle, bassboost)",
  async execute({ message, args }) {
    const [rawInput] = args;

    const parts = rawInput ? rawInput.split(/\s+/) : [];
    const flags = {
      pitch: 1.0,
      speed: 1.0,
      reverse: false,
      muffle: false,
      bassboost: false,
      visualize: false
    };

    const flagConfig = [
      { names: ["-pitch", "-p"], key: "pitch", parse: parseFloat },
      { names: ["-speed", "-s"], key: "speed", parse: parseFloat },
      { names: ["-reverse", "-r"], key: "reverse" },
      { names: ["-muffle", "-m"], key: "muffle" },
      { names: ["-bassboost", "-b"], key: "bassboost" },
      { names: ["-visualize", "-v"], key: "visualize" }
    ];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      const config = flagConfig.find(f => f.names.includes(part));
      if (!config) continue;

      if (config.parse) {
        const val = config.parse(parts[i + 1]);
        if (!isNaN(val)) {
          flags[config.key] = val;
          i++;
        }
      } else {
        flags[config.key] = true;
      }
    }

    const audioFilters = [];
    if (flags.pitch !== 1.0 || flags.speed !== 1.0) {
      const p = flags.pitch;
      const s = flags.speed;

      if (p <= 0 || s <= 0) {
        return message.reply("pitch and speed multipliers must be greater than 0");
      }

      if (p !== 1.0) {
        audioFilters.push(`asetrate=44100*${p},aresample=44100`);
        const tempoFactor = s / p;
        const tempoFilter = getAtempoFilter(tempoFactor);
        if (tempoFilter) audioFilters.push(tempoFilter);
      } else {
        const tempoFilter = getAtempoFilter(s);
        if (tempoFilter) audioFilters.push(tempoFilter);
      }
    }
    if (flags.bassboost) {
      audioFilters.push("bass=g=15,volume=1.2");
    }
    if (flags.muffle) {
      audioFilters.push("lowpass=f=600");
    }
    if (flags.reverse) {
      audioFilters.push("areverse");
    }

    const hasAudioFilters = audioFilters.length > 0;

    if (!hasAudioFilters && !flags.visualize) {
      const content = [
        "please specify at least one audio filter flag:",
        "- `-pitch <num>` / `-p <num>`",
        "- `-speed <num>` / `-s <num>`",
        "- `-reverse` / `-r`",
        "- `-muffle` / `-m`",
        "- `-bassboost` / `-b`",
        "- `-visualize` / `-v`"
      ].join("\n");
      return message.reply(content);
    }

    const attachment = (await getAttachments(message))[0];
    if (!attachment) {
      return message.reply("i need an audio or video");
    }

    const reply = await message.reply("downloading...");

    const ext = path.extname(attachment.name) || ".mp3";
    const inputPath = path.join(os.tmpdir(), `gabriel_audio_in_${message.id}${ext}`);
    const outputPath = path.join(os.tmpdir(), `gabriel_audio_out_${message.id}.ogg`);
    const outputVisualizePath = path.join(
      os.tmpdir(),
      `gabriel_audio_visualize_${message.id}.mp4`
    );

    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(inputPath);
        https.get(attachment.url, res =>
          res.pipe(file).on("finish", resolve).on("error", reject)
        );
      });

      if (hasAudioFilters) {
        await reply.edit("applying audio filters...");

        const filterString = audioFilters.join(",");

        await new Promise((resolve, reject) => {
          execFile(
            "ffmpeg",
            [
              "-i",
              inputPath,
              "-af",
              filterString,
              "-vn",
              "-acodec",
              "libvorbis",
              "-y",
              outputPath
            ],
            err => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      if (flags.visualize) {
        await reply.edit("creating the visualizer video...");

        const visualizerInput = hasAudioFilters ? outputPath : inputPath;

        await new Promise((resolve, reject) => {
          execFile(
            "ffmpeg",
            [
              "-i",
              visualizerInput,
              "-filter_complex",
              "[0:a]aformat=channel_layouts=mono,showfreqs=s=640x360:mode=bar:fscale=log:ascale=sqrt:colors=cyan:r=25[v]",
              "-map",
              "[v]",
              "-map",
              "0:a",
              "-c:v",
              "libx264",
              "-preset",
              "superfast",
              "-pix_fmt",
              "yuv420p",
              "-c:a",
              "aac",
              "-shortest",
              "-y",
              outputVisualizePath
            ],
            err => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      const filesToSend = [];
      let sizeExceeded = false;
      const sizeLimit = 25 * 1024 * 1024;

      if (hasAudioFilters) {
        const outStats = fs.statSync(outputPath);
        if (outStats.size > sizeLimit) {
          sizeExceeded = true;
        } else {
          filesToSend.push(new AttachmentBuilder(outputPath, { name: "processed.ogg" }));
        }
      }

      if (flags.visualize && !sizeExceeded) {
        const visStats = fs.statSync(outputVisualizePath);
        if (visStats.size > sizeLimit) {
          sizeExceeded = true;
        } else {
          filesToSend.push(
            new AttachmentBuilder(outputVisualizePath, { name: "visualizer.mp4" })
          );
        }
      }

      if (sizeExceeded) {
        return await reply.edit(
          "the processed file(s) are too large to send (>25MB). you made me waste my time."
        );
      }

      await reply.edit({
        content: "",
        files: filesToSend
      });
    } catch (err) {
      console.error(err);

      const isAbortError = err.name === "AbortError" || err.code === "UND_ERR_ABORTED";
      if (!isAbortError) {
        try {
          await reply.edit("there was an error while using FFmpeg (probably)");
        } catch (_) {}
      } else {
        console.warn("Upload timed out locally, but it may have succeeded on Discord.");
      }
    } finally {
      if (fs.existsSync(inputPath)) fs.rmSync(inputPath, { force: true });
      if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { force: true });
      if (fs.existsSync(outputVisualizePath))
        fs.rmSync(outputVisualizePath, { force: true });
    }
  }
};

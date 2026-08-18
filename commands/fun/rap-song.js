const { Text } = require("../../args.js");
const { loadFeatures } = require("../../databases.js");
const OllamaChat = require("ollama-chatting");
const { AttachmentBuilder } = require("discord.js");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFile, execSync } = require("child_process");
const { random } = require("../../utils.js");

const cooldowns = new Map();

module.exports = {
  args: [new Text({ optional: true, rest: true, max: 500 })],
  description: "Generate a rap song with your lyrics and TTS vocals over a beat",
  extDescription:
    "Generates a song using the provided lyrics, then use TTS to create vocals and mix them with a beat. The output is an audio file.",
  aliases: ["rap", "create-song", "tts-rap"],
  async execute({ message, args }) {
    if (cooldowns.has(message.author.id)) {
      return message.reply("wait for the current request to finish");
    }
    cooldowns.set(message.author.id, true);
    const clear = () => {
      cooldowns.delete(message.author.id);
      clearTimeout(fallback);
    };
    const fallback = setTimeout(clear, 7000);

    const [topic] = args;
    const lyrics = topic || "Gabriel. ".repeat(5);

    const lyricsPath = path.join(os.tmpdir(), `gabriel_tts_rap_lyrics_${message.id}.txt`);
    const vocalsPath = path.join(os.tmpdir(), `gabriel_tts_rap_vocals_${message.id}.mp3`);
    const outputPath = path.join(os.tmpdir(), `gabriel_tts_rap_output_${message.id}.ogg`);
    const beatPath = path.join(
      __dirname,
      `../../files/freestyle-rap-beat-${random(1, 3)}.mp3`
    );

    const reply = await message.reply("generating vocals...");

    try {
      const tts = new EdgeTTS({
        voice: "en-US-AriaNeural",
        lang: "en-US",
        rate: "+10%",
        pitch: "-10Hz",
        volume: "default",
        outputFormat: "audio-24khz-96kbitrate-mono-mp3",
        timeout: 30000
      });

      await tts.ttsPromise(lyrics, vocalsPath);

      await reply.edit("mixing with beat...");

      let vocalDuration = 10;
      try {
        const probe = execSync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${vocalsPath}"`,
          { encoding: "utf-8" }
        ).trim();
        vocalDuration = parseFloat(probe) || 10;
      } catch (_) {}
      if (vocalDuration > 167)
        return await reply.edit("stop yapping and make something shorter");

      const fadeStart = vocalDuration;
      const totalDuration = vocalDuration + 2;

      await new Promise((resolve, reject) => {
        execFile(
          "ffmpeg",
          [
            "-i",
            beatPath,
            "-i",
            vocalsPath,
            "-filter_complex",
            `[0:a]volume=0.5[beat];[1:a]volume=1.5[vocals];[beat][vocals]amix=inputs=2:duration=first:dropout_transition=2,atrim=0:${totalDuration},afade=t=out:st=${fadeStart}:d=2`,
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

      const stats = fs.statSync(outputPath);
      if (stats.size > 25 * 1024 * 1024) {
        await reply.edit("the output file is too large to send (>25MB)");
        return;
      }

      const attachment = new AttachmentBuilder(outputPath, { name: "tts-rap-song.ogg" });
      await reply.edit({ content: "", files: [attachment] });
    } catch (error) {
      console.error("Error generating rap song:", error);
      try {
        await reply.edit(
          `there was an error generating the rap song :(\n-# possible issues: the TTS service or audio mixer request timed out`
        );
      } catch (_) {}
    } finally {
      clear();
      for (const file of [lyricsPath, vocalsPath, outputPath]) {
        if (fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
          } catch (_) {}
        }
      }
    }
  }
};

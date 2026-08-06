const { Text } = require("../../args.js");
const { loadFeatures } = require("../../databases.js");
const OllamaChat = require("ollama-chatting");
const { AttachmentBuilder } = require("discord.js");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFile, execSync } = require("child_process");
const { ollamaSemaphore, random } = require("../../utils.js");

const cooldowns = new Map();

const system = `You are a rapper named Gabriel. Generate rap lyrics that are 30 seconds or shorter when spoken at a normal pace (about 2-3 lines per 10 seconds).
The lyrics should be rhythmic, have a good flow, and fit a freestyle rap beat.
Keep it creative, fun, and appropriate for Discord.
Output ONLY the lyrics with no extra text, formatting, quotes, or labels.
Each line should be on its own line.`;

module.exports = {
  args: [new Text({ optional: true, rest: true, max: 500 })],
  description: "Generate a rap song with AI lyrics and TTS vocals over a beat",
  extDescription: "Ask the cloud model to generate rap lyrics about a topic, then use TTS to create vocals and mix them with a beat. The output is an audio file.",
  aliases: ["rap"],
  async execute({ message, args }) {
    const features = loadFeatures();
    if (!features["smart-ai"]) return message.reply("no smart ai for now");

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
    const userTopic = topic || "freestyle rap about anything";

    console.log(`[rap song] ${message.author.username}: ${userTopic}`);

    const reply = await message.reply("generating rap lyrics...");

    const lyricsPath = path.join(os.tmpdir(), `gabriel_rap_lyrics_${message.id}.txt`);
    const vocalsPath = path.join(os.tmpdir(), `gabriel_rap_vocals_${message.id}.mp3`);
    const outputPath = path.join(os.tmpdir(), `gabriel_rap_output_${message.id}.ogg`);
    const beatPath = path.join(
      __dirname,
      `../../files/freestyle-rap-beat-${random(1, 3)}.mp3`
    );

    try {
      if (ollamaSemaphore.count >= ollamaSemaphore.max) {
        await reply.edit("I-I can't handle this right now...");
        clear();
        return;
      }
      await ollamaSemaphore.acquire();

      let lyrics;
      try {
        await reply.edit("generating lyrics...");

        const ollamaChat = new OllamaChat();
        const response = await ollamaChat.chat({
          model: "gemma4:31b-cloud",
          messages: [
            {
              role: "system",
              content: system
            },
            {
              role: "user",
              content: `Write a rap about: ${userTopic}`
            }
          ],
          timeout: 140000,
          options: { temperature: 0.8 }
        });

        lyrics = response.message.content?.trim();
        if (!lyrics) {
          await reply.edit("the AI couldn't generate lyrics...");
          clear();
          return;
        }

        fs.writeFileSync(lyricsPath, lyrics, "utf-8");
      } finally {
        ollamaSemaphore.release();
      }

      await reply.edit("generating vocals...");

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

      const attachment = new AttachmentBuilder(outputPath, { name: "rap-song.ogg" });
      await reply.edit({ content: "", files: [attachment] });
    } catch (error) {
      console.error("Error generating rap song:", error);
      try {
        await reply.edit("there was an error generating the rap song :(");
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

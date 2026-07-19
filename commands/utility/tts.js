const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const { AttachmentBuilder } = require("discord.js");
const { EdgeTTS } = require("node-edge-tts");
const path = require("path");
const os = require("os");
const fs = require("fs");

module.exports = {
  args: [new Text({ optional: true, rest: true, max: 1670 })],
  description: "Turns text into speech (flags: `-rate`, `-pitch`, `-volume`, `-voice`)",
  async execute({ message, args }) {
    const [rawInput] = args;
    const parts = rawInput ? rawInput.split(/\s+/) : [];

    const flags = {
      rate: "default",
      pitch: "default",
      volume: "default",
      voice: "en-US-AriaNeural",
      lang: "en-US"
    };

    const voiceMap = {
      aria: { voice: "en-US-AriaNeural", lang: "en-US" },
      jenny: { voice: "en-US-JennyNeural", lang: "en-US" },
      guy: { voice: "en-US-GuyNeural", lang: "en-US" },
      davis: { voice: "en-US-DavisNeural", lang: "en-US" },
      tony: { voice: "en-US-TonyNeural", lang: "en-US" },
      nancy: { voice: "en-US-NancyNeural", lang: "en-US" },
      sara: { voice: "en-US-SaraNeural", lang: "en-US" },
      andrew: { voice: "en-US-AndrewNeural", lang: "en-US" },
      emma: { voice: "en-US-EmmaNeural", lang: "en-US" },
      brian: { voice: "en-US-BrianNeural", lang: "en-US" },
      amy: { voice: "en-GB-AmyNeural", lang: "en-GB" },
      ryan: { voice: "en-GB-RyanNeural", lang: "en-GB" },
      libby: { voice: "en-GB-LibbyNeural", lang: "en-GB" },
      natasha: { voice: "en-AU-NatashaNeural", lang: "en-AU" },
      william: { voice: "en-AU-WilliamNeural", lang: "en-AU" }
    };

    const flagConfig = [
      { names: ["-rate", "-r"], key: "rate" },
      { names: ["-pitch", "-p"], key: "pitch" },
      { names: ["-volume", "-vol"], key: "volume" },
      { names: ["-voice", "-v"], key: "voice" }
    ];

    const textParts = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      const config = flagConfig.find(f => f.names.includes(part));

      if (config && i + 1 < parts.length) {
        const val = parts[i + 1];
        if (config.key === "voice") {
          const mapped = voiceMap[val.toLowerCase()];
          if (mapped) {
            flags.voice = mapped.voice;
            flags.lang = mapped.lang;
          } else {
            flags.voice = val;
            const dashIdx = val.indexOf("-");
            flags.lang =
              dashIdx !== -1 ? val.substring(0, val.lastIndexOf("-")) : "en-US";
          }
        } else {
          flags[config.key] = val;
        }
        i++;
      } else {
        textParts.push(parts[i]);
      }
    }

    const text = textParts.join(" ").trim();
    if (!text) {
      const voices = Object.keys(voiceMap).join(", ");
      return message.reply(
        [
          "usage: `tts [-rate <speed>] [-pitch <pitch>] [-volume <vol>] [-voice <name>] <text>`",
          `- voices: ${voices}`
        ].join("\n")
      );
    }

    const lang = flags.lang || flags.voice.substring(0, flags.voice.lastIndexOf("-"));

    const outputPath = path.join(os.tmpdir(), `gabriel_tts_${message.id}.mp3`);
    const tts = new EdgeTTS({
      voice: flags.voice,
      lang: lang,
      rate: flags.rate,
      pitch: flags.pitch,
      volume: flags.volume,
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
      timeout: 20000
    });

    try {
      message.channel.sendTyping();

      await tts.ttsPromise(text, outputPath);

      const attachment = new AttachmentBuilder(outputPath, {
        name: "tts.mp3"
      });

      await message.reply({ content: "", files: [attachment] });
    } catch (error) {
      console.error("Error generating TTS:", error);
      await message.reply("haha there was a MASSIVE error (or I took too long)");
    } finally {
      if (fs.existsSync(outputPath)) {
        try {
          await fs.promises.unlink(outputPath);
        } catch (cleanupError) {
          console.error("Failed to delete temp file:", cleanupError);
        }
      }
    }
  }
};

const { Text, Attachment } = require("../../args.js");
const { getAttachments, hasBadWords } = require("../../utils.js");
const { loadFeatures, incrementAIUsage } = require("../../databases.js");
const OllamaChat = require("ollama-chatting");
const { AttachmentBuilder } = require("discord.js");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const os = require("os");
const https = require("https");

const system = `
### Role
You are an SVG image generator. When asked to draw something, respond ONLY with valid SVG code inside an \`\`\`svg ... \`\`\` code block.
The SVG should be self-contained, scalable, and visually appealing. Do not include any text outside the code block.
Use viewBox="0 0 (width) (height)". You can use any resolution or ratio, no bigger than 800 pixels in any dimension.
If the user provides an image, redraw or reimagine it based on their prompt.
### Rules
1. DO NOT DRAW ANY KIND OF PROFANITY, INCLUDING STUFF LIKE "BUTT."
2. Avoid these errors:
- Do not set the "xmlns" property twice.
- Avoid opening and ending tag mismatch.
- Avoid double hyphen within comments.
`;

const cooldowns = new Map();

module.exports = {
  args: [new Text({ rest: true, max: 1670, optional: true })],
  description: "Ask the AI to draw an image (optionally redraw an attached image)",
  async execute({ message, args }) {
    const features = loadFeatures();
    if (!features["smart-ai"]) return await message.reply("no smart ai for now");

    if (cooldowns.has(message.author.id)) {
      return message.reply("wait for the current request to finish");
    } else if (cooldowns.size >= 3) {
      return message.reply("give me a BREAK");
    }

    cooldowns.set(message.author.id, true);
    const clear = () => {
      cooldowns.delete(message.author.id);
      clearTimeout(fallback);
    };
    const fallback = setTimeout(clear, 7000);

    incrementAIUsage(message.author.id, message.author.username);

    const prompt = args[0];
    if (prompt && prompt != "" && hasBadWords(prompt)) return await message.reply("no");

    const userMessage = {
      role: "user",
      content: prompt || "Redraw this image in your own style"
    };

    const attachments = await getAttachments(message);
    const imageAttachment = attachments.find(a => a.contentType?.startsWith("image/"));
    if (imageAttachment) {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "draw_"));
      const ext = path.extname(imageAttachment.name) || ".png";
      const inputPath = path.join(tmpDir, `input${ext}`);
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(inputPath);
        https.get(imageAttachment.url, res =>
          res.pipe(file).on("finish", resolve).on("error", reject)
        );
      });
      userMessage.images = [
        await sharp(fs.readFileSync(inputPath))
          .resize({ width: 500, height: 500, fit: "inside" })
          .png({ compressionLevel: 9 })
          .toBuffer()
      ];
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    if (!prompt && !imageAttachment) {
      return await message.reply("give me a prompt or an image to redraw");
    }

    const initialReply = await message.reply("okay im drawing it");

    const messages = [{ role: "system", content: system }, userMessage];

    try {
      const ollamaChat = new OllamaChat();
      const response = await ollamaChat.chat({
        model: "gemma4:31b-cloud",
        messages
      });

      const content = response.message.content;
      const svgMatch = content.match(/```svg\s*([\s\S]*?)```/);
      if (!svgMatch) {
        const deniedArr = [
          "cannot fulfill",
          "cant fulfill",
          "can't fulfill",
          "won't fulfill"
        ];
        const denied = deniedArr.some(i => content.includes(i));
        return initialReply.edit(
          denied
            ? "the ai didn't like your request"
            : "the ai didn't generate a valid svg"
        );
      }

      const svgContent = svgMatch[1].trim();
      const svgBuffer = Buffer.from(svgContent);

      const viewBoxRegex = /viewBox="[\d\.]+\s+[\d\.]+\s+(\d+)\s+(\d+)"/;
      const viewBoxMatch = svgContent.match(viewBoxRegex);

      const width = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 800;
      const height = viewBoxMatch ? parseInt(viewBoxMatch[2], 10) : 600;

      const attachmentPNG = new AttachmentBuilder(
        await sharp(svgBuffer).resize(width, height).png().toBuffer(),
        { name: "drawing.png" }
      );
      const attachmentSVG = new AttachmentBuilder(svgBuffer, {
        name: "drawing.svg"
      });
      await initialReply.edit({ content: "", files: [attachmentPNG, attachmentSVG] });
    } catch (error) {
      const err = String(error.message || error);
      const isCorrupt = err.toLowerCase().includes("corrupt header");
      if (!isCorrupt) console.error(error);
      await initialReply.edit(
        isCorrupt ? `the ai didn't generate a valid svg` : "i had trouble drawing that"
      );
    } finally {
      clear();
    }
  }
};

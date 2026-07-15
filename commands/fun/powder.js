const { AttachmentBuilder } = require("discord.js");
const { Canvas, Image } = require("skia-canvas");
const { GIFEncoder } = require("gifenc");
const PowderSim = require("../../functions/powder.js");
const { Attachment } = require("../../args.js");
const { random, getAttachments } = require("../../utils.js");

function perceptualDistance(xr, xg, xb, yr, yg, yb) {
  const dr = xr - yr;
  const dg = xg - yg;
  const db = xb - yb;
  return Math.sqrt(dr * dr * 0.2125 + dg * dg * 0.7154 + db * db * 0.0721);
}

const sand = 1;
const water = 2;
const lava = 3;
const obsidian = 4;
const acid = 5;
const colors = {
  0: [255, 255, 255],
  [sand]: [255, 204, 0],
  [water]: [0, 170, 255],
  [lava]: [226, 80, 43],
  [obsidian]: [49, 19, 66],
  [acid]: [255, 122, 246]
};

module.exports = {
  args: [],
  description: "Runs a silly little powder simulator",
  async execute({ message, args }) {
    const scale = 3;
    const maxSize = 250;
    let width = 200;
    let height = 125;

    let attachments = await getAttachments(message);
    if (attachments.length === 0)
      attachments.push({ url: message.author.displayAvatarURL() });

    const img = new Image();
    img.src = attachments[0].url;
    await img.decode();

    const iw = img.width;
    const ih = img.height;
    if (iw >= ih) {
      width = Math.min(iw, maxSize);
      height = Math.round((ih / iw) * width);
    } else {
      height = Math.min(ih, maxSize);
      width = Math.round((iw / ih) * height);
    }

    const sim = new PowderSim(width, height);

    const tempCanvas = new Canvas(width, height);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0, width, height);
    const imgData = tempCtx.getImageData(0, 0, width, height).data;

    const elements = [0, sand, water, lava, obsidian, acid];

    for (let i = 0; i < width * height; i++) {
      const r = imgData[i * 4];
      const g = imgData[i * 4 + 1];
      const b = imgData[i * 4 + 2];

      let bestElement = null;
      let minDistance = 105;

      for (const element of elements) {
        const dist = perceptualDistance(r, g, b, ...colors[element]);

        if (dist < minDistance) {
          minDistance = dist;
          bestElement = element;
        }
      }

      if (bestElement !== null) {
        sim.set(i % width, Math.floor(i / width), bestElement);
      }
    }

    const initialReply = await message.reply("hold on im simulating that");

    const gif = new GIFEncoder();
    const scaledW = width * scale;
    const scaledH = height * scale;
    const index = new Uint8Array(scaledW * scaledH);

    const maxFrames = 150;
    let inactiveFrames = 0;

    for (let f = 0; f < maxFrames; f++) {
      sim.step();
      sim.step();
      const moved = sim.step();

      if (moved < 20) inactiveFrames++;
      else inactiveFrames = 0;

      if (inactiveFrames >= 10) break;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const type = sim.grid[y * width + x];
          const py = y * scale;
          const px = x * scale;
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              index[(py + dy) * scaledW + (px + dx)] = type;
            }
          }
        }
      }

      gif.writeFrame(index, scaledW, scaledH, {
        palette: Object.values(colors),
        delay: 40
      });
    }

    gif.finish();

    const finalAttachment = new AttachmentBuilder(Buffer.from(gif.bytes()), {
      name: "powder.gif"
    });
    await initialReply.edit({ content: "", files: [finalAttachment] });
  }
};

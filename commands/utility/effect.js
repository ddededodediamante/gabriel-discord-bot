const { AttachmentBuilder, inlineCode } = require("discord.js");
const { Canvas, Image } = require("skia-canvas");
const { Text } = require("../../args.js");
const { getAttachments, random } = require("../../utils.js");

const effects = {
  contrast: {
    default: 150,
    min: 0,
    max: 500,
    apply(ctx, source, amount) {
      ctx.filter = `contrast(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  glitch: {
    default: 3,
    min: 1,
    max: 20,
    apply(ctx, source, amount) {
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = "hard-light";
      ctx.fillStyle = "red";
      ctx.drawImage(source, amount, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "blue";
      ctx.drawImage(source, -amount, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  glow: {
    default: 5,
    min: 1,
    max: 20,
    apply(ctx, source, amount) {
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.filter = `blur(${amount}px)`;
      ctx.globalCompositeOperation = "lighten";
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  blur: {
    default: 5,
    min: 1,
    max: 20,
    apply(ctx, source, amount) {
      ctx.filter = `blur(${amount}px)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  saturate: {
    default: 150,
    min: 0,
    max: 500,
    apply(ctx, source, amount) {
      ctx.filter = `saturate(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  grayscale: {
    default: 100,
    min: 0,
    max: 100,
    apply(ctx, source, amount) {
      ctx.filter = `grayscale(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  sepia: {
    default: 100,
    min: 0,
    max: 100,
    apply(ctx, source, amount) {
      ctx.filter = `sepia(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  brightness: {
    default: 150,
    min: 0,
    max: 500,
    apply(ctx, source, amount) {
      ctx.filter = `brightness(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  invert: {
    default: 100,
    min: 0,
    max: 100,
    apply(ctx, source, amount) {
      ctx.filter = `invert(${amount}%)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  hue: {
    default: 90,
    min: 0,
    max: 360,
    apply(ctx, source, amount) {
      ctx.filter = `hue-rotate(${amount}deg)`;
      ctx.drawImage(source, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  },
  mirror: {
    apply(ctx, source, amount) {
      const halfWidth = ctx.canvas.width / 2;
      const height = ctx.canvas.height;
      ctx.drawImage(source, 0, 0, halfWidth, height);
      ctx.save();
      ctx.translate(ctx.canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(source, 0, 0, halfWidth, height);
      ctx.restore();
    }
  }
};

function pickRandomEffect() {
  const names = Object.keys(effects);
  const key = names[random(0, names.length - 1)];
  const effect = effects[key];
  return { key, effect, amount: effect.default };
}

function effectDisplayNames() {
  return [...Object.keys(effects), "random"].sort().map(inlineCode).join(", ");
}

module.exports = {
  args: [new Text({ optional: true, rest: true, default: "", max: 140 })],
  description: "Apply one or more effects to an image",
  extDescription:
    `Applies one or more effects to an image. Attach an image or reply to a message with one.\n` +
    `Available effects: ${effectDisplayNames()}`,
  aliases: ["image-effect", "img-effect", "image", "img"],
  async execute({ message, args }) {
    const [rawInput] = args;
    const parts = rawInput ? rawInput.split(/\s+/) : [];

    const chosen = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();

      if (part === "random") {
        chosen.push(pickRandomEffect());
        continue;
      }

      if (effects[part]) {
        const effect = effects[part];
        let amount = effect.default !== undefined ? effect.default : null;

        if (effect.default !== undefined && i + 1 < parts.length) {
          const nextPart = parts[i + 1];
          const val = Number(nextPart);
          if (!isNaN(val)) {
            amount = val;
            i++;
          }
        }
        chosen.push({ key: part, effect, amount });
        continue;
      }
    }

    if (chosen.length === 0) {
      if (parts.length > 0 && parts[0] !== "") {
        return message.reply(
          `what kind of effects are those? use any of these: ${effectDisplayNames()}`
        );
      }
      chosen.push(pickRandomEffect());
    }

    for (const { key, effect, amount } of chosen) {
      if (effect.default !== undefined) {
        if (!Number.isInteger(amount)) {
          return message.reply(`\`${key}\` strength must be a whole number`);
        }
        if (amount < effect.min || amount > effect.max) {
          return message.reply(
            `\`${key}\` strength must be between ${effect.min} and ${effect.max}`
          );
        }
      }
    }

    let attachments = await getAttachments(message);
    if (attachments.length === 0)
      attachments.push({ url: message.author.displayAvatarURL({ extension: "png" }) });
    const attachment = attachments[0];

    if (attachment?.size > 7 * 1024 * 1024) {
      return message.reply("image too big (>7MB)");
    }

    const img = new Image();
    img.src = attachment.url;
    await img.decode();

    let source = img;
    for (const { effect, amount } of chosen) {
      const layer = new Canvas(img.width, img.height);
      const lctx = layer.getContext("2d");
      effect.apply(lctx, source, amount);
      source = layer;
    }

    const buffer = await source.toBuffer();
    const finalAttachment = new AttachmentBuilder(buffer, {
      name: "effect.png"
    });
    await message.reply({ content: "", files: [finalAttachment] });
  }
};

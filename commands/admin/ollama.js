const { spawn } = require("child_process");
const { config } = require("../../databases");

const OLLAMA_BIN = config?.ollamaBin ?? false;
const OLLAMA_HOST = config?.ollamaHost || "http://localhost:11434";

async function isRunning() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = {
  description: "Start Ollama if it isn't already running",
  async execute({ message }) {
    if (OLLAMA_BIN === false) return await message.reply("ollama bin config is missing");

    const reply = await message.reply("checking if ollama is running...");

    if (await isRunning()) {
      return reply.edit("ollama is already running");
    }

    await reply.edit("ollama isn't running, starting it...");

    const child = spawn(OLLAMA_BIN, ["serve"], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();

    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000));
      if (await isRunning()) {
        return reply.edit("ollama has been started");
      }
    }

    return reply.edit("started ollama but couldn't confirm it's ready");
  },
};

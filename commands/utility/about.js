const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = (((total - idle) / total) * 100).toFixed(1);

  return { usage: `${usage}%`, cores: cpus.length, model: cpus[0].model.trim() };
}

/* DISCLAIMER: Made by Artificial Intelligence 😨 */
function getGpuUsage() {
  try {
    if (os.platform() === "win32") {
      const output = execSync(
        "wmic path win32_videocontroller get name,AdapterRAM /format:csv",
        { encoding: "utf-8" }
      );
      const lines = output
        .trim()
        .split("\n")
        .filter(l => l.includes(","));
      if (lines.length > 1) {
        const parts = lines[1].split(",");
        const ram = parseInt(parts[1]) || 0;
        const name = parts.slice(2).join(",").trim() || "Unknown GPU";
        return { name, vram: ram ? `${(ram / 1073741824).toFixed(2)} GB` : "N/A" };
      }
    } else if (os.platform() === "linux") {
      const output = execSync("lspci | grep -i vga", { encoding: "utf-8" });
      const match = output.match(/: (.+)/);
      return { name: match ? match[1].trim() : "Unknown GPU", vram: "N/A" };
    }
  } catch {
    return { name: "Unable to detect", vram: "N/A" };
  }
  return { name: "N/A (unsupported platform)", vram: "N/A" };
}

module.exports = {
  args: [],
  description: "Information about gabriel",
  execute({ message, args }) {
    const packagePath = path.join(__dirname, "../../package.json");
    const packages = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    const { dependencies } = packages;

    const depList = Object.entries(dependencies)
      .map(
        ([name, version]) =>
          `- \`${name}\`: v${version.replace("^", "").replace("~", "")}`
      )
      .join("\n");

    const cpu = getCpuUsage();
    const gpu = getGpuUsage();
    const memUsed = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
    const memTotal = (os.totalmem() / 1073741824).toFixed(2);
    const uptime = (os.uptime() / 3600).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle("Gabriel Information")
      .setColor("Yellow")
      .addFields(
        {
          name: "System",
          value: [
            `- OS: ${os.platform()} ${os.release()}`,
            `- Uptime: ${uptime}h`,
            `- Memory: ${memUsed} / ${memTotal} GB`
          ].join("\n"),
          inline: true
        },
        {
          name: `CPU (${cpu.usage})`,
          value: `- Model: \`${cpu.model}\`\n- Cores: ${cpu.cores}`,
          inline: true
        },
        {
          name: "GPU",
          value: `- Model: \`${gpu.name}\`\n- VRAM: ${gpu.vram}`,
          inline: true
        },
        {
          name: "Dependencies",
          value: depList || "No dependencies found.",
          inline: true
        }
      );

    return message.reply({ embeds: [embed] });
  }
};

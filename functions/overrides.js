const { User } = require("discord.js");
const { setUserSetting, getUserSettings, config } = require("../databases");

Object.defineProperty(User.prototype, "isBotAdmin", {
  configurable: true,
  get() {
    return config.permissions.admins.includes(this.id);
  }
});

Object.defineProperty(User.prototype, "hasBotEvalPerms", {
  configurable: true,
  get() {
    return config.permissions.evalPerms.includes(this.id);
  }
});

Object.defineProperty(User.prototype, "settings", {
  configurable: true,
  get() {
    const userId = this.id;

    return new Proxy(getUserSettings(userId), {
      set(target, key, value) {
        setUserSetting(userId, key, value);
        target[key] = value;
        return true;
      }
    });
  }
});

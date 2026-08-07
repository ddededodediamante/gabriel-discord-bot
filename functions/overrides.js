const { User } = require("discord.js");
const { setUserSetting, getUserSettings } = require("../databases");

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

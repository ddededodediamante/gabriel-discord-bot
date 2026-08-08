const fs = require("fs");
const path = require("path");

const DEFAULT_FEATURES = { "smart-ai": true };
const DEFAULT_USER_SETTINGS = {
  "hide-from-leaderboard": false,
  "be-hated": false,
  "no-reply": false,
  "no-human": false
};
const DEFAULT_SERVER_SETTINGS = {
  "disable-ai": false
};
const DATABASES_PATH = path.join(__dirname, "databases");
const CONFIG_PATH = path.join(DATABASES_PATH, "config.json");
const FEATURES_PATH = path.join(DATABASES_PATH, "features.json");
const USER_SETTINGS_PATH = path.join(DATABASES_PATH, "user-settings.json");
const SERVER_SETTINGS_PATH = path.join(DATABASES_PATH, "server-settings.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("config.json missing");
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

const config = loadConfig();

function loadFeatures() {
  if (!fs.existsSync(FEATURES_PATH)) {
    fs.writeFileSync(FEATURES_PATH, JSON.stringify(DEFAULT_FEATURES));
    return DEFAULT_FEATURES;
  }
  return JSON.parse(fs.readFileSync(FEATURES_PATH, "utf-8"));
}

function saveFeatures(features) {
  fs.writeFileSync(FEATURES_PATH, JSON.stringify(features));
}

function loadUserSettings() {
  if (!fs.existsSync(USER_SETTINGS_PATH)) {
    fs.writeFileSync(USER_SETTINGS_PATH, JSON.stringify({}));
    return {};
  }
  return JSON.parse(fs.readFileSync(USER_SETTINGS_PATH, "utf-8"));
}

function saveUserSettings(data) {
  fs.writeFileSync(USER_SETTINGS_PATH, JSON.stringify(data, null, 2));
}

function setUserSetting(userId, key, value) {
  const data = loadUserSettings();

  if (!data[userId]) {
    data[userId] = { ...DEFAULT_USER_SETTINGS };
  }

  data[userId][key] = value;

  saveUserSettings(data);
}

function getUserSettings(userId) {
  const data = loadUserSettings();
  return { ...DEFAULT_USER_SETTINGS, ...data[userId] };
}

function loadServerSettings() {
  if (!fs.existsSync(SERVER_SETTINGS_PATH)) {
    fs.writeFileSync(SERVER_SETTINGS_PATH, JSON.stringify({}));
    return {};
  }
  return JSON.parse(fs.readFileSync(SERVER_SETTINGS_PATH, "utf-8"));
}

function saveServerSettings(data) {
  fs.writeFileSync(SERVER_SETTINGS_PATH, JSON.stringify(data, null, 2));
}

function setServerSetting(guildId, key, value) {
  const data = loadServerSettings();

  if (!data[guildId]) {
    data[guildId] = { ...DEFAULT_SERVER_SETTINGS };
  }

  data[guildId][key] = value;

  saveServerSettings(data);
}

function getServerSettings(guildId) {
  const data = loadServerSettings();
  return { ...DEFAULT_SERVER_SETTINGS, ...data[guildId] };
}

module.exports = {
  config,
  loadFeatures,
  saveFeatures,
  loadUserSettings,
  saveUserSettings,
  setUserSetting,
  getUserSettings,
  loadServerSettings,
  saveServerSettings,
  setServerSetting,
  getServerSettings
};

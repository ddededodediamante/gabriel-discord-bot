const fs = require("fs");
const path = require("path");

const DEFAULT_FEATURES = { "smart-ai": true };
const DEFAULT_USER_SETTINGS = {
  "hide-from-leaderboard": false,
  "be-hated": false,
  "no-reply": false,
  "no-human": false
};
const DATABASES_PATH = path.join(__dirname, "databases");
const CONFIG_PATH = path.join(DATABASES_PATH, "config.json");
const FEATURES_PATH = path.join(DATABASES_PATH, "features.json");
const AI_USAGE_PATH = path.join(DATABASES_PATH, "ai-usage.json");
const USER_SETTINGS_PATH = path.join(DATABASES_PATH, "user-settings.json");

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

function loadAIUsage() {
  if (!fs.existsSync(AI_USAGE_PATH)) {
    fs.writeFileSync(AI_USAGE_PATH, "{}");
    return {};
  }
  return JSON.parse(fs.readFileSync(AI_USAGE_PATH, "utf-8"));
}

function saveAIUsage(data) {
  fs.writeFileSync(AI_USAGE_PATH, JSON.stringify(data, null, 2));
}

function incrementAIUsage(userId, username) {
  const data = loadAIUsage();
  if (!data[userId]) {
    data[userId] = { username, count: 0 };
  }
  data[userId].username = username;
  data[userId].count++;
  saveAIUsage(data);
  return data[userId].count;
}

function getTopAIUsers(limit = 10) {
  const data = loadAIUsage();
  return Object.entries(data)
    .map(([id, info]) => ({ id, username: info.username, count: info.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
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

/**
 * @param {import("discord.js").User | null | undefined} user
 * @returns {boolean}
 */
function isAdmin(user) {
  return config.admins.includes(user?.id);
}

module.exports = {
  config,
  isAdmin,
  loadFeatures,
  saveFeatures,
  loadAIUsage,
  saveAIUsage,
  incrementAIUsage,
  getTopAIUsers,
  loadUserSettings,
  saveUserSettings,
  setUserSetting,
  getUserSettings
};

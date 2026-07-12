const badWords = [
  "fuck",
  "shit",
  "piss",
  "stupid",
  "horrible",
  "bitch",
  "motherfucker",
  "mf",
];

module.exports = sentence => {
  const deduplicated = sentence.toLowerCase().replace(/(.)\1+/g, "$1");
  return badWords.some(word => deduplicated.includes(word));
};
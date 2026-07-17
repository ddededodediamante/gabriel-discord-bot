const { Text } = require("../../args.js");
const { client } = require("../../index.js");
const path = require("path");

module.exports = {
  args: [new Text({ rest: true, max: 1670 })],
  description: "Parse the Newest programming language made by ddededodediamante",
  async execute({ message, args }) {
    const [code] = args;

  }
};

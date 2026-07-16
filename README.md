# Gabriel Discord Bot

A Discord bot made primarily for fun, having unique commands that (probably) no other Discord bot has.

## Setup

### Requirements

- NodeJS: Minimum version not known yet, but Gabriel was primarily used with `v24.12.0`.
- [Ollama](https://docs.ollama.com/quickstart): Ollama is needed for most AI commands, you can disable them if needed.
- Package Manager: Might be fine on any, but Gabriel was primarily used with `npm.`

### Configuration

To configure Gabriel, create a new file in `databases/config.json` (make the folder if it doesn't exist already.)

Here is each config value explained:

```json
{
  "token": "...", // Token for your Discord bot
  "userId": "...", // User ID of your Discord bot
  "prefix": "gabriel!", // Prefix used to run commands. (e.g. abc -> abc!help)
  "admins": ["..."], // An array of user IDs to mark as admin.
  "suggestionChannel": "...", // Channel ID where suggestions are sent from the suggestion command.
  "ollamaBin": "...this/is/a/path/ollama.exe", // Path where ollama's executable is located at.
  "ollamaHost": "http://localhost:11434" // URL to ollama once it is served.
}
```

### Disable AI

To disable AI commands, you can:

- Create a new file in `databases/features.json` with the contents `{"smart-ai":true}`.
- Use the features command (e.g. `gabriel!features smart-ai off`), this requires an admin to do it.

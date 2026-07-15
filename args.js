/*
DISCLOSURE: Some parts of this file were AI generated,
but they were manually tested and modified afterwards. 🧨🧨🧨
Sorry
*/

/**
 * @typedef {{ ok: true, value: any } | { ok: false, error: string }} ParseResult
 */

class Arg {
  /**
   * @param {{ optional?: boolean, default?: any }} [opts]
   */
  constructor({ optional = false, default: defaultVal } = {}) {
    this.optional = optional || defaultVal !== undefined;
    this.default = defaultVal;
  }

  /**
   * Parse a single raw token string into a typed value.
   * @param {string} _token
   * @returns {ParseResult}
   */
  parse(_token) {
    throw new Error("Arg subclass must implement parse()");
  }

  /**
   * Human-readable description for the help command.
   * @returns {string}
   */
  describe() {
    throw new Error("Arg subclass must implement describe()");
  }
}

class Text extends Arg {
  /**
   * @param {{
   *   min?: number,
   *   max?: number,
   *   rest?: boolean,
   *   optional?: boolean,
   *   default?: string,
   * }} [opts]
   */
  constructor({ min, max, rest = false, optional, default: defaultVal } = {}) {
    super({ optional, default: defaultVal });
    this.min = min;
    this.max = max;
    this.rest = rest;
  }

  /** @param {string} token @returns {ParseResult} */
  parse(token) {
    if (this.min !== undefined && token.length < this.min)
      return { ok: false, error: `must be at least ${this.min} characters` };
    if (this.max !== undefined && token.length > this.max)
      return { ok: false, error: `must be at most ${this.max} characters` };
    return { ok: true, value: token };
  }

  describe() {
    const parts = [this.rest ? "...string" : "string"];
    if (this.min !== undefined) parts.push(`min ${this.min}`);
    if (this.max !== undefined) parts.push(`max ${this.max}`);
    if (this.optional) parts.push("optional");
    if (this.default !== undefined) parts.push(`default: ${this.default}`);
    return parts[0] + (parts.length > 1 ? ` (${parts.slice(1).join(", ")})` : "");
  }
}

class Num extends Arg {
  /**
   * @param {{
   *   whole?: boolean,
   *   min?: number,
   *   max?: number,
   *   optional?: boolean,
   *   default?: number,
   * }} [opts]
   */
  constructor({ whole = false, min, max, optional, default: defaultVal } = {}) {
    super({ optional, default: defaultVal });
    this.whole = whole;
    this.min = min;
    this.max = max;
  }

  /** @param {string} token @returns {ParseResult} */
  parse(token) {
    const n = Number(token);
    if (isNaN(n)) return { ok: false, error: "expected a number" };
    if (this.whole && !Number.isInteger(n))
      return { ok: false, error: "expected a whole number" };
    if (this.min !== undefined && n < this.min)
      return { ok: false, error: `must be at least ${this.min}` };
    if (this.max !== undefined && n > this.max)
      return { ok: false, error: `must be at most ${this.max}` };
    return { ok: true, value: n };
  }

  describe() {
    const parts = [this.whole ? "whole number" : "number"];
    if (this.min !== undefined && this.max !== undefined)
      parts.push(`${this.min}–${this.max}`);
    else if (this.min !== undefined) parts.push(`min ${this.min}`);
    else if (this.max !== undefined) parts.push(`max ${this.max}`);
    if (this.optional) parts.push("optional");
    if (this.default !== undefined) parts.push(`default: ${this.default}`);
    return parts[0] + (parts.length > 1 ? ` (${parts.slice(1).join(", ")})` : "");
  }
}

class Bool extends Arg {
  /**
   * Accepts: true/false, yes/no, 1/0, on/off
   * @param {{ optional?: boolean, default?: boolean }} [opts]
   */
  constructor({ optional, default: defaultVal } = {}) {
    super({ optional, default: defaultVal });
  }

  /** @param {string} token @returns {ParseResult} */
  parse(token) {
    if (/^(true|yes|1|on)$/i.test(token)) return { ok: true, value: true };
    if (/^(false|no|0|off)$/i.test(token)) return { ok: true, value: false };
    return { ok: false, error: "expected true/false, yes/no, 1/0, or on/off" };
  }

  describe() {
    const parts = ["boolean"];
    if (this.optional) parts.push("optional");
    if (this.default !== undefined) parts.push(`default: ${this.default}`);
    return parts[0] + (parts.length > 1 ? ` (${parts.slice(1).join(", ")})` : "");
  }
}

class User extends Arg {
  /**
   * @param {{ optional?: boolean, default?: string }} [opts]
   */
  constructor({ optional, default: defaultVal } = {}) {
    super({ optional, default: defaultVal });
  }

  /** @param {string} token @returns {ParseResult} */
  parse(token) {
    const mentionMatch = token.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
      return { ok: true, value: mentionMatch[1] };
    }

    if (/^\d+$/.test(token)) {
      return { ok: true, value: token };
    }

    return {
      ok: false,
      error: "expected a user mention or user ID"
    };
  }

  describe() {
    const parts = ["user"];
    if (this.optional) parts.push("optional");
    if (this.default !== undefined) parts.push(`default: ${this.default}`);
    return parts[0] + (parts.length > 1 ? ` (${parts.slice(1).join(", ")})` : "");
  }
}

class Union extends Arg {
  /**
   * @param {...Arg} types
   */
  constructor(...types) {
    super();
    this.types = types;
  }

  /** @param {string} token @returns {ParseResult} */
  parse(token) {
    for (const type of this.types) {
      const result = type.parse(token);
      if (result.ok) return result;
    }
    return { ok: false, error: `expected ${this.describe()}` };
  }

  describe() {
    return this.types.map(t => t.describe()).join(" or ");
  }
}

/**
 * Splits a raw argument string into tokens, respecting "quoted strings".
 * Throws if a quoted string is unterminated.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    while (i < text.length && text[i] === " ") i++;
    if (i >= text.length) break;

    if (text[i] === '"') {
      let s = "";
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\" && i + 1 < text.length) {
          i++;
          s += text[i];
        } else {
          s += text[i];
        }
        i++;
      }
      if (i >= text.length) throw new Error("unterminated quoted string");
      i++;
      tokens.push(s);
    } else {
      let s = "";
      while (i < text.length && text[i] !== " ") s += text[i++];
      tokens.push(s);
    }
  }

  return tokens;
}

/**
 * Parse raw tokens against an array of Arg definitions.
 * @param {Arg[] | undefined} argDefs
 * @param {string[]} tokens
 * @returns {{ ok: true, args: any[] } | { ok: false, error: string }}
 */
function parseCommandArgs(argDefs, tokens) {
  if (argDefs == null) return { ok: true, args: [] };
  if (argDefs.length === 0) {
    if (tokens.length > 0) return { ok: false, error: "this command takes no arguments" };
    return { ok: true, args: [] };
  }

  const result = [];
  let ti = 0;

  for (let i = 0; i < argDefs.length; i++) {
    const def = argDefs[i];
    const label = `argument ${i + 1}: \`${def.describe()}\``;

    if (def instanceof Text && def.rest) {
      if (ti >= tokens.length) {
        if (def.optional) {
          result.push(def.default ?? null);
          continue;
        }
        return { ok: false, error: `missing ${label}` };
      }
      const raw = tokens.slice(ti).join(" ");
      ti = tokens.length;
      const parsed = def.parse(raw);
      if (!parsed.ok) return { ok: false, error: `${label}: ${parsed.error}` };
      result.push(parsed.value);
      continue;
    }

    if (ti >= tokens.length) {
      if (def.optional) {
        result.push(def.default ?? null);
        continue;
      }
      return { ok: false, error: `missing ${label}` };
    }

    const parsed = def.parse(tokens[ti++]);
    if (!parsed.ok) return { ok: false, error: `${label}: ${parsed.error}` };
    result.push(parsed.value);
  }

  if (ti < tokens.length) {
    return {
      ok: false,
      error: `too many arguments (expected ${argDefs.length})`
    };
  }

  return { ok: true, args: result };
}

module.exports = {
  Arg,
  Text,
  Num,
  Bool,
  User,
  Union,
  tokenize,
  parseCommandArgs
};

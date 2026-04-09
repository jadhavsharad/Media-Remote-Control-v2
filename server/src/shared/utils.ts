import crypto from "crypto";

const pairCodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const pairCodeLength = 6;

const utils = Object.freeze({
  generateUUID(): string {
    return crypto.randomUUID();
  },

  generatePairCode(): string {
    let code = "";
    for (let i = 0; i < pairCodeLength; i++) {
      code += pairCodeChars[Math.floor(Math.random() * pairCodeChars.length)];
    }
    return code;
  },

  now(): number {
    return Date.now();
  },
});

export default utils;

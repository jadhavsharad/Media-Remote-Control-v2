import pino from "pino";
import config from "./config.js";



 const logger = pino({
  ...(config.isDev
    ? {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    }
    : { level: "info" }),
});

export default logger;

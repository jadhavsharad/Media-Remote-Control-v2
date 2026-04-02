import { createConsola } from "consola/browser";
import { isDev, isTesting } from "./config";

const logger = createConsola({
  ...isDev ? { level: 4 } : isTesting ? { level: 3 } : { level: 2 },
});

export default logger;
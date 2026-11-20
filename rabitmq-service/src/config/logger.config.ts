import { createLogger, format, transports, Logger } from "winston";
import config from "./index.config";
import dayjs from "dayjs";
import { red, yellow, cyan, gray, green, bold } from "colorette";

const { combine, timestamp, printf, json, splat } = format;

// Custom format for console using colorette
const customConsoleFormat = printf((info) => {
  let colorizedLevel: string;
  let messageLevel: string;
  const { timestamp: ts, level, message } = info;
  const meta: any = info[Symbol.for("splat")] || [];

  switch (level) {
    case "error":
      colorizedLevel = red(bold(level));
      messageLevel = red(message as string);
      break;
    case "warn":
      colorizedLevel = yellow(bold(level));
      messageLevel = message as string;
      break;
    case "info":
      colorizedLevel = cyan(level);
      messageLevel = message as string;
      break;
    case "debug":
      colorizedLevel = gray(level);
      messageLevel = message as string;
      break;
    default:
      colorizedLevel = level;
      messageLevel = message as string;
  }

  // Stringify extra metadata if present
  const metaString = meta?.length ? `| ${JSON.stringify(meta[0], null)}` : "";

  return `${green(
    dayjs(ts as string).format("Do-YY, h:mm:ss a"),
  )} ${colorizedLevel}: ${messageLevel}  ${metaString} `;
});

const DevelopmentLogger = (): Logger => {
  return createLogger({
    level: "debug",
    format: combine(timestamp(), json(), splat()),
    transports: [
      new transports.Console({
        format: combine(timestamp(), splat(), customConsoleFormat),
      }),
      new transports.File({ filename: "logs/app-combined.log" }),
      new transports.File({ filename: "logs/app-error.log", level: "error" }),
      new transports.File({ filename: "logs/app-info.log", level: "info" }),
      new transports.File({ filename: "logs/app-debug.log", level: "debug" }),
    ],
  });
};

const ProductionLogger = (): Logger => {
  return createLogger({
    level: "info",
    format: combine(timestamp(), json(), splat()),
    transports: [
      new transports.Console({
        format: combine(timestamp(), splat(), customConsoleFormat),
      }),
      // new transports.File({ filename: "logs/app-combined.log" }),
    ],
  });
};

const logger: Logger =
  config.DEVELOPMENT_MODE === "development"
    ? DevelopmentLogger()
    : ProductionLogger();

export default logger;

import { Redis } from "ioredis";
import dotenv from "dotenv";
import { red, yellow, magenta } from "colorette";
import config from "./index.config.js";

dotenv.config();

// Track reconnect attempts
let reconnectAttempts: number = 0;
const MAX_RECONNECT_ATTEMPTS: number = 3;

const redisClient = (): string => {
  if (process.env.DEVELOPMENT_MODE === "development") {
    console.log("development Redis is connecting");
  } else {
    console.log("production Redis is connecting");
  }

  return process.env.DEVELOPMENT_MODE === "production"
    ? (process.env.REDIS_URL as string)
    : config.redis.REDIS_URL;
};

const redis = new Redis(redisClient(), {
  retryStrategy: (times: number): number | null => {
    reconnectAttempts++;

    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(times * 500, 2000);

      console.log(
        `${red("[Redis]")} Reconnecting (${red(
          reconnectAttempts.toString(),
        )}/${yellow(MAX_RECONNECT_ATTEMPTS.toString())}) in ${delay}ms...`,
      );

      return delay;
    }

    console.log(`${red("Max reconnect attempts reached. Giving up.")}`);
    return null; // Stop retrying
  },
});

// Reset counter on successful connection
redis.on("connect", () => {
  reconnectAttempts = 0;
  console.log(`${magenta("[Redis]")} Connected successfully.`);

  // redis.flushall();
});

redis.on("error", (err: any) => {
  console.log(`${red("[Redis]")} Connection error:`, err.code);
  if (reconnectAttempts === 3) process.exit(1);
});

export default redis;

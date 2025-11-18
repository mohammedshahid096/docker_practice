const Redis = require("ioredis");
const dotenv = require("dotenv");
const logger = require("./logger.config");
dotenv.config();
const { red, yellow, magenta } = require("colorette");

// Track reconnect attempts
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

const redisClient = () => {
  if (process.env.DEVELOPMENT_MODE === "development") {
    logger.info("development Redis is connected");
  } else {
    console.log("production Redis is connected");
  }
  return process.env.DEVELOPMENT_MODE === "production"
    ? process.env.REDIS_URL
    : process.env.REDIS_URL_DEV;
};

const redis = new Redis(redisClient(), {
  retryStrategy: (times) => {
    reconnectAttempts++;
    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(times * 500, 2000); // Exponential-ish backoff
      console.log(
        `${red("[Redis]")} Reconnecting (${red(reconnectAttempts)}/${yellow(
          MAX_RECONNECT_ATTEMPTS
        )}) in ${delay}ms...`
      );
      return delay;
    }

    console.error(` ${red("Max reconnect attempts reached. Giving up.")}`);
    return false; // Stop retrying
  },
});

// Optional: Reset counter on successful connection
redis.on("connect", () => {
  reconnectAttempts = 0; // Reset on successful connection
  console.log(`${magenta("[Redis]")} Connected successfully.`);
  redis.flushall(); // Clear all data on startup
});

redis.on("error", (err) => {
  console.error(`${red("[Redis]")} Connection error:`, err.message);
});

module.exports.redis = redis;

const logger = require("../config/logger.config");
const { redis } = require("../config/redis.config");
const redisExpiry = 1 * 24 * 60 * 60; // 1day

class RedisServiceClass {
  constructor({ expiryTime = null } = {}) {
    this.redisExpiry = expiryTime ?? redisExpiry;
  }
  async setRedisJSON(key, value) {
    try {
      logger.info(
        "services - redis.service - RedisServiceClass - setRedisJSON"
      );
      const stringValue = JSON.stringify(value);
      await redis.set(key, stringValue, "EX", this.redisExpiry);
      return true;
    } catch (error) {
      logger.error(
        "services - redis.service - RedisServiceClass - setRedisJSON - error",
        error
      );
      const customError = new Error(error?.message);
      customError.statusCode = 503; // Service Unavailable
      customError.name = "RediConnectionError";
      throw customError;
    }
  }

  async getRedisJSON(key) {
    try {
      logger.info(
        "services - redis.service - RedisServiceClass - getRedisJSON"
      );
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(
        "services - redis.service - RedisServiceClass - getRedisJSON - error",
        error
      );

      const customError = new Error(error?.message);
      customError.statusCode = 503; // Service Unavailable
      customError.name = "RediConnectionError";
      throw customError;
    }
  }

  async deleteRedisKey(key) {
    try {
      logger.info(
        "services - redis.service - RedisServiceClass - deleteRedisKey"
      );
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error(
        "services - redis.service - RedisServiceClass - deleteRedisKey - error",
        error
      );
      const customError = new Error(error?.message);
      customError.statusCode = 503; // Service Unavailable
      customError.name = "RediConnectionError";
      throw customError;
    }
  }

  async deletePattern(pattern) {
    try {
      logger.info(
        "services - redis.service - RedisServiceClass - deletePattern"
      );
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(
        "services - redis.service - RedisServiceClass - deletePattern - error",
        error
      );
      const customError = new Error(error?.message);
      customError.statusCode = 503; // Service Unavailable
      customError.name = "RediConnectionError";
      throw customError;
    }
  }
}

module.exports = RedisServiceClass;

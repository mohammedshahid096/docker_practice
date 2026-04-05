import dotenv from "dotenv";
type Environment = "development" | "production";

interface Config {
  PORT: number;
  DEVELOPMENT_MODE: Environment;
  CORS_ALLOW_ORIGINS: string[];

  redis: {
    REDIS_URL: string;
    FLUSH_ALL: boolean;
  };
}

dotenv.config();

const config: Config = {
  PORT: Number(process.env.PORT || 8001),
  DEVELOPMENT_MODE:
    (process.env.DEVELOPMENT_MODE as Environment) || "development",

  CORS_ALLOW_ORIGINS: JSON.parse(process.env.ALLOW_ORIGINS_ACCESS || "[]"),

  redis: {
    REDIS_URL: "redis://localhost:6379",
    FLUSH_ALL: false,
  },
};

export default config;

import dotenv from "dotenv";
type Environment = "development" | "production";

interface Config {
  PORT: number;
  DEVELOPMENT_MODE: Environment;
  CORS_ALLOW_ORIGINS: string[];

  rabbitmq: {
    URL: string;
  };
}

dotenv.config();

const config: Config = {
  PORT: Number(process.env.PORT || 8001),

  DEVELOPMENT_MODE:
    (process.env.DEVELOPMENT_MODE as Environment) || "development",

  CORS_ALLOW_ORIGINS: JSON.parse(process.env.ALLOW_ORIGINS_ACCESS || "[]"),

  rabbitmq: {
    URL: "amqp://guest:guest@localhost:5672",
  },
};

export default config;

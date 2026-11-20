import amqp, { Channel, ChannelModel } from "amqplib";
import { red, yellow, magenta } from "colorette";
import config from "./index.config";
import RabbitMQConsumer from "../services/rabbitmq/consumer.service.js";

let connection: ChannelModel;
let channel: Channel | undefined;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(config.rabbitmq.URL);

    console.log(`${magenta("[RabbitMQ]")} Channel created successfully.`);

    connection.on("error", (err) => {
      console.log(`${red("[RabbitMQ]")} Connection error:`, err.message);
    });

    connection.on("close", async () => {
      console.log(`${yellow("[RabbitMQ]")} Connection closed.`);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;

        const delay = Math.min(reconnectAttempts * 500, 2000);

        console.log(
          `${red("[RabbitMQ]")} Reconnecting (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`,
        );

        setTimeout(() => {
          connectRabbitMQ().catch(() => {});
        }, delay);
      } else {
        console.log(
          `${red("[RabbitMQ]")} Max reconnect attempts reached. Exiting...`,
        );
        // process.exit(1);
      }
    });

    channel = await connection.createChannel();

    reconnectAttempts = 0;

    const rabbitmqConsumer = new RabbitMQConsumer();
    rabbitmqConsumer.loadConsumers();

    console.log(`${magenta("[RabbitMQ]")} Connected successfully.`);
  } catch (error: any) {
    console.log(`${red("[RabbitMQ]")} Connection failed:`, error.message);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;

      setTimeout(() => {
        connectRabbitMQ().catch(() => {});
      }, reconnectAttempts * 2000);
    } else {
      //   process.exit(1);
    }

    // throw error;
  }
};

export const getRabbitMQChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel has not been initialized.");
  }

  return channel;
};

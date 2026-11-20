import { queueNames } from "../../constants/rabbitmq.constant";
import { getRabbitMQChannel } from "../../config/rabbitmq.config";
import { cyan } from "colorette";
import logger from "../../config/logger.config";

class RabbitMQConsumer {
  constructor() {}

  loadConsumers(): void {
    console.log(`${cyan("[RabbitMQ]")} Loading consumers`);
    this.emailMessageConsumer();
  }

  private async emailMessageConsumer(): Promise<void> {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(queueNames.mailQueue, {
      durable: false,
    });
    channel.prefetch(2);

    channel.consume(queueNames.mailQueue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - emailMessageConsumer ==> Received message for mail-queue: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error("services - rabbitmq - consumer.service", error);
        // channel.nack(msg);
      }
    });
  }
}

export default RabbitMQConsumer;

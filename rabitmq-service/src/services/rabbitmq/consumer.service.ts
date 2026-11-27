import { queueExchange, queueNames } from "../../constants/rabbitmq.constant";
import { getRabbitMQChannel } from "../../config/rabbitmq.config";
import { cyan } from "colorette";
import logger from "../../config/logger.config";

class RabbitMQConsumer {
  constructor() {}

  loadConsumers(): void {
    console.log(`${cyan("[RabbitMQ]")} Loading consumers`);
    // direct
    this.emailMessageConsumer();
    this.subscribeUserMessageConsumer();

    // topic
    this.orderNotificationMessageConsumer();
    this.paymentNotificationMessageConsumer();

    // fanout
    this.smsNotification();
    this.pushNotification();

    // headers
    this.consumeNewVideoNotification();
    this.consumeLiveStreamNotification();
    this.consumeAnyMatchingNotifications();
  }

  // direct
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
  private async subscribeUserMessageConsumer(): Promise<void> {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(queueNames.subscribeUsersMailQueue, {
      durable: false,
    });
    channel.prefetch(2);

    channel.consume(queueNames.subscribeUsersMailQueue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - subscribeUserMessageConsumer ==> Received message for mail-queue: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - subscribeUserMessageConsumer",
          error,
        );
        // channel.nack(msg);
      }
    });
  }

  // topic
  private async orderNotificationMessageConsumer(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(
      queueExchange.notificationExchangeTopic,
      "topic",
      {
        durable: true,
      },
    );

    await channel.assertQueue(queueNames.orderQueue, { durable: true });

    await channel.bindQueue(
      queueNames.orderQueue,
      queueExchange.notificationExchangeTopic,
      "order.*",
    );

    channel.consume(queueNames.orderQueue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - orderNotificationMessageConsumer ==> Received message for topic: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - orderNotificationMessageConsumer",
          error,
        );
        // channel.nack(msg);
      }
    });
  }

  private async paymentNotificationMessageConsumer(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(
      queueExchange.notificationExchangeTopic,
      "topic",
      {
        durable: true,
      },
    );

    await channel.assertQueue(queueNames.paymentQueue, { durable: true });

    await channel.bindQueue(
      queueNames.paymentQueue,
      queueExchange.notificationExchangeTopic,
      "payment.*",
    );

    channel.consume(queueNames.paymentQueue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - paymentNotificationMessageConsumer ==> Received message for topic: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - paymentNotificationMessageConsumer",
          error,
        );
        // channel.nack(msg);
      }
    });
  }

  // fanout
  private async smsNotification(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(
      queueExchange.newProductLaunchFanout,
      "fanout",
      {
        durable: true,
      },
    );

    const queue = await channel.assertQueue("", { exclusive: true });

    console.log(queue);

    await channel.bindQueue(
      queue.queue,
      queueExchange.newProductLaunchFanout,
      "",
    );

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - smsNotification ==> Received message for fanout: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - smsNotification",
          error,
        );
        // channel.nack(msg);
      }
    });
  }
  private async pushNotification(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(
      queueExchange.newProductLaunchFanout,
      "fanout",
      {
        durable: true,
      },
    );

    const queue = await channel.assertQueue("", { exclusive: true });

    console.log(queue);

    await channel.bindQueue(
      queue.queue,
      queueExchange.newProductLaunchFanout,
      "",
    );

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - pushNotification ==> Received message for fanout: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - pushNotification",
          error,
        );
        // channel.nack(msg);
      }
    });
  }

  // headers
  private async consumeNewVideoNotification(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(queueExchange.headerExchange, "headers", {
      durable: true,
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(queue.queue, queueExchange.headerExchange, "", {
      "x-match": "all",
      "notification-type": "new_video",
      "content-type": "video",
    });

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - consumeNewVideoNotification ==> Received message for headers: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - consumeNewVideoNotification",
          error,
        );
        // channel.nack(msg);
      }
    });
  }
  private async consumeLiveStreamNotification(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(queueExchange.headerExchange, "headers", {
      durable: true,
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(queue.queue, queueExchange.headerExchange, "", {
      "x-match": "all",
      "notification-type": "live_stream",
      "content-type": "gaming",
    });

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - consumeLiveStreamNotification ==> Received message for headers: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - consumeLiveStreamNotification",
          error,
        );
        // channel.nack(msg);
      }
    });
  }
  private async consumeAnyMatchingNotifications(): Promise<void> {
    const channel = await getRabbitMQChannel();
    // creating an exchange
    await channel.assertExchange(queueExchange.headerExchange, "headers", {
      durable: true,
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    await channel.bindQueue(queue.queue, queueExchange.headerExchange, "", {
      "x-match": "any",
      "notification-type-comment": "comment",
      "notification-type-like": "like",
    });

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString()) as any;

        logger.info(
          `consumer.Service - consumeAnyMatchingNotifications ==> Received message for headers: ${JSON.stringify(content)}`,
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(
          "services - rabbitmq - consumer.service - consumeAnyMatchingNotifications",
          error,
        );
        // channel.nack(msg);
      }
    });
  }
}

export default RabbitMQConsumer;

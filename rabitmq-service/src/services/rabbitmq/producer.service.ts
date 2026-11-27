import {
  queueNames,
  queueExchange,
  queueRouting,
} from "../../constants/rabbitmq.constant";
import { getRabbitMQChannel } from "../../config/rabbitmq.config";

import logger from "../../config/logger.config";

class RabbitMQProducer {
  constructor() {}

  // ------------- Direct ---------------
  async mailMessageProducer(data: any): Promise<Boolean> {
    logger.info(
      `producer.service - mailMessageProducer - ==> Sending message for queue: ${queueNames.mailQueue}`,
    );
    const channel = await getRabbitMQChannel();

    // creating an exchange
    await channel.assertExchange(queueExchange.mailExchange, "direct", {
      durable: false,
    });

    // queue creation
    await channel.assertQueue(queueNames.mailQueue, {
      durable: false,
    });

    // creationg queue link to the exhange using routing
    await channel.bindQueue(
      queueNames.mailQueue,
      queueExchange.mailExchange,
      queueRouting.mailKey,
    );

    const published = channel.publish(
      queueExchange.mailExchange,
      queueRouting.mailKey,
      Buffer.from(JSON.stringify(data)),
    );

    if (published) return true;

    return false;
  }

  async mailMessageToSubscribedUsersProducer(data: any): Promise<Boolean> {
    logger.info(
      `producer.service - mailMessageToSubscribedUsersProducer - ==> Sending message for queue: ${queueNames.subscribeUsersMailQueue}`,
    );
    const channel = await getRabbitMQChannel();

    // creating an exchange
    await channel.assertExchange(queueExchange.mailExchange, "direct", {
      durable: false,
    });

    // queue creation
    await channel.assertQueue(queueNames.subscribeUsersMailQueue, {
      durable: false,
    });

    // creationg queue link to the exhange using routing
    await channel.bindQueue(
      queueNames.subscribeUsersMailQueue,
      queueExchange.mailExchange,
      queueRouting.subscribeUserMailKey,
    );

    const published = channel.publish(
      queueExchange.mailExchange,
      queueRouting.subscribeUserMailKey,
      Buffer.from(JSON.stringify(data)),
    );

    if (published) return true;

    return false;
  }

  // -------------- Topic ----------------
  async notificationTopicMessageProducer(
    routingKey: string,
    data: any,
  ): Promise<Boolean> {
    logger.info(
      `producer.service - notificationTopicMessageProducer - ==> Sending message for topic routing queue`,
      routingKey,
    );
    const channel = await getRabbitMQChannel();

    // creating an exchange
    await channel.assertExchange(
      queueExchange.notificationExchangeTopic,
      "topic",
      {
        durable: true,
      },
    );

    const published = channel.publish(
      queueExchange.notificationExchangeTopic,
      routingKey,
      Buffer.from(JSON.stringify(data)),
    );

    if (published) return true;

    return false;
  }

  // ---------------- Fanout----------------
  async announceNewProduct(product: any): Promise<Boolean> {
    logger.info(`producer.service - announceNewProduct `, product);

    const channel = await getRabbitMQChannel();

    // creating an exchange
    await channel.assertExchange(
      queueExchange.newProductLaunchFanout,
      "fanout",
      {
        durable: true,
      },
    );

    // have to ignore the routing key
    const published = channel.publish(
      queueExchange.newProductLaunchFanout,
      "",
      Buffer.from(JSON.stringify(product)),
      { persistent: true },
    );

    if (published) return true;

    return false;
  }

  // ------------- Header --------------------
  async sendNotificationHeaderExchangeProducer(
    header: any,
    message: any,
  ): Promise<boolean> {
    logger.info(
      `producer.service - sendNotificationHeaderExchangeProducer `,
      header,
    );

    const channel = await getRabbitMQChannel();

    // creating a header exchange
    await channel.assertExchange(queueExchange.headerExchange, "headers", {
      durable: true,
    });

    channel.publish(
      queueExchange.headerExchange,
      "",
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        headers: header,
      },
    );

    return true;
  }
}

export default RabbitMQProducer;

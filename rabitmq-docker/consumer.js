const amqplib = require("amqplib");

const runConsumer = async () => {
  try {
    const rabitMqConnection = await amqplib.connect("amqp://localhost");
    const channel = await rabitMqConnection.createChannel();

    const handleNotification = async (queueName) => {
      await channel.assertQueue(queueName, { durable: false });
      channel.prefetch(1);
      await channel.consume(queueName, async (message) => {
        console.log("__________Proccessing_____________");
        console.log(message?.fields);

        await new Promise((resolve) => {
          setTimeout(() => {
            console.log("Processing Finished");
            resolve();
          }, 2000);
        });

        console.log("okk Acknowldge_______");

        channel.ack(message);
      });
    };

    handleNotification("email-queue");
  } catch (error) {
    console.log(error);
  }
};

runConsumer();

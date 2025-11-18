const amqplib = require("amqplib");

const runProducer = async () => {
  try {
    const rabitMqConnection = await amqplib.connect("amqp://localhost");
    const channel = await rabitMqConnection.createChannel();

    const sendNotification = async (queueName, message) => {
      await channel.assertQueue(queueName, { durable: false });
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
      console.log(`Message sent to ${queueName}: ${message}`);
    };

    const emailPayload = {
      to: "receiver@example.com",
      from: "sender@example.com",
      subject: "Sample Email",
      body: "This is a sample email notification",
    };
    for (let i = 0; i < 10; i++) {
      sendNotification("email-queue", emailPayload);
    }

    setTimeout(function () {
      rabitMqConnection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
};

runProducer();

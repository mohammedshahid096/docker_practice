import express, { Application, Request, Response, NextFunction } from "express";
import errorHandling from "./utils/errorHandling.util";
import RabbitMQProducer from "./services/rabbitmq/producer.service";
import { connectRabbitMQ } from "./config/rabbitmq.config";

const app: Application = express();

// configs using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectRabbitMQ();

app.get("/", (_req, res) => {
  const rabbitmqProducer = new RabbitMQProducer();
  rabbitmqProducer.mailMessageProducer({
    to: "test@gmail.com",
    subject: "subject message",
    body: "hello rabbitmq",
  });

  res.send(true);
});

app.get("/subscribe", (_req, res) => {
  const rabbitmqProducer = new RabbitMQProducer();
  rabbitmqProducer.mailMessageToSubscribedUsersProducer({
    to: "test-subscribe@gmail.com",
    subject: "subject subscribe message",
    body: "hello subscribe user rabbitmq",
  });

  res.send(true);
});

app.get("/order", (_req, res) => {
  const rabbitmqProducer = new RabbitMQProducer();
  rabbitmqProducer.notificationTopicMessageProducer("order.placed", {
    orderId: 12345,
    status: "placed",
  });
  res.send(true);
});

app.get("/payment", (_req, res) => {
  const rabbitmqProducer = new RabbitMQProducer();
  rabbitmqProducer.notificationTopicMessageProducer("payment.processed", {
    orderId: 12345,
    status: "proccessed",
  });
  res.send(true);
});

// for fanout
app.get("/new-launch", (_req, res) => {
  const rabbitmqProducer = new RabbitMQProducer();
  rabbitmqProducer.announceNewProduct({
    id: 12345,
    name: "iphone 19 pro max",
    price: 20000,
  });
  res.send(true);
});

// error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  errorHandling.handlingAppError(err, res);
});

export default app;

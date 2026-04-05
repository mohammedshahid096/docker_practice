import express, { Application, Request, Response, NextFunction } from "express";
import compressionConfig from "./src/configs/compression.config.js";
import corsConfig from "./src/configs/cors.config.js";
import helmetConfig from "./src/configs/helmet.config.js";
import ratelimitConfig from "./src/configs/ratelimit.config.js";
import { addEmailJob } from "./src/queue/email.queue.js";
import errorHandling from "./src/utils/errorHandling.util.js";
import emailWorker from "./src/queue/email.worker.js";

const app: Application = express();

// configs using middlewares
app.use(ratelimitConfig);
app.use(compressionConfig);
app.use(express.json());
app.use(helmetConfig);
app.use(corsConfig);
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  addEmailJob({
    body: "hello",
    to: "test@gamil.com",
  });
  res.send(true);
});

emailWorker();

// error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  errorHandling.handlingAppError(err, res);
});

export default app;

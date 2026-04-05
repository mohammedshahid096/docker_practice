import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { queueNames } from "../configs/queue.config.js";

function start() {
  const connection = new Redis({ maxRetriesPerRequest: null });
  const emailWorker = new Worker(
    queueNames.emailQueue,
    async (job: Job) => {
      console.log(`Processing job ${job.id} for ${job.data.to}`);
      console.log(job.name);

      // Your actual logic here (e.g., calling Nodemailer)
      // await sendMail(job.data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { status: "completed" };
    },
    { connection: connection as any, concurrency: 1 },
  );

  emailWorker.on("ready", () => {
    console.log("Worker is connected and ready to receive jobs");
  });

  emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`${job?.id} has failed with ${err.message}`);
  });

  emailWorker.on("error", (error) => {
    console.log(error);
  });
}

export default start;

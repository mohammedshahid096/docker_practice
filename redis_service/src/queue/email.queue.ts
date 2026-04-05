import { Queue } from "bullmq";
import redis from "../configs/redis.config.js";
import { emailQueueJobs, queueNames } from "../configs/queue.config.js";

// Create a specific queue for emails
export const emailQueue = new Queue(queueNames.emailQueue, {
  connection: redis as any,
});

export const addEmailJob = async (data: { to: string; body: string }) => {
  await emailQueue.add(emailQueueJobs.verificationEmail, data, {
    attempts: 3,
    removeOnComplete: true,
    // backoff: { type: "exponential", delay: 1000 },
  });
};

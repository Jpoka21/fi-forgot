import app from "./app";
import { logger } from "./lib/logger";
import { sendPendingReminderEmails } from "./routes/approval";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function getAppBaseUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0].trim()}`;
  const dev = process.env["REPLIT_DEV_DOMAIN"];
  if (dev) return `https://${dev}`;
  return `http://localhost:${port}`;
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Daily reminder cron — check every hour, send if 24h have elapsed since last reminder
  const ONE_HOUR_MS = 60 * 60 * 1000;
  setInterval(async () => {
    try {
      await sendPendingReminderEmails(getAppBaseUrl());
    } catch (err) {
      logger.error({ err }, "Reminder cron failed");
    }
  }, ONE_HOUR_MS);
});

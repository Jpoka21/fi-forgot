import { assertQualificationApiEnvironment, isBrainQualificationMode } from "./qualification/mode";

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
assertQualificationApiEnvironment();
const {installRuntimeContainment}=await import("./qualification/runtime-containment");installRuntimeContainment();
const { logger } = await import("./lib/logger");
const { default: app } = await import("./app");
const qualificationMode=isBrainQualificationMode();
const host=qualificationMode?"127.0.0.1":undefined;

function getAppBaseUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0].trim()}`;
  const dev = process.env["REPLIT_DEV_DOMAIN"];
  if (dev) return `https://${dev}`;
  return `http://localhost:${port}`;
}

const onListen=(err?:Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if(qualificationMode){logger.info({port,host},"Qualification server listening; schedulers disabled");return;}
  const ONE_HOUR_MS = 60 * 60 * 1000;

  // Personal reminder cron — check every hour
  setInterval(async () => {
    try {
      const {sendPendingReminderEmails}=await import("./routes/approval");
      await sendPendingReminderEmails(getAppBaseUrl());
    } catch (err) {
      logger.error({ err }, "Reminder cron failed");
    }
  }, ONE_HOUR_MS);

  // Business scheduler cron — check every hour
  setInterval(async () => {
    try {
      const {runBusinessScheduler}=await import("./services/business-scheduler");
      await runBusinessScheduler(getAppBaseUrl());
    } catch (err) {
      logger.error({ err }, "Business scheduler cron failed");
    }
  }, ONE_HOUR_MS);
};
const server=host?app.listen(port,host,onListen):app.listen(port,onListen);
if(qualificationMode){
  let stopping=false;
  process.on('message',message=>{
    if(message!=='brain-qualification-stop'||stopping)return;
    stopping=true;
    server.close(async error=>{
      try{const {pool}=await import('@workspace/db');await pool.end();process.exit(error?1:0);}
      catch{process.exit(1);}
    });
    server.closeIdleConnections();
  });
}

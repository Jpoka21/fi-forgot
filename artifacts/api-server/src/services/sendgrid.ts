// SendGrid integration — Replit connector: conn_sendgrid_01KFE3WW7XSR12W0WRZNGN6K3A
import sgMail from "@sendgrid/mail";
import { logger } from "../lib/logger";

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const replIdentity = process.env["REPL_IDENTITY"];
  const webReplRenewal = process.env["WEB_REPL_RENEWAL"];

  const xReplitToken = replIdentity
    ? `repl ${replIdentity}`
    : webReplRenewal
      ? `depl ${webReplRenewal}`
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error("SendGrid: Replit connector env vars not available");
  }

  const data = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=sendgrid`,
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    },
  )
    .then((r) => r.json())
    .then((d: { items?: { settings?: { api_key?: string; from_email?: string } }[] }) => d.items?.[0]);

  const apiKey = data?.settings?.api_key;
  const fromEmail = data?.settings?.from_email;

  if (!apiKey || !fromEmail) {
    throw new Error("SendGrid not connected — missing api_key or from_email");
  }

  return { apiKey, fromEmail };
}

export async function sendApprovalReminderEmail(opts: {
  customerEmail: string;
  customerName: string;
  recipientName: string;
  eventType: string;
  scheduledMailDate: string;
  messageText: string;
  dashboardUrl: string;
  isFirstSend: boolean;
  isFinalWarning?: boolean;
}): Promise<void> {
  const { apiKey, fromEmail } = await getCredentials();
  sgMail.setApiKey(apiKey);

  const firstName = opts.customerName.split(" ")[0];
  const subject = opts.isFirstSend
    ? `Your ${opts.eventType} card for ${opts.recipientName} is ready — take a look`
    : opts.isFinalWarning
      ? `Last chance: your ${opts.eventType} card for ${opts.recipientName} goes out tomorrow`
      : `Reminder: your ${opts.eventType} card for ${opts.recipientName} still needs your OK`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F8EEDC;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8EEDC;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#071A33;padding:28px 36px;border-radius:12px 12px 0 0;">
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#D8A725;letter-spacing:-0.5px;">
              "F" I Forgot
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;font-family:Arial,sans-serif;">
              Your relationship autopilot
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">
            <p style="margin:0 0 16px;font-size:17px;color:#071A33;font-family:Arial,sans-serif;">
              Hey ${firstName},
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;font-family:Arial,sans-serif;">
              ${opts.isFinalWarning
                ? `This is your last chance. The ${opts.eventType} card for <strong>${opts.recipientName}</strong> goes out <strong>tomorrow, ${opts.scheduledMailDate}</strong>. If you don't approve today, we'll send a safe generic message instead — no personal details, no mistakes, but also none of your personality.`
                : `We wrote the ${opts.eventType} card for <strong>${opts.recipientName}</strong> and it's ready for your eyes. We need your green light before we mail it — it goes out <strong>${opts.scheduledMailDate}</strong>.`}
            </p>

            <!-- Card preview -->
            <div style="background:#F8EEDC;border:1px solid #d4c5a9;border-radius:10px;padding:24px 28px;margin:0 0 28px;">
              <div style="font-size:10px;font-family:Arial,sans-serif;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
                Card message
              </div>
              <div style="font-size:15px;color:#071A33;line-height:1.8;white-space:pre-wrap;font-family:Georgia,serif;">
${opts.messageText}
              </div>
            </div>

            <p style="margin:0 0 24px;font-size:14px;color:#666;font-family:Arial,sans-serif;line-height:1.5;">
              If it looks good, hit approve. If you want any changes — funnier, more sentimental, mention that camping trip — just tell us and we'll rewrite it.
            </p>

            <!-- CTA -->
            <div style="text-align:center;margin:0 0 8px;">
              <a href="${opts.dashboardUrl}" style="display:inline-block;background:#071A33;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                Review &amp; Approve Your Card →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f0e8;padding:20px 36px;border-radius:0 0 12px 12px;border:1px solid #e8dcc8;border-top:none;">
            <p style="margin:0;font-size:12px;color:#999;font-family:Arial,sans-serif;line-height:1.5;">
              You're receiving this because you're a "F" I Forgot subscriber. You'll get a reminder every day until you approve. 
              To stop reminders, just approve or request changes from your dashboard.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  await sgMail.send({
    to: opts.customerEmail,
    from: fromEmail,
    subject,
    html,
  });

  logger.info({ to: opts.customerEmail, eventType: opts.eventType }, "Approval reminder email sent");
}

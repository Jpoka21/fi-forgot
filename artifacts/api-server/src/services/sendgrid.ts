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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function sendDemoEmail(opts: {
  email: string;
  recipientName: string;
  relationship: string;
  appUrl: string;
}): Promise<void> {
  const { apiKey, fromEmail } = await getCredentials();
  sgMail.setApiKey(apiKey);

  const editUrl = `${opts.appUrl}/signup?demo=true&recipientName=${encodeURIComponent(opts.recipientName)}&relationship=${encodeURIComponent(opts.relationship)}`;

  const sampleMessage = `Dear ${escapeHtml(opts.recipientName)},\n\nI just wanted to take a moment to say how much you mean to me. Life moves quickly, and sometimes we don&#x27;t say the important things often enough. You&#x27;ve made a real difference in my life, and I&#x27;m grateful for the memories, support, laughter, and moments we&#x27;ve shared.\n\nThis card is just a sample so you can see how everything works. You can edit this message, change the tone, make it more personal, choose a different design, regenerate the wording, approve it, or start over completely.\n\n&mdash; [Your Name]`;

  const subject = `Your sample card for ${opts.recipientName} is ready`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2E6D3;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E6D3;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <tr><td style="background:#111111;padding:24px 32px;border-radius:10px 10px 0 0;">
    <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:Arial Black,Arial,sans-serif;">F*I FORGOT</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:3px;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">Relationship Damage Control</div>
  </td></tr>

  <tr><td style="background:#E23B2E;padding:8px 32px;text-align:center;">
    <span style="font-size:11px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">SAMPLE CARD &mdash; Nothing is printed or mailed</span>
  </td></tr>

  <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">

    <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">
      Hi,<br><br>
      We created a sample card for <strong style="color:#111;">${escapeHtml(opts.recipientName)}</strong>, your ${escapeHtml(opts.relationship.toLowerCase())}, so you can see how this works.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f3eb;border-radius:8px;margin-bottom:8px;border:1px solid #e0d5c0;">
      <tr><td style="padding:28px 28px 20px;text-align:center;">
        <div style="font-size:10px;color:#c4966a;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:bold;font-family:Arial,sans-serif;">SAMPLE CARD</div>
        <div style="font-size:19px;color:#3d2b1f;font-weight:bold;line-height:1.2;font-family:Georgia,serif;margin-bottom:20px;">The &#x27;I Actually Remembered&#x27; Card</div>
        <div style="font-size:15px;color:#3d2b1f;line-height:1.9;white-space:pre-line;font-family:Georgia,serif;text-align:left;">${sampleMessage}</div>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#b0a090;text-align:center;margin:0 0 28px;font-family:Arial,sans-serif;">This is a sample. You can change the message, design, tone, or start over.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td align="center">
        <a href="${editUrl}" style="display:inline-block;background:#111111;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:16px 36px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Edit This Sample Card &rarr;</a>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f6;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:bold;font-family:Arial,sans-serif;">This is just a demo</div>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
          This demo is simple on purpose. The real version asks a few more questions to get to know your recipient — their personality, the occasion, and your relationship. We use those answers to choose the right card from hundreds of options in our inventory and write a message that actually sounds like you.
        </p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr><td align="center">
        <a href="${opts.appUrl}/signup" style="display:inline-block;background:#E23B2E;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:6px;text-decoration:none;">Ready to make a real card? Sign up &rarr;</a>
      </td></tr>
    </table>
    <p style="text-align:center;font-size:12px;color:#aaa;margin:0;font-family:Arial,sans-serif;line-height:1.5;">Nothing in this demo is printed, purchased, or mailed to anyone.</p>

  </td></tr>

  <tr><td style="background:#F2E6D3;padding:16px 32px;border-radius:0 0 10px 10px;border:1px solid #e8dcc8;border-top:none;">
    <p style="margin:0;font-size:11px;color:#aaa;text-align:center;font-family:Arial,sans-serif;">You asked for this demo email. We won&#x27;t contact you again unless you sign up.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`.trim();

  const plainMessage = `Dear ${opts.recipientName},\n\nI just wanted to take a moment to say how much you mean to me. Life moves quickly, and sometimes we don't say the important things often enough. You've made a real difference in my life, and I'm grateful for the memories, support, laughter, and moments we've shared.\n\nThis card is just a sample so you can see how everything works. You can edit this message, change the tone, make it more personal, choose a different design, regenerate the wording, approve it, or start over completely.\n\n— [Your Name]`;

  const text = `F.I. FORGOT — SAMPLE CARD DEMO
================================
Nothing in this demo is printed, purchased, or mailed to anyone.

Hi,

We created a sample card for ${opts.recipientName}, your ${opts.relationship.toLowerCase()}, so you can see how this works.

---
SAMPLE CARD: The 'I Actually Remembered' Card
---

${plainMessage}

---

Edit this sample card: ${editUrl}

THIS IS JUST A DEMO
The real version asks a few more questions to get to know your recipient — their personality, the occasion, and your relationship. We use those answers to choose the right card from hundreds of options and write a message that actually sounds like you.

Ready to make a real card? Sign up: ${opts.appUrl}/signup

---
Nothing in this demo is printed, purchased, or mailed to anyone.
You asked for this demo email. We won't contact you again unless you sign up.`;

  await sgMail.send({
    to: opts.email,
    from: fromEmail,
    subject,
    html,
    text,
  });

  logger.info({ to: opts.email, recipientName: opts.recipientName, relationship: opts.relationship }, "Demo email sent");
}

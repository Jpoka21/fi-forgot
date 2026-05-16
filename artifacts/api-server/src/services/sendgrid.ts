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
  recipientType: string;
  occasionType: string;
  vibe: string;
  messageText: string;
  card: { bgColor: string; titleColor: string; accentColor: string; title: string; seriesLabel: string };
  cardWhy: string;
  appUrl: string;
  marketingConsent: boolean;
}): Promise<void> {
  const { apiKey, fromEmail } = await getCredentials();
  sgMail.setApiKey(apiKey);

  const subject = `Demo: Your ${opts.occasionType} card for ${opts.recipientType} is ready. Approve it or fix it.`;

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

  <tr><td style="background:#E23B2E;padding:10px 32px;text-align:center;">
    <span style="font-size:11px;font-weight:bold;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">
      &#9888; DEMO &mdash; No card will be printed, purchased, mailed, or sent to anyone.
    </span>
  </td></tr>

  <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">

    <p style="margin:0 0 6px;font-size:16px;color:#111111;font-weight:bold;font-family:Arial,sans-serif;">Hey,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;font-family:Arial,sans-serif;">
      F.I. Forgot caught this one before you became Dave.<br>Your sample card is ready. This is exactly how it works before anything gets mailed.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E6D3;border-radius:8px;margin-bottom:24px;border:1px solid #d9cdb8;">
      <tr><td style="padding:18px 22px;">
        <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;font-weight:bold;font-family:Arial,sans-serif;">Your Fake Emergency</div>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="font-size:13px;color:#6B6B6B;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Recipient</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.recipientType)}</td></tr>
          <tr><td style="font-size:13px;color:#6B6B6B;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Occasion</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.occasionType)}</td></tr>
          <tr><td style="font-size:13px;color:#6B6B6B;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Vibe</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.vibe)}</td></tr>
          <tr><td style="font-size:13px;color:#6B6B6B;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Status</td><td style="font-size:13px;color:#E23B2E;font-weight:600;font-family:Arial,sans-serif;">Demo &mdash; not mailed, not real, very educational.</td></tr>
        </table>
      </td></tr>
    </table>

    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:bold;font-family:Arial,sans-serif;">Card We Picked</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr><td style="background:${opts.card.bgColor};border-radius:8px;padding:28px 24px;text-align:center;">
        <div style="font-size:10px;color:${opts.card.accentColor};text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;font-weight:bold;font-family:Arial,sans-serif;">${escapeHtml(opts.card.seriesLabel)}</div>
        <div style="font-size:20px;color:${opts.card.titleColor};font-weight:bold;line-height:1.2;font-family:Georgia,serif;margin-bottom:14px;">${escapeHtml(opts.card.title)}</div>
        <span style="display:inline-block;border:1px solid ${opts.card.accentColor};border-radius:3px;padding:3px 10px;font-size:10px;color:${opts.card.accentColor};letter-spacing:1px;font-family:Arial,sans-serif;">DEMO CARD</span>
      </td></tr>
    </table>
    <div style="font-size:13px;color:#6B6B6B;line-height:1.5;padding-top:10px;border-top:1px solid #f0e8d8;font-family:Arial,sans-serif;margin-bottom:22px;">
      <strong style="color:#111111;">Why this card:</strong> ${escapeHtml(opts.cardWhy)}
    </div>

    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:bold;font-family:Arial,sans-serif;">Message We Wrote</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:#F2E6D3;border-radius:8px;border:1px solid #d9cdb8;padding:22px 24px;font-size:15px;color:#111111;line-height:1.8;white-space:pre-wrap;font-family:Georgia,serif;">${escapeHtml(opts.messageText)}</td></tr>
    </table>

    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;font-weight:bold;font-family:Arial,sans-serif;">Your Move</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td><a href="${opts.appUrl}/signup?demo=true&action=approve" style="display:block;background:#111111;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:14px 20px;border-radius:6px;text-decoration:none;text-align:center;">&#10003;&nbsp; Approve Card &mdash; Send It</a></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td style="width:49%;padding-right:4px;"><a href="${opts.appUrl}/signup?demo=true&action=edit-message" style="display:block;background:#f5f5f5;color:#111111;font-family:Arial,sans-serif;font-size:13px;font-weight:600;padding:12px 8px;border-radius:6px;text-decoration:none;text-align:center;border:1px solid #e0e0e0;">&#9999; Edit Message</a></td>
        <td style="width:49%;padding-left:4px;"><a href="${opts.appUrl}/signup?demo=true&action=change-card" style="display:block;background:#f5f5f5;color:#111111;font-family:Arial,sans-serif;font-size:13px;font-weight:600;padding:12px 8px;border-radius:6px;text-decoration:none;text-align:center;border:1px solid #e0e0e0;">&#127183; Change Card Style</a></td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td><a href="${opts.appUrl}/signup?demo=true&action=questions" style="display:block;background:#f5f5f5;color:#111111;font-family:Arial,sans-serif;font-size:13px;font-weight:600;padding:12px;border-radius:6px;text-decoration:none;text-align:center;border:1px solid #e0e0e0;">&#128172; Answer a Few Extra Questions</a></td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f6;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 22px;">
        <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;font-weight:bold;font-family:Arial,sans-serif;">How This Works in Real Life</div>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">1.</td><td style="padding:3px 0;font-size:13px;color:#444;font-family:Arial,sans-serif;">We remember the date.</td></tr>
          <tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">2.</td><td style="padding:3px 0;font-size:13px;color:#444;font-family:Arial,sans-serif;">We pick the card.</td></tr>
          <tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">3.</td><td style="padding:3px 0;font-size:13px;color:#444;font-family:Arial,sans-serif;">We write the message.</td></tr>
          <tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">4.</td><td style="padding:3px 0;font-size:13px;color:#444;font-family:Arial,sans-serif;">You approve it or fix it.</td></tr>
          <tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">5.</td><td style="padding:3px 0;font-size:13px;color:#444;font-family:Arial,sans-serif;">Then we mail it. Before Dave ruins everything.</td></tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr><td align="center"><a href="${opts.appUrl}/signup" style="display:inline-block;background:#E23B2E;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:14px 36px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">Start the Real Thing &rarr;</a></td></tr>
    </table>
    <p style="text-align:center;font-size:12px;color:#999;margin:0;font-family:Arial,sans-serif;line-height:1.5;">No actual moms, wives, girlfriends, anniversaries, or dinner reservations were harmed in this demo.</p>

  </td></tr>

  <tr><td style="background:#F2E6D3;padding:18px 32px;border-radius:0 0 10px 10px;border:1px solid #e8dcc8;border-top:none;">
    <p style="margin:0 0 6px;font-size:11px;color:#999;text-align:center;font-family:Arial,sans-serif;font-weight:bold;">&#9888; THIS IS A DEMO. No card will be printed, purchased, mailed, or sent to anyone.</p>
    <p style="margin:0;font-size:11px;color:#aaa;text-align:center;font-family:Arial,sans-serif;">${opts.marketingConsent ? "You opted in to receive occasional marketing emails from F.I. Forgot." : "You only asked for this demo email. We won&#x27;t contact you again unless you sign up."}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`.trim();

  const text = `F.I. FORGOT — DEMO EMAIL
========================
THIS IS A DEMO. No card will be printed, purchased, mailed, or sent to anyone.

Hey,

F.I. Forgot caught this one before you became Dave.
Your sample card is ready. This is exactly how it works before anything gets mailed.

YOUR FAKE EMERGENCY:
- Recipient: ${opts.recipientType}
- Occasion: ${opts.occasionType}
- Vibe: ${opts.vibe}
- Status: Demo — not mailed, not real, very educational.

CARD WE PICKED: ${opts.card.title}
Why this card: ${opts.cardWhy}

MESSAGE WE WROTE:
${opts.messageText}

YOUR MOVE:
- Approve Card: ${opts.appUrl}/signup?demo=true&action=approve
- Edit Message: ${opts.appUrl}/signup?demo=true&action=edit-message
- Change Card Style: ${opts.appUrl}/signup?demo=true&action=change-card
- Answer Extra Questions: ${opts.appUrl}/signup?demo=true&action=questions

HOW THIS WORKS IN REAL LIFE:
1. We remember the date.
2. We pick the card.
3. We write the message.
4. You approve it or fix it.
5. Then we mail it. Before Dave ruins everything.

Start the real thing: ${opts.appUrl}/signup

---
THIS IS A DEMO. No card will be printed, purchased, mailed, or sent to anyone.
${opts.marketingConsent ? "You opted in to receive occasional marketing emails from F.I. Forgot." : "You only asked for this demo email. We won't contact you again unless you sign up."}`;

  await sgMail.send({
    to: opts.email,
    from: fromEmail,
    subject,
    html,
    text,
  });

  logger.info({ to: opts.email, recipientType: opts.recipientType, occasionType: opts.occasionType }, "Demo email sent");
}

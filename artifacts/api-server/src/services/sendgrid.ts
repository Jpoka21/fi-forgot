// Email service — using Resend (RESEND_API_KEY secret)
// Keeping file named sendgrid.ts to avoid changing imports elsewhere
import { Resend } from "resend";
import { logger } from "../lib/logger";
import { listHandwryttenCards } from "./handwrytten";

function getResend(): Resend {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env["RESEND_FROM_EMAIL"] ?? "onboarding@resend.dev";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Card selection ──────────────────────────────────────────────────────────

type CardConfig = {
  bgColor: string;
  titleColor: string;
  accentColor: string;
  borderColor: string;
  title: string;
  seriesLabel: string;
  whyChosen: string;
};

function pickCard(occasion: string, personality: string, relationship: string): CardConfig {
  const isFunny = personality.includes("Funny");
  const isSpouse = relationship.includes("Spouse") || relationship.includes("Partner");

  if (occasion.includes("Birthday")) {
    if (isFunny) return {
      bgColor: "#111827", titleColor: "#f9fafb", accentColor: "#E23B2E",
      borderColor: "#374151", seriesLabel: "BIRTHDAY COLLECTION",
      title: "The &#x27;Happy Birthday, You&#x27;re Still My Favorite&#x27; Card",
      whyChosen: `${personality.split(" ")[0]} people respond to humor over sentimentality — so we went dry and warm instead of flowery. This card gets a laugh without sacrificing the heart behind it.`,
    };
    return {
      bgColor: "#f5ede0", titleColor: "#3d2b1f", accentColor: "#c4966a",
      borderColor: "#e0d5c0", seriesLabel: "BIRTHDAY COLLECTION",
      title: "The &#x27;You Deserve to Feel This Celebrated&#x27; Card",
      whyChosen: `For a ${personality.split(" ")[0].toLowerCase()} ${relationship.toLowerCase()}, we pulled from our warm birthday collection and avoided the generic "have a great day" territory entirely. This one lands.`,
    };
  }

  if (occasion.includes("Anniversary")) {
    if (isFunny) return {
      bgColor: "#2d1b2e", titleColor: "#f0d4e8", accentColor: "#c4966a",
      borderColor: "#4a2d4a", seriesLabel: "ANNIVERSARY COLLECTION",
      title: "The &#x27;Still Here, Still Choosing You&#x27; Card",
      whyChosen: `You described your ${relationship.toLowerCase()} as ${personality.toLowerCase()} — so we balanced the romance with a little self-awareness. Anniversaries don't have to be serious to be meaningful.`,
    };
    return {
      bgColor: "#1a0a0f", titleColor: "#f2d4d7", accentColor: "#c4966a",
      borderColor: "#3d1a24", seriesLabel: "ANNIVERSARY COLLECTION",
      title: "The &#x27;I&#x27;d Do It All Again&#x27; Card",
      whyChosen: `For a ${personality.split(" ")[0].toLowerCase()} ${relationship.toLowerCase()} on an anniversary, we went deep instead of decorative. This card says something real.`,
    };
  }

  if (occasion.includes("Thank")) {
    return {
      bgColor: "#f0f4f0", titleColor: "#1a2e1a", accentColor: "#5a8a5a",
      borderColor: "#d4e8d4", seriesLabel: "GRATITUDE COLLECTION",
      title: "The &#x27;You Didn&#x27;t Have To, But You Did&#x27; Card",
      whyChosen: `Thank you cards fail when they feel obligatory. We picked this one because it acknowledges the choice they made — not just the act. That specificity is what makes it land.`,
    };
  }

  if (occasion.includes("Holiday")) {
    if (isFunny) return {
      bgColor: "#1a2e1a", titleColor: "#d4edda", accentColor: "#6abf69",
      borderColor: "#2d4a2d", seriesLabel: "HOLIDAY COLLECTION",
      title: "The &#x27;Happy Whatever You&#x27;re Celebrating&#x27; Card",
      whyChosen: `Holiday cards are notoriously generic. For a ${personality.toLowerCase()} ${relationship.toLowerCase()}, we chose something that pokes fun at the season without losing the warmth.`,
    };
    return {
      bgColor: "#0f1f0f", titleColor: "#c8e6c8", accentColor: "#81c784",
      borderColor: "#1a3a1a", seriesLabel: "HOLIDAY COLLECTION",
      title: "The &#x27;This Season, Especially You&#x27; Card",
      whyChosen: `Holiday cards work best when they single someone out instead of broadcasting to everyone. For your ${relationship.toLowerCase()}, we made this one feel personal even in a crowded season.`,
    };
  }

  // Just Because / Thinking of You — default
  if (isFunny) return {
    bgColor: "#1e2d1e", titleColor: "#d4edda", accentColor: "#6abf69",
    borderColor: "#2d4a2d", seriesLabel: "JUST BECAUSE COLLECTION",
    title: "The &#x27;No Reason, Just Wanted You to Know&#x27; Card",
    whyChosen: `"Just because" cards are the hardest to pull off without feeling random. For a ${personality.toLowerCase()} ${relationship.toLowerCase()}, we went light and genuine — no occasion needed.`,
  };
  return {
    bgColor: "#f5ede0", titleColor: "#3d2b1f", accentColor: "#c4966a",
    borderColor: "#e0d5c0", seriesLabel: "JUST BECAUSE COLLECTION",
    title: "The &#x27;I Was Thinking About You&#x27; Card",
    whyChosen: `Sometimes the most meaningful card has no occasion at all. For your ${relationship.toLowerCase()}, we chose something that feels intentional — not like you just remembered to send something.`,
  };
}

// ─── Message generation ───────────────────────────────────────────────────────

function writeMessage(name: string, relationship: string, occasion: string, personality: string): string {
  const isFunny = personality.includes("Funny");
  const isSentimental = personality.includes("Sentimental") || personality.includes("Warm");
  const isSpouse = relationship.includes("Spouse") || relationship.includes("Partner");
  const isParent = relationship.includes("Parent");
  const isFriend = relationship.includes("Friend");

  if (occasion.includes("Birthday")) {
    if (isFunny && isSpouse) return `Dear ${name},\n\nHappy birthday. You're older now.\n\nI'm choosing not to elaborate. The fact that I remembered should count for something.\n\nLove,\n[Your Name]`;
    if (isFunny && isFriend) return `Dear ${name},\n\nAnother year. Another reason to remind you that you keep somehow getting better while the rest of us are just getting older.\n\nHappy birthday. Don't do the math.\n\n[Your Name]`;
    if (isFunny) return `Dear ${name},\n\nHappy birthday. You've officially been on this earth long enough that I felt the need to acknowledge it in writing.\n\nThat's how you know it's serious.\n\n[Your Name]`;
    if (isSentimental && isSpouse) return `Dear ${name},\n\nYour birthday is one of those days that makes me stop and think about how lucky I am. Not in a greeting-card way — genuinely lucky.\n\nI hope this year gives you back everything you pour into the people around you.\n\nLove,\n[Your Name]`;
    if (isSentimental && isParent) return `Dear ${name},\n\nI don't say this enough — but everything I know about showing up for the people I love, I learned from watching you.\n\nHappy birthday.\n\n[Your Name]`;
    if (isSentimental && isFriend) return `Dear ${name},\n\nNot everyone gets to have a person like you in their corner. I'm lucky I do.\n\nHappy birthday.\n\n[Your Name]`;
    return `Dear ${name},\n\nHappy birthday. Wishing you a year that matches the kind of person you are — which means it's going to be a good one.\n\n[Your Name]`;
  }

  if (occasion.includes("Anniversary")) {
    if (isFunny && isSpouse) return `Dear ${name},\n\nAnother year. Still haven't figured out how to get rid of you.\n\nHappy anniversary. (I mean that in the best possible way.)\n\nLove,\n[Your Name]`;
    if (isFunny) return `Dear ${name},\n\nHappy anniversary. Against all odds and reasonable expectations, here we are.\n\nChoosing you again. Obviously.\n\n[Your Name]`;
    if (isSpouse) return `Dear ${name},\n\nI don't mark anniversaries with big gestures. I mark them by thinking: I'd choose this again.\n\nHappy anniversary.\n\nLove,\n[Your Name]`;
    return `Dear ${name},\n\nSome things just get better the longer they last. You're one of them.\n\nHappy anniversary.\n\n[Your Name]`;
  }

  if (occasion.includes("Thank")) {
    if (isFunny) return `Dear ${name},\n\nYou didn't have to do what you did. And yet. Here we are.\n\nThank you. I owe you one. (Or several.)\n\n[Your Name]`;
    return `Dear ${name},\n\nYou didn't have to do what you did — but that's exactly the kind of person you are.\n\nThank you. Really.\n\n[Your Name]`;
  }

  if (occasion.includes("Holiday")) {
    if (isFunny) return `Dear ${name},\n\nHappy holidays. May your season be everything you deserve — which, in your case, means excellent.\n\n[Your Name]`;
    return `Dear ${name},\n\nThis time of year always makes me think about the people who make my life better just by being in it.\n\nYou're one of them.\n\nHappy holidays.\n\n[Your Name]`;
  }

  // Just Because / Thinking of You
  if (isFunny) return `Dear ${name},\n\nNo occasion. No reason. Just thought of you and figured you should know.\n\n(You're welcome.)\n\n[Your Name]`;
  if (isSentimental) return `Dear ${name},\n\nNo special occasion. I just found myself thinking about you and decided that was worth saying.\n\nHope you're doing well.\n\n[Your Name]`;
  return `Dear ${name},\n\nWanted you to know you were on my mind.\n\nHope this finds you well.\n\n[Your Name]`;
}

// ─── Mock pre-occasion questions ──────────────────────────────────────────────

function mockCheckinQuestions(occasion: string, personality: string, name: string): string {
  if (occasion.includes("Birthday")) return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${escapeHtml(name)}'s birthday is coming up in 2 weeks.</strong> Before we write the card, just two quick things:<br><br>
      <strong style="color:#111;">1. Anything significant happen this year worth mentioning?</strong><br>
      <span style="color:#666;">(New job, a trip together, something they accomplished, a tough stretch they got through, etc.)</span><br><br>
      <strong style="color:#111;">2. Last year you went ${personality.includes("Funny") ? "funny" : "heartfelt"} — want to switch it up or stick with it?</strong><br><br>
      Hit reply with a sentence or two. We'll take it from there.
    </div>`;

  if (occasion.includes("Anniversary")) return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>Your anniversary with ${escapeHtml(name)} is 2 weeks away.</strong> Two quick questions before we write the card:<br><br>
      <strong style="color:#111;">1. Anything you want to reference from this past year?</strong><br>
      <span style="color:#666;">(A trip, a challenge you navigated together, a milestone, a running joke, anything.)</span><br><br>
      <strong style="color:#111;">2. Tone check — sentimental, playful, or somewhere in the middle?</strong><br><br>
      One or two sentences is plenty. We'll handle the rest.
    </div>`;

  return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>We're getting ${escapeHtml(name)}'s card ready.</strong> One quick thing before we write it:<br><br>
      <strong style="color:#111;">Is there anything specific you want this card to say or reference?</strong><br>
      <span style="color:#666;">(Even one detail — a shared moment, something they're going through, anything that makes it feel personal.)</span><br><br>
      Hit reply with whatever comes to mind. We'll make it work.
    </div>`;
}

// ─── Handwrytten card image lookup ────────────────────────────────────────────

async function fetchCardImageForOccasion(occasion: string): Promise<string | null> {
  try {
    const category = occasion.includes("Birthday") ? "Birthday"
      : occasion.includes("Anniversary") ? "Anniversary"
      : occasion.includes("Holiday") ? "Holiday"
      : occasion.includes("Thank") ? "Thank You"
      : undefined;
    const cards = await listHandwryttenCards(category);
    const withImage = cards.filter(c => c.imageUrl);
    return withImage[0]?.imageUrl ?? null;
  } catch (err) {
    logger.warn({ err }, "Could not fetch Handwrytten card image for demo email");
    return null;
  }
}

// ─── Approval reminder email ──────────────────────────────────────────────────

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
  const resend = getResend();
  const fromEmail = getFromEmail();
  const firstName = opts.customerName.split(" ")[0];

  const subject = opts.isFirstSend
    ? `Your ${opts.eventType} card for ${opts.recipientName} is ready — take a look`
    : opts.isFinalWarning
      ? `Last chance: your ${opts.eventType} card for ${opts.recipientName} goes out tomorrow`
      : `Reminder: your ${opts.eventType} card for ${opts.recipientName} still needs your OK`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2E6D3;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E6D3;padding:40px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
  <tr><td style="background:#111111;padding:28px 36px;border-radius:12px 12px 0 0;">
    <div style="font-family:Arial Black,Arial,sans-serif;font-size:20px;font-weight:900;color:#ffffff;letter-spacing:2px;">F*I FORGOT</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:3px;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Relationship Damage Control</div>
  </td></tr>
  <tr><td style="background:#ffffff;padding:36px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">
    <p style="margin:0 0 16px;font-size:17px;color:#111111;font-family:Arial,sans-serif;">Hey ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;font-family:Arial,sans-serif;">
      ${opts.isFinalWarning
        ? `This is your last chance. The ${escapeHtml(opts.eventType)} card for <strong>${escapeHtml(opts.recipientName)}</strong> goes out <strong>tomorrow, ${escapeHtml(opts.scheduledMailDate)}</strong>. Approve today or we'll send a safe fallback message.`
        : `We wrote the ${escapeHtml(opts.eventType)} card for <strong>${escapeHtml(opts.recipientName)}</strong> and it's ready. We need your green light before it ships — it goes out <strong>${escapeHtml(opts.scheduledMailDate)}</strong>.`}
    </p>
    <div style="background:#F2E6D3;border:1px solid #d9cdb8;border-radius:8px;padding:22px 24px;margin:0 0 24px;">
      <div style="font-size:10px;font-family:Arial,sans-serif;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Card message</div>
      <div style="font-size:15px;color:#111111;line-height:1.8;white-space:pre-wrap;font-family:Georgia,serif;">${escapeHtml(opts.messageText)}</div>
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#666;font-family:Arial,sans-serif;line-height:1.5;">
      If it looks good, approve it. If you want changes — funnier, more specific, mention something — just tell us and we'll rewrite it.
    </p>
    <div style="text-align:center;">
      <a href="${opts.dashboardUrl}" style="display:inline-block;background:#111111;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:14px 36px;border-radius:6px;text-decoration:none;">Review &amp; Approve Your Card &rarr;</a>
    </div>
  </td></tr>
  <tr><td style="background:#F2E6D3;padding:18px 36px;border-radius:0 0 12px 12px;border:1px solid #e8dcc8;border-top:none;">
    <p style="margin:0;font-size:11px;color:#aaa;font-family:Arial,sans-serif;line-height:1.5;">You're receiving this because you're a F*I Forgot subscriber. Reminders stop once you approve or request changes.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`.trim();

  const { error } = await resend.emails.send({
    to: opts.customerEmail,
    from: `F*I Forgot <${fromEmail}>`,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  logger.info({ to: opts.customerEmail, eventType: opts.eventType }, "Approval reminder email sent");
}

// ─── Demo email ───────────────────────────────────────────────────────────────

export async function sendDemoEmail(opts: {
  email: string;
  recipientName: string;
  relationship: string;
  occasion: string;
  personality: string;
  appUrl: string;
}): Promise<void> {
  const resend = getResend();
  const fromEmail = getFromEmail();

  const card = pickCard(opts.occasion, opts.personality, opts.relationship);
  const message = writeMessage(opts.recipientName, opts.relationship, opts.occasion, opts.personality);
  const checkinHtml = mockCheckinQuestions(opts.occasion, opts.personality, opts.recipientName);
  const editUrl = `${opts.appUrl}/signup?demo=true&recipientName=${encodeURIComponent(opts.recipientName)}&relationship=${encodeURIComponent(opts.relationship)}&occasion=${encodeURIComponent(opts.occasion)}`;
  const cardImageUrl = await fetchCardImageForOccasion(opts.occasion);

  const subject = `Your ${opts.occasion.toLowerCase()} card for ${opts.recipientName} is ready`;
  const occasionLabel = opts.occasion.replace("Upcoming ", "").toLowerCase();

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2E6D3;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E6D3;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#111111;padding:24px 32px;border-radius:10px 10px 0 0;">
    <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:Arial Black,Arial,sans-serif;">F*I FORGOT</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:3px;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">Relationship Damage Control</div>
  </td></tr>

  <!-- Demo banner -->
  <tr><td style="background:#E23B2E;padding:8px 32px;text-align:center;">
    <span style="font-size:11px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">SAMPLE CARD &mdash; Nothing is printed or mailed</span>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">

    <!-- Intro -->
    <p style="margin:0 0 18px;font-size:15px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">
      Hi,<br><br>
      Based on what you told us, we built a sample ${occasionLabel} card for <strong style="color:#111;">${escapeHtml(opts.recipientName)}</strong>, your ${escapeHtml(opts.relationship.toLowerCase())}. Here's exactly what we made — and how we made it.
    </p>

    <!-- Demo context note -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:#f8f3eb;border-left:3px solid #c4966a;border-radius:0 6px 6px 0;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;font-family:Arial,sans-serif;">
          <strong style="color:#111;">Quick note:</strong> Those 5 questions were just to get the demo started. When you sign up, we collect a lot more — mailing address, key dates, gift history, and deeper preferences — so every card we send is even more dialed in.
        </p>
      </td></tr>
    </table>

    <!-- ── SECTION 1: The Card ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">① The Card We Chose</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${card.bgColor};border-radius:8px;margin-bottom:8px;border:1px solid ${card.borderColor};overflow:hidden;">
      ${cardImageUrl ? `<tr><td style="padding:0;line-height:0;"><img src="${cardImageUrl}" width="100%" style="display:block;width:100%;max-height:300px;object-fit:cover;border-radius:7px 7px 0 0;" alt="Card design" /></td></tr>` : ""}
      <tr><td style="padding:28px 28px 24px;">
        <div style="font-size:10px;color:${card.accentColor};text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;font-weight:bold;font-family:Arial,sans-serif;">${card.seriesLabel}</div>
        <div style="font-size:18px;color:${card.titleColor};font-weight:bold;line-height:1.25;font-family:Georgia,serif;margin-bottom:20px;">${card.title}</div>
        <div style="font-size:14px;color:${card.titleColor};line-height:1.9;white-space:pre-line;font-family:Georgia,serif;opacity:0.9;">${escapeHtml(message)}</div>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#b0a090;text-align:center;margin:0 0 6px;font-family:Arial,sans-serif;">This is a sample. The real card is a physical card, printed and mailed.</p>

    <!-- ── SECTION 2: Why We Chose This ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">② Why We Chose This</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
      <tr><td style="background:#f8f3eb;border-radius:8px;border:1px solid #e8dcc8;padding:20px 24px;">
        <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="font-size:12px;color:#888;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Recipient</td>
            <td style="font-size:13px;color:#111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.recipientName)} &mdash; ${escapeHtml(opts.relationship)}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#888;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Occasion</td>
            <td style="font-size:13px;color:#111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.occasion)}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#888;padding:3px 16px 3px 0;white-space:nowrap;font-family:Arial,sans-serif;">Personality</td>
            <td style="font-size:13px;color:#111;font-weight:600;font-family:Arial,sans-serif;">${escapeHtml(opts.personality)}</td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;border-top:1px solid #e8dcc8;padding-top:14px;">
          <strong style="color:#111;">Our reasoning:</strong> ${card.whyChosen}
        </p>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#b0a090;margin:6px 0 0;font-family:Arial,sans-serif;">We have hundreds of cards. We choose based on the person, the occasion, and what we know about your relationship.</p>

    <!-- Edit CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${editUrl}" style="display:inline-block;background:#111111;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:16px 36px;border-radius:6px;text-decoration:none;">Edit This Sample Card &rarr;</a>
      </td></tr>
    </table>

    <!-- ── SECTION 3: You're Always in Control ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">③ You&#x27;re Always in Control</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
      <tr><td style="background:#f8f8f6;border-radius:8px;border:1px solid #e8e8e8;padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
          Before any real card goes out, you get an approval email. You can:
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">&#10003;</td><td style="padding:4px 0;font-size:13px;color:#333;font-family:Arial,sans-serif;">Approve it and walk away — takes 10 seconds</td></tr>
          <tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">&#10003;</td><td style="padding:4px 0;font-size:13px;color:#333;font-family:Arial,sans-serif;">Edit the message yourself</td></tr>
          <tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">&#10003;</td><td style="padding:4px 0;font-size:13px;color:#333;font-family:Arial,sans-serif;">Tell us what to change — we&#x27;ll rewrite it</td></tr>
          <tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">&#10003;</td><td style="padding:4px 0;font-size:13px;color:#333;font-family:Arial,sans-serif;">Swap the card design entirely</td></tr>
          <tr><td style="padding:4px 14px 4px 0;font-size:13px;color:#E23B2E;font-weight:bold;font-family:Arial,sans-serif;white-space:nowrap;">&#10003;</td><td style="padding:4px 0;font-size:13px;color:#333;font-family:Arial,sans-serif;">Regenerate the whole message from scratch</td></tr>
        </table>
        <p style="margin:14px 0 0;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;border-top:1px solid #e8e8e8;padding-top:14px;">
          Nothing gets printed or mailed without your OK. You get reminders until you approve, and you can always postpone or cancel.
        </p>
      </td></tr>
    </table>

    <!-- ── SECTION 4: The Pre-Occasion Check-In ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">④ We Reach Out Before the Date</div>

    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
      Two weeks before each occasion, you&#x27;ll get a short email from us with 2 targeted questions — so the card always feels current, not like a copy-paste from last year. Here&#x27;s what that looks like:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
      <tr><td style="background:#f8f8f6;border-radius:8px;border:2px dashed #ddd;padding:18px 22px;">
        <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;font-weight:bold;font-family:Arial,sans-serif;">&#9993; What you&#x27;d receive 2 weeks before ${escapeHtml(opts.recipientName)}&#x27;s ${occasionLabel}</div>
        <div style="background:#ffffff;border-radius:6px;padding:18px 20px;border:1px solid #e8e8e8;">
          <div style="font-size:11px;color:#999;margin-bottom:4px;font-family:Arial,sans-serif;">From: F*I Forgot &lt;hello@fiforgot.com&gt;</div>
          <div style="font-size:12px;color:#555;font-weight:600;margin-bottom:14px;font-family:Arial,sans-serif;border-bottom:1px solid #f0f0f0;padding-bottom:10px;">Subject: ${escapeHtml(opts.recipientName)}&#x27;s ${occasionLabel} is in 2 weeks — quick question</div>
          ${checkinHtml}
        </div>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#b0a090;margin:6px 0 0;font-family:Arial,sans-serif;">Those 2 answers are all we need. We handle everything else.</p>

    <!-- ── SECTION 5: The Longer You're a Member ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">⑤ The Longer You&#x27;re a Member, the Better the Cards</div>

    <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
      Every card we send, every reply you give us, every detail you mention — we remember it. Here&#x27;s how ${escapeHtml(opts.recipientName)}&#x27;s profile grows over time:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
      <tr><td style="border-radius:8px;border:1px solid #e8e8e8;overflow:hidden;">

        <!-- Month 1 -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:#f8f8f6;padding:16px 22px;border-bottom:1px solid #e8e8e8;">
            <div style="font-size:10px;color:#E23B2E;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;font-family:Arial,sans-serif;margin-bottom:8px;">Month 1 &mdash; What we know now</div>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Recipient</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">${escapeHtml(opts.recipientName)} &mdash; ${escapeHtml(opts.relationship)}</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Personality</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">${escapeHtml(opts.personality)}</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Occasion</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">${escapeHtml(opts.occasion)} tracked</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Cards sent</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">1</td></tr>
            </table>
          </td></tr>

          <!-- Month 6 -->
          <tr><td style="background:#f0f4f8;padding:16px 22px;border-bottom:1px solid #e8e8e8;">
            <div style="font-size:10px;color:#E23B2E;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;font-family:Arial,sans-serif;margin-bottom:8px;">Month 6 &mdash; Building the picture</div>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Card style</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">Prefers warm tones, not overly formal</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Tone that works</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">${opts.personality.includes("Funny") ? "Dry humor lands best, avoid cheesy" : "Genuine over poetic, specific over general"}</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Personal detail</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">You mentioned they recently changed jobs</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Cards sent</td><td style="font-size:12px;color:#333;font-family:Arial,sans-serif;">4 &mdash; 3 approved as-is, 1 edited</td></tr>
            </table>
          </td></tr>

          <!-- Year 1+ -->
          <tr><td style="background:#111111;padding:16px 22px;">
            <div style="font-size:10px;color:#E23B2E;text-transform:uppercase;letter-spacing:1.5px;font-weight:bold;font-family:Arial,sans-serif;margin-bottom:8px;">Year 1+ &mdash; We know them</div>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">References</td><td style="font-size:12px;color:#aaa;font-family:Arial,sans-serif;">The camping trip, the promotion, the hard year</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Pattern</td><td style="font-size:12px;color:#aaa;font-family:Arial,sans-serif;">Cards approved faster when they&#x27;re specific</td></tr>
              <tr><td style="padding:2px 12px 2px 0;font-size:12px;color:#888;font-family:Arial,sans-serif;white-space:nowrap;">Result</td><td style="font-size:12px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">Every card sounds like you wrote it. Because in a way, you did.</td></tr>
            </table>
          </td></tr>

        </table>
      </td></tr>
    </table>

    <!-- ── SECTION 6: How It Works ── -->
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:28px 0 10px;font-weight:bold;font-family:Arial,sans-serif;border-top:2px solid #f0e8d8;padding-top:20px;">⑥ How a Real Card Gets Made</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
      <tr><td style="background:#f8f8f6;border-radius:8px;border:1px solid #e8e8e8;padding:20px 24px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr><td style="padding:6px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;color:#E23B2E;font-weight:bold;padding-right:12px;white-space:nowrap;font-family:Arial,sans-serif;vertical-align:top;">1.</td>
              <td style="font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;"><strong style="color:#111;">We remember the date</strong> — before you do. You set it once, we track it forever.</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;color:#E23B2E;font-weight:bold;padding-right:12px;white-space:nowrap;font-family:Arial,sans-serif;vertical-align:top;">2.</td>
              <td style="font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;"><strong style="color:#111;">We ask 2 quick questions</strong> — two weeks before the date. Targeted, fast, no forms.</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;color:#E23B2E;font-weight:bold;padding-right:12px;white-space:nowrap;font-family:Arial,sans-serif;vertical-align:top;">3.</td>
              <td style="font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;"><strong style="color:#111;">We pick the card</strong> — from hundreds of options, based on the person and the occasion.</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;color:#E23B2E;font-weight:bold;padding-right:12px;white-space:nowrap;font-family:Arial,sans-serif;vertical-align:top;">4.</td>
              <td style="font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;"><strong style="color:#111;">We write the message</strong> — personalized to your relationship, their personality, and your history together.</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;color:#E23B2E;font-weight:bold;padding-right:12px;white-space:nowrap;font-family:Arial,sans-serif;vertical-align:top;">5.</td>
              <td style="font-size:13px;color:#333;font-family:Arial,sans-serif;line-height:1.6;"><strong style="color:#111;">You approve in 2 minutes</strong> — or edit, or tell us what to change. Then we print and mail it. Done.</td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <!-- Final CTA -->
    <div style="margin:32px 0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center">
          <a href="${opts.appUrl}/signup" style="display:inline-block;background:#E23B2E;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:16px 40px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Start the Real Thing &rarr;</a>
        </td></tr>
      </table>
    </div>
    <p style="text-align:center;font-size:12px;color:#aaa;margin:8px 0 0;font-family:Arial,sans-serif;">Nothing in this demo is printed, purchased, or mailed to anyone.</p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F2E6D3;padding:16px 32px;border-radius:0 0 10px 10px;border:1px solid #e8dcc8;border-top:none;">
    <p style="margin:0;font-size:11px;color:#aaa;text-align:center;font-family:Arial,sans-serif;">You asked for this demo. We won&#x27;t contact you again unless you sign up.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`.trim();

  const { error } = await resend.emails.send({
    to: opts.email,
    from: `F*I Forgot <${fromEmail}>`,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  logger.info({ to: opts.email, recipientName: opts.recipientName, occasion: opts.occasion }, "Demo email sent via Resend");
}

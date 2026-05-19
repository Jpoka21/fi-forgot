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

export function pickCard(occasion: string, personality: string, relationship: string): CardConfig {
  const isFunny = personality.includes("Funny");
  const isSpouse = relationship === "Spouse / Partner";
  const isParentRel = relationship === "Parent";   // sender → their parent
  const isChildRel  = relationship === "Child";    // sender → their child
  const isSibling   = relationship === "Sibling";
  const isFriend    = relationship === "Friend";
  const isCoworker  = relationship === "Coworker";
  const isRomantic  = isSpouse;

  if (occasion === "Birthday") {
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

  if (occasion === "Work Anniversary") {
    return {
      bgColor: "#1a1f2e", titleColor: "#e0e8f8", accentColor: "#6a9fd8",
      borderColor: "#2d3a52", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;Look How Far You&#x27;ve Come&#x27; Card",
      whyChosen: `Work anniversaries are easy to forget and meaningful to receive. We picked something that acknowledges the milestone without being corporate — because nobody wants to feel like their job sent them a card.`,
    };
  }

  if (occasion === "Anniversary") {
    if (isRomantic && isFunny) return {
      bgColor: "#2d1b2e", titleColor: "#f0d4e8", accentColor: "#c4966a",
      borderColor: "#4a2d4a", seriesLabel: "ANNIVERSARY COLLECTION",
      title: "The &#x27;Still Here, Still Choosing You&#x27; Card",
      whyChosen: `We balanced the romance with a little self-awareness. Anniversaries don't have to be serious to be meaningful — and this card proves it.`,
    };
    if (isRomantic) return {
      bgColor: "#1a0a0f", titleColor: "#f2d4d7", accentColor: "#c4966a",
      borderColor: "#3d1a24", seriesLabel: "ANNIVERSARY COLLECTION",
      title: "The &#x27;I&#x27;d Do It All Again&#x27; Card",
      whyChosen: `For a ${personality.split(" ")[0].toLowerCase()} ${relationship.toLowerCase()} on an anniversary, we went deep instead of decorative. This card says something real.`,
    };
    // Friend, sibling, or other non-romantic anniversaries
    if (isFunny) return {
      bgColor: "#1a1f2e", titleColor: "#e0e8f8", accentColor: "#6a9fd8",
      borderColor: "#2d3a52", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;Another Year. Still the Right Call.&#x27; Card",
      whyChosen: `Non-romantic anniversaries are underserved by the card industry. We picked something that marks the milestone without reaching for romance — honest and warm instead.`,
    };
    return {
      bgColor: "#f5ede0", titleColor: "#3d2b1f", accentColor: "#c4966a",
      borderColor: "#e0d5c0", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;Some Things Just Get Better the Longer They Last&#x27; Card",
      whyChosen: `The best anniversary cards work for any relationship — they mark time without being sentimental about it. This one lands for a ${relationship.toLowerCase()} without feeling like it was written for someone else.`,
    };
  }

  if (occasion === "Valentine's Day") {
    if (isFunny) return {
      bgColor: "#2e0a10", titleColor: "#ffd6d8", accentColor: "#E23B2E",
      borderColor: "#4a1a20", seriesLabel: "VALENTINE'S COLLECTION",
      title: "The &#x27;I Like You More Than Most People&#x27; Card",
      whyChosen: `Valentine's cards are either over-the-top or painfully generic. For a ${personality.toLowerCase()} ${relationship.toLowerCase()}, we went with something that means it without performing it.`,
    };
    return {
      bgColor: "#1a0508", titleColor: "#fce4e6", accentColor: "#e88a90",
      borderColor: "#3d1015", seriesLabel: "VALENTINE'S COLLECTION",
      title: "The &#x27;You&#x27;re the Reason I Get It&#x27; Card",
      whyChosen: `Valentine's Day works best when it's personal, not performative. We avoided the roses-are-red territory and picked something that actually says something.`,
    };
  }

  if (occasion === "Mother's Day") {
    if (isSpouse && isFunny) return {
      bgColor: "#fdf4f8", titleColor: "#3d1a2a", accentColor: "#c46a8a",
      borderColor: "#f0d8e4", seriesLabel: "MOTHER'S DAY COLLECTION",
      title: "The &#x27;Our Kids Have No Idea How Lucky They Are (But I Do)&#x27; Card",
      whyChosen: `When a spouse sends a Mother's Day card, the angle is completely different — it's about what you witness every day, not what was done for you. This card hits that note perfectly.`,
    };
    if (isSpouse) return {
      bgColor: "#fdf4f8", titleColor: "#3d1a2a", accentColor: "#c46a8a",
      borderColor: "#f0d8e4", seriesLabel: "MOTHER'S DAY COLLECTION",
      title: "The &#x27;Watching You With Our Kids Is One of My Favorite Things&#x27; Card",
      whyChosen: `A Mother's Day card from a spouse lands differently than one from a child. This one focuses on what you see every day — which is more specific, more personal, and more meaningful.`,
    };
    // Child sending to their own parent
    if (isParentRel && isFunny) return {
      bgColor: "#f5ede0", titleColor: "#3d2b1f", accentColor: "#c4966a",
      borderColor: "#e0d5c0", seriesLabel: "MOTHER'S DAY COLLECTION",
      title: "The &#x27;You Raised Me, So This Is Your Fault&#x27; Card",
      whyChosen: `Mother's Day cards are notoriously saccharine. A little humor with real heart lands better than a poem. We went warm and funny — which respects her more than a generic "World's Best Mom."`,
    };
    if (isParentRel) return {
      bgColor: "#fdf4f8", titleColor: "#3d1a2a", accentColor: "#c46a8a",
      borderColor: "#f0d8e4", seriesLabel: "MOTHER'S DAY COLLECTION",
      title: "The &#x27;Everything I Know About Showing Up, I Learned From You&#x27; Card",
      whyChosen: `The best Mother's Day cards give credit, not just gratitude. This one names what she actually did — not just that she's "special."`,
    };
    // Friend, sibling, coworker — sending to someone who happens to be a mom
    return {
      bgColor: "#fdf4f8", titleColor: "#3d1a2a", accentColor: "#c46a8a",
      borderColor: "#f0d8e4", seriesLabel: "MOTHER'S DAY COLLECTION",
      title: `The &#x27;You Make It Look Effortless. It Clearly Isn&#x27;t.&#x27; Card`,
      whyChosen: `The best Mother's Day cards acknowledge the work, not just the role. For a ${relationship.toLowerCase()}, we went with admiration over sentimentality — which is more honest and lands better.`,
    };
  }

  if (occasion === "Father's Day") {
    if (isSpouse && isFunny) return {
      bgColor: "#0d1b2a", titleColor: "#d4e4f4", accentColor: "#6a9fd8",
      borderColor: "#1a2d42", seriesLabel: "FATHER'S DAY COLLECTION",
      title: "The &#x27;Our Kids Are Lucky to Have You (Even When You&#x27;re Explaining Things)&#x27; Card",
      whyChosen: `A Father's Day card from a spouse is about what you witness — not what was done for you. This card captures that angle with warmth and a little humor.`,
    };
    if (isSpouse) return {
      bgColor: "#0d1b2a", titleColor: "#d4e4f4", accentColor: "#6a9fd8",
      borderColor: "#1a2d42", seriesLabel: "FATHER'S DAY COLLECTION",
      title: "The &#x27;Watching You Be a Dad Is Something I&#x27;m Grateful For Every Day&#x27; Card",
      whyChosen: `When a spouse sends a Father's Day card, the most meaningful thing they can say is what they observe. This card speaks to that — no clichés, just what's real.`,
    };
    // Child sending to their own parent
    if (isParentRel && isFunny) return {
      bgColor: "#111827", titleColor: "#f9fafb", accentColor: "#6a9fd8",
      borderColor: "#374151", seriesLabel: "FATHER'S DAY COLLECTION",
      title: "The &#x27;You Taught Me Everything. Mostly by Example. Sometimes the Wrong Kind.&#x27; Card",
      whyChosen: `Dads appreciate directness and humor. Sentimental Father's Day cards often miss — this one lands because it's honest and specific rather than generic and flowery.`,
    };
    if (isParentRel) return {
      bgColor: "#0d1b2a", titleColor: "#d4e4f4", accentColor: "#6a9fd8",
      borderColor: "#1a2d42", seriesLabel: "FATHER'S DAY COLLECTION",
      title: "The &#x27;You Showed Up. That&#x27;s the Whole Thing.&#x27; Card",
      whyChosen: `The most meaningful thing you can tell a father is that his presence counted. We skipped the clichés and wrote something that actually says it.`,
    };
    // Friend, sibling, coworker — sending to someone who is a dad
    return {
      bgColor: "#0d1b2a", titleColor: "#d4e4f4", accentColor: "#6a9fd8",
      borderColor: "#1a2d42", seriesLabel: "FATHER'S DAY COLLECTION",
      title: "The &#x27;What You Do for the People Around You Matters More Than You Know&#x27; Card",
      whyChosen: `For a ${relationship.toLowerCase()} sending a Father's Day card, admiration lands better than sentiment. We picked something that acknowledges the role without making it feel like a Hallmark script.`,
    };
  }

  if (occasion === "Christmas" || occasion === "Hanukkah" || occasion === "Thanksgiving" || occasion === "Easter" || occasion === "New Year's") {
    if (isFunny) return {
      bgColor: "#1a2e1a", titleColor: "#d4edda", accentColor: "#6abf69",
      borderColor: "#2d4a2d", seriesLabel: `${occasion.toUpperCase()} COLLECTION`,
      title: "The &#x27;This Season, I Actually Remembered You&#x27; Card",
      whyChosen: `Holiday cards are notoriously generic. For a ${personality.toLowerCase()} ${relationship.toLowerCase()}, we chose something with a little self-awareness that makes it feel personal instead of broadcast.`,
    };
    return {
      bgColor: "#0f1f0f", titleColor: "#c8e6c8", accentColor: "#81c784",
      borderColor: "#1a3a1a", seriesLabel: `${occasion.toUpperCase()} COLLECTION`,
      title: "The &#x27;This Season, Especially You&#x27; Card",
      whyChosen: `Holiday cards work best when they single someone out instead of broadcasting to everyone. For your ${relationship.toLowerCase()}, we made this one feel personal even in a crowded season.`,
    };
  }

  if (occasion === "Graduation") {
    return {
      bgColor: "#1a1f0a", titleColor: "#e8f4c8", accentColor: "#a0c84a",
      borderColor: "#2d3a14", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;You Did the Hard Part. Now the Real Stuff Starts.&#x27; Card",
      whyChosen: `Graduation cards are either too celebratory or too advice-heavy. We picked something that acknowledges the accomplishment while looking forward — honest and encouraging without being preachy.`,
    };
  }

  if (occasion === "Get Well Soon") {
    return {
      bgColor: "#f0f8ff", titleColor: "#1a2e3d", accentColor: "#5a9abf",
      borderColor: "#d4e8f4", seriesLabel: "CARE COLLECTION",
      title: "The &#x27;Just Thinking About You&#x27; Card",
      whyChosen: `Get well cards often feel obligatory. We picked something warm and human — the kind of card that says "I actually thought about you today" rather than "I'm checking a box."`,
    };
  }

  if (occasion === "Congratulations") {
    if (isFunny) return {
      bgColor: "#1f1a00", titleColor: "#fef3c7", accentColor: "#d4a020",
      borderColor: "#3d3400", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;I Knew You Would. I Just Didn&#x27;t Say It Out Loud.&#x27; Card",
      whyChosen: `Congratulations cards land better when they feel like they come from a person, not a Hallmark aisle. We went specific and honest — which is what makes it memorable.`,
    };
    return {
      bgColor: "#0a1a0a", titleColor: "#d4f4d4", accentColor: "#4abf4a",
      borderColor: "#143d14", seriesLabel: "MILESTONE COLLECTION",
      title: "The &#x27;You Earned This. All of It.&#x27; Card",
      whyChosen: `The best congratulations cards give credit where it's actually due. We skipped the confetti-and-balloons tone and wrote something that feels earned.`,
    };
  }

  // Just Because — default
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

export function writeMessage(name: string, relationship: string, occasion: string, personality: string): string {
  const isFunny = personality.includes("Funny");
  const isSentimental = personality.includes("Sentimental") || personality.includes("Warm");
  const isSpouse   = relationship === "Spouse / Partner";
  const isParentRel = relationship === "Parent";   // sender → their parent
  const isChildRel  = relationship === "Child";    // sender → their child
  const isSibling   = relationship === "Sibling";
  const isFriend    = relationship === "Friend";
  const isCoworker  = relationship === "Coworker";
  // legacy alias used in birthday block
  const isParent = isParentRel;

  if (occasion === "Birthday") {
    if (isFunny && isSpouse) return `Dear ${name},\n\nHappy birthday. You're older now.\n\nI'm choosing not to elaborate. The fact that I remembered should count for something.\n\nLove,\n[Your Name]`;
    if (isFunny && isFriend) return `Dear ${name},\n\nAnother year. Another reason to remind you that you keep somehow getting better while the rest of us are just getting older.\n\nHappy birthday. Don't do the math.\n\n[Your Name]`;
    if (isFunny) return `Dear ${name},\n\nHappy birthday. You've officially been on this earth long enough that I felt the need to acknowledge it in writing.\n\nThat's how you know it's serious.\n\n[Your Name]`;
    if (isSentimental && isSpouse) return `Dear ${name},\n\nYour birthday is one of those days that makes me stop and think about how lucky I am. Not in a greeting-card way — genuinely lucky.\n\nI hope this year gives you back everything you pour into the people around you.\n\nLove,\n[Your Name]`;
    if (isSentimental && isParent) return `Dear ${name},\n\nI don't say this enough — but everything I know about showing up for the people I love, I learned from watching you.\n\nHappy birthday.\n\n[Your Name]`;
    if (isSentimental && isFriend) return `Dear ${name},\n\nNot everyone gets to have a person like you in their corner. I'm lucky I do.\n\nHappy birthday.\n\n[Your Name]`;
    return `Dear ${name},\n\nHappy birthday. Wishing you a year that matches the kind of person you are — which means it's going to be a good one.\n\n[Your Name]`;
  }

  if (occasion === "Work Anniversary") {
    if (isFunny) return `Dear ${name},\n\nAnother year. You're still here. That means something — even if it's mostly stubbornness.\n\nCongratulations on the milestone. Genuinely.\n\n[Your Name]`;
    return `Dear ${name},\n\nWork anniversaries don't always get the recognition they deserve. This one does.\n\nCongratulations — and thank you for everything you bring.\n\n[Your Name]`;
  }

  if (occasion === "Anniversary") {
    if (isFunny && isSpouse) return `Dear ${name},\n\nAnother year. Still haven't figured out how to get rid of you.\n\nHappy anniversary. (I mean that in the best possible way.)\n\nLove,\n[Your Name]`;
    if (isSpouse) return `Dear ${name},\n\nI don't mark anniversaries with big gestures. I mark them by thinking: I'd choose this again.\n\nHappy anniversary.\n\nLove,\n[Your Name]`;
    // Friend anniversary / friendiversary
    if (isFriend && isFunny) return `Dear ${name},\n\nAnother year of you in my life. Somehow it keeps being the right call.\n\nHappy friendiversary.\n\n[Your Name]`;
    if (isFriend) return `Dear ${name},\n\nNot everyone gets to count a friendship in years. I'm glad I get to count this one.\n\nHappy anniversary.\n\n[Your Name]`;
    // Professional or sibling / other
    if (isFunny) return `Dear ${name},\n\nAnother year. Still going strong. That's saying something.\n\nHappy anniversary.\n\n[Your Name]`;
    return `Dear ${name},\n\nSome things just get better the longer they last. You're one of them.\n\nHappy anniversary.\n\n[Your Name]`;
  }

  if (occasion === "Valentine's Day") {
    if (isFunny && isSpouse) return `Dear ${name},\n\nValentine's Day. The one day a year I'm legally required to say nice things.\n\nFor the record: I'd say them anyway.\n\nLove,\n[Your Name]`;
    if (isFunny) return `Dear ${name},\n\nI like you more than most people. That's not faint praise — most people are a lot.\n\nHappy Valentine's Day.\n\n[Your Name]`;
    if (isSpouse) return `Dear ${name},\n\nI don't need a holiday to feel this. But I'm glad there's one — because it gives me an excuse to say it out loud.\n\nHappy Valentine's Day.\n\nLove,\n[Your Name]`;
    return `Dear ${name},\n\nThis time of year always makes me think about the people I'm glad are in my life. You're at the top of that list.\n\nHappy Valentine's Day.\n\n[Your Name]`;
  }

  if (occasion === "Mother's Day") {
    // Spouse sending to partner who is a mother
    if (isSpouse) {
      if (isFunny) return `Dear ${name},\n\nEvery day I watch you be a mom to our kids and think: they have no idea how lucky they are.\n\n(I do, though.)\n\nHappy Mother's Day.\n\nLove,\n[Your Name]`;
      return `Dear ${name},\n\nWatching you with our kids is one of the best things I get to do. You make it look easy — and I know it isn't.\n\nHappy Mother's Day. You deserve today.\n\nLove,\n[Your Name]`;
    }
    // Child sending to their own parent
    if (isParentRel) {
      if (isFunny) return `Dear ${name},\n\nYou raised me. Whatever I turned out to be — that's on you.\n\nHappy Mother's Day. I mean that as a compliment.\n\n[Your Name]`;
      return `Dear ${name},\n\nEverything I know about showing up for the people I love, I learned from watching you.\n\nHappy Mother's Day.\n\n[Your Name]`;
    }
    // Friend, sibling, child-rel, coworker — sending to someone who is a mom
    if (isFunny) return `Dear ${name},\n\nYou make motherhood look effortless. Anyone paying attention knows it clearly isn't.\n\nHappy Mother's Day.\n\n[Your Name]`;
    return `Dear ${name},\n\nHappy Mother's Day to someone who shows up for the people around her in a way that genuinely matters.\n\n[Your Name]`;
  }

  if (occasion === "Father's Day") {
    // Spouse sending to partner who is a father
    if (isSpouse) {
      if (isFunny) return `Dear ${name},\n\nOur kids are lucky to have you. Even when you're explaining things they didn't ask about.\n\nHappy Father's Day.\n\nLove,\n[Your Name]`;
      return `Dear ${name},\n\nWatching you be a dad to our kids is something I'm genuinely grateful for. Every day.\n\nHappy Father's Day.\n\nLove,\n[Your Name]`;
    }
    // Child sending to their own parent
    if (isParentRel) {
      if (isFunny) return `Dear ${name},\n\nYou taught me a lot. Some of it on purpose.\n\nHappy Father's Day.\n\n[Your Name]`;
      return `Dear ${name},\n\nYou showed up. Consistently. That's the whole thing — and I don't take it for granted.\n\nHappy Father's Day.\n\n[Your Name]`;
    }
    // Friend, sibling, coworker — sending to someone who is a dad
    if (isFunny) return `Dear ${name},\n\nHappy Father's Day to someone who makes the whole thing look more manageable than it has any right to be.\n\n[Your Name]`;
    return `Dear ${name},\n\nHappy Father's Day. What you do for the people around you matters more than you probably know.\n\n[Your Name]`;
  }

  if (occasion === "Christmas") {
    if (isFunny) return `Dear ${name},\n\nHappy Christmas. I got you a card. I almost forgot. You're welcome.\n\n[Your Name]`;
    return `Dear ${name},\n\nThis season always makes me think about the people who make my life better just by being in it.\n\nYou're one of them. Merry Christmas.\n\n[Your Name]`;
  }

  if (occasion === "Hanukkah") {
    return `Dear ${name},\n\nWishing you a Hanukkah full of warmth, light, and all the things worth celebrating.\n\nHappy Hanukkah.\n\n[Your Name]`;
  }

  if (occasion === "Thanksgiving") {
    if (isFunny) return `Dear ${name},\n\nThanksgiving: the one day a year we admit out loud that things are good.\n\nI'm glad you're one of the reasons they are.\n\n[Your Name]`;
    return `Dear ${name},\n\nI don't say this enough — but I'm genuinely grateful for you.\n\nHappy Thanksgiving.\n\n[Your Name]`;
  }

  if (occasion === "Easter") {
    return `Dear ${name},\n\nHappy Easter. Wishing you a great day with the people you love.\n\n[Your Name]`;
  }

  if (occasion === "New Year's") {
    if (isFunny) return `Dear ${name},\n\nNew year. Fresh start. Same us — which, honestly, I think is great.\n\nHappy New Year.\n\n[Your Name]`;
    return `Dear ${name},\n\nHere's to a new year — and to you being in it.\n\nHappy New Year.\n\n[Your Name]`;
  }

  if (occasion === "Graduation") {
    if (isFunny) return `Dear ${name},\n\nYou did it. All those years of effort and it turns out you were capable of finishing things.\n\nCongratulations. I always knew.\n\n[Your Name]`;
    return `Dear ${name},\n\nYou earned this — every bit of it. This is just the beginning of what you're going to do.\n\nCongratulations.\n\n[Your Name]`;
  }

  if (occasion === "Get Well Soon") {
    if (isFunny) return `Dear ${name},\n\nBeing sick is the worst. Feel better soon — the world is noticeably worse when you're out of commission.\n\n[Your Name]`;
    return `Dear ${name},\n\nJust wanted you to know I'm thinking about you. Take care of yourself — and let people take care of you too.\n\n[Your Name]`;
  }

  if (occasion === "Congratulations") {
    if (isFunny) return `Dear ${name},\n\nI knew you'd do it. I just didn't say it out loud because I didn't want to jinx it.\n\nCongratulations. Genuinely.\n\n[Your Name]`;
    return `Dear ${name},\n\nYou earned this. Not luck, not timing — you.\n\nCongratulations.\n\n[Your Name]`;
  }

  // Just Because
  if (isFunny) return `Dear ${name},\n\nNo occasion. No reason. Just thought of you and figured you should know.\n\n(You're welcome.)\n\n[Your Name]`;
  if (isSentimental) return `Dear ${name},\n\nNo special occasion. I just found myself thinking about you and decided that was worth saying.\n\nHope you're doing well.\n\n[Your Name]`;
  return `Dear ${name},\n\nWanted you to know you were on my mind.\n\nHope this finds you well.\n\n[Your Name]`;
}

// ─── Mock pre-occasion questions ──────────────────────────────────────────────

export function mockCheckinQuestions(occasion: string, personality: string, name: string): string {
  const n = escapeHtml(name);
  const toneLabel = personality.includes("Funny") ? "funny" : "heartfelt";

  if (occasion === "Birthday") return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${n}'s birthday is coming up in 2 weeks.</strong> Before we write the card, just two quick things:<br><br>
      <strong style="color:#111;">1. Anything significant happen this year worth mentioning?</strong><br>
      <span style="color:#666;">(New job, a trip together, something they accomplished, a tough stretch they got through, etc.)</span><br><br>
      <strong style="color:#111;">2. Last year you went ${toneLabel} — want to switch it up or stick with it?</strong><br><br>
      Hit reply with a sentence or two. We'll take it from there.
    </div>`;

  if (occasion === "Anniversary" || occasion === "Work Anniversary") return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${occasion === "Work Anniversary" ? `${n}'s work anniversary` : `Your anniversary with ${n}`} is 2 weeks away.</strong> Two quick questions before we write the card:<br><br>
      <strong style="color:#111;">1. Anything you want to reference from this past year?</strong><br>
      <span style="color:#666;">(A milestone, a challenge they navigated, something that stands out.)</span><br><br>
      <strong style="color:#111;">2. Tone check — warm and sincere, or a little more lighthearted?</strong><br><br>
      One or two sentences is plenty. We'll handle the rest.
    </div>`;

  if (occasion === "Mother's Day" || occasion === "Father's Day") {
    return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${occasion} is 2 weeks away.</strong> Quick question before we write ${n}'s card:<br><br>
      <strong style="color:#111;">Is there a specific moment or thing from this past year you want the card to reference?</strong><br>
      <span style="color:#666;">(Something you witnessed or experienced together — even one detail makes it feel personal.)</span><br><br>
      One line is enough. We'll build the rest around it.
    </div>`;
  }

  if (occasion === "Valentine's Day") return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>Valentine's Day is 2 weeks away.</strong> Before we write the card for ${n}:<br><br>
      <strong style="color:#111;">Anything specific you want this one to say — or a memory from the past year to mention?</strong><br>
      <span style="color:#666;">(Even one detail makes it feel personal instead of generic.)</span><br><br>
      Hit reply with whatever comes to mind.
    </div>`;

  if (occasion === "Graduation") return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${n}'s graduation is coming up.</strong> One quick thing:<br><br>
      <strong style="color:#111;">What did they graduate from, and is there anything you want the card to acknowledge specifically?</strong><br>
      <span style="color:#666;">(Their major, what they're doing next, how hard they worked — anything.)</span><br><br>
      A sentence or two is all we need.
    </div>`;

  if (occasion === "Christmas" || occasion === "Hanukkah" || occasion === "Thanksgiving" || occasion === "Easter" || occasion === "New Year's") return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>${occasion} is 2 weeks away.</strong> Quick question before we write ${n}'s card:<br><br>
      <strong style="color:#111;">Is there anything from this year you'd want the card to mention — or should we keep it warm and general?</strong><br>
      <span style="color:#666;">(A shared memory, something they're going through, a running joke — anything makes it feel more personal.)</span><br><br>
      Hit reply with whatever comes to mind. We'll make it work.
    </div>`;

  return `
    <div style="font-size:13px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      Hey,<br><br>
      <strong>We're getting ${n}'s card ready.</strong> One quick thing before we write it:<br><br>
      <strong style="color:#111;">Is there anything specific you want this card to say or reference?</strong><br>
      <span style="color:#666;">(Even one detail — a shared moment, something they're going through, anything that makes it feel personal.)</span><br><br>
      Hit reply with whatever comes to mind. We'll make it work.
    </div>`;
}

// ─── Handwrytten card image lookup ────────────────────────────────────────────

const OCCASION_KEYWORDS: Record<string, string[]> = {
  "Birthday":         ["birthday", "bday", "candle", "cake", "blow out", "balloons of joy", "birthday bloom", "birthday wish", "classy birthday", "birthday candle"],
  "Anniversary":      ["anniversary", "years together", "a slice of forever", "built with love", "love story", "forever"],
  "Valentine's Day":  ["valentine", "sweetheart", "romance", "cupid", "xoxo"],
  "Mother's Day":     ["mother", "mom", "mama", "mum", "garden of love", "bloom, baby"],
  "Father's Day":     ["father", "dad", "papa", "daddio", "daddy", "built for dad", "best dad", "awesome dad", "cheerio daddio", "best dog dad"],
  "Christmas":        ["christmas", "merry", "santa", "reindeer", "mistletoe", "noel", "december", "holiday cheer", "winter wonder"],
  "Hanukkah":         ["hanukkah", "chanukah", "dreidel", "menorah"],
  "Thanksgiving":     ["thanksgiving", "thankful", "grateful", "harvest", "pumpkin", "turkey", "fall", "autumn", "cloud nine grateful", "blooming thanks", "botanical thanks", "grateful"],
  "Easter":           ["easter", "easter bunny", "buzzing for spring", "april showers", "spring bloom"],
  "New Year's":       ["new year", "nye", "resolution", "2026", "2025"],
  "Graduation":       ["graduate", "graduation", "diploma", "cap, gown", "cap it off", "class act", "block party graduation", "congrats diploma", "con-grad", "climbing to new heights", "chevron of success"],
  "Work Anniversary": ["work anniversary", "dedication", "contributions", "career", "another year of", "celebrate.*year", "anniversary.*work", "years of", "amazing employee", "best employee", "celebrate.*dedication", "building success", "collaborate and celebrate", "commemorating"],
  "Get Well Soon":    ["get well", "feel better", "recovery", "healing", "brighter days", "across the rainbow"],
  "Congratulations":  ["congrats", "congratulation", "success", "achievement", "bravo", "applause", "celebrate"],
  "Just Because":     ["thinking of you", "just because", "hello", "hi there", "miss you", "thank you", "merci", "thanks"],
};

function cardMatchesOccasion(cardName: string, occasion: string): boolean {
  const name = cardName.toLowerCase();
  const keywords = OCCASION_KEYWORDS[occasion] ?? [];
  return keywords.some(kw => name.includes(kw));
}

const SKIP_WORDS = [
  "wedding", "bride", "groom", "love story", "happy couple", "marriage", "bridal",
  "baby", "newborn", "baptism", "baby rattle", "baby steps",
  "pet", "dog", "cat", "rainbow bridge",
  "funeral", "sympathy", "condolence",
  "dress and tux", "dress%20and%20tux", "wedding%20dress",
];

function isSafeCard(c: { name: string; imageUrl?: string }): boolean {
  const name = String(c.name).toLowerCase();
  const imageFile = decodeURIComponent(String(c.imageUrl ?? "").split("/").pop() ?? "").toLowerCase();
  return !SKIP_WORDS.some(w => name.includes(w) || imageFile.includes(w));
}

export async function fetchMultipleCardImagesForOccasion(occasion: string, limit = 6): Promise<string[]> {
  try {
    const all = await listHandwryttenCards();
    const withImage = all.filter(c => c.imageUrl && c.imageUrl.startsWith("http"));
    const matched = withImage.filter(c => cardMatchesOccasion(String(c.name), occasion));
    if (matched.length > 0) return matched.slice(0, limit).map(c => c.imageUrl!);
    // No keyword match — return safe general cards (no wedding/baby/pet-specific imagery)
    const safe = withImage.filter(isSafeCard);
    return safe.slice(0, limit).map(c => c.imageUrl!);
  } catch (err) {
    logger.warn({ err }, "Could not fetch Handwrytten card images for demo preview");
    return [];
  }
}

export async function fetchCardImageForOccasion(occasion: string): Promise<string | null> {
  const urls = await fetchMultipleCardImagesForOccasion(occasion, 1);
  return urls[0] ?? null;
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
  occasion: string;
  previewUrl: string;
}): Promise<void> {
  const resend = getResend();
  const fromEmail = getFromEmail();

  const subject = `Your ${opts.occasion.toLowerCase()} card for ${opts.recipientName} is ready`;
  const occasionLabel = opts.occasion.replace("Upcoming ", "").toLowerCase();

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2E6D3;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E6D3;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <tr><td style="background:#111111;padding:24px 32px;border-radius:10px 10px 0 0;">
    <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:Arial Black,Arial,sans-serif;">F*I FORGOT</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:3px;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">Relationship Damage Control</div>
  </td></tr>

  <tr><td style="background:#E23B2E;padding:8px 32px;text-align:center;">
    <span style="font-size:11px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">SAMPLE CARD &mdash; Nothing is printed or mailed</span>
  </td></tr>

  <tr><td style="background:#ffffff;padding:40px 32px;border-left:1px solid #e8dcc8;border-right:1px solid #e8dcc8;">
    <p style="margin:0 0 14px;font-size:16px;color:#222;line-height:1.6;font-family:Arial,sans-serif;">
      We built a personalized ${escapeHtml(occasionLabel)} card for <strong>${escapeHtml(opts.recipientName)}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
      Click below to see the card we chose, the message we'd write inside, and exactly how we built it.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:32px;">
        <a href="${opts.previewUrl}" style="display:inline-block;background:#E23B2E;color:#ffffff;font-family:Arial Black,Arial,sans-serif;font-size:15px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:18px 44px;border-radius:6px;">
          SEE YOUR CARD &rarr;
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;text-align:center;font-family:Arial,sans-serif;">Nothing in this demo is printed, purchased, or mailed to anyone.</p>
  </td></tr>

  <tr><td style="background:#111111;padding:20px 32px;border-radius:0 0 10px 10px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.5px;line-height:1.6;font-family:Arial,sans-serif;">
      F*I Forgot &mdash; Relationship Damage Control<br>
      Landing in spam? Check your spam/promotions folder.
    </p>
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

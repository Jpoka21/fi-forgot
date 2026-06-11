# Sprint 2A: Final Onboarding UX Blueprint
**F.I. Forgot — Pre-Development Product Specification**
*Status: Approved direction. Ready for design and engineering handoff.*

---

## Agreed Principles (Locked)

1. Users experience value as quickly as possible.
2. The first card draft appears **during** onboarding, not after.
3. Mailing address is collected **after** value is demonstrated.
4. The relationship memory database is a core strategic asset.
5. Progressive profiling collects non-essential information later.
6. The onboarding experience supports both conversion and long-term data quality.

---

## Part 1 — Complete User Journey

| # | Screen | Primary Goal | User Mindset | Primary CTA | Secondary CTA | Est. Time |
|---|---|---|---|---|---|---|
| 1 | Landing Page | Acquisition | Skeptical / curious | Get Started → | Log in | — |
| 2 | Sign Up / Log In | Auth | Evaluating commitment | Create account | Log in | 30s |
| 3 | Step 1 — Who's First? | Establish recipient identity and first occasion | "OK let's try this" | Continue → | ← Back (step 2+) | ~50s |
| 4 | Step 2 — What Are They Like? | Capture voice and safety context | Warming up, engaged | Continue → | ← Back | ~35s |
| 5 | Step 3 — One Real Thing | Capture card fuel (highest quality input) | Curious about the result | Show Me The Card → | Nothing specific — just write something warm | ~40s |
| 6 | Step 4 — Here's Your First Card | Deliver the product promise | Surprised, evaluating | Send This Card → | Something's off — fix one thing | ~60s |
| 7 | Address Collection | Convert approval into a physical send | High intent, ready to commit | Ship It → | Not yet — I'll add this later | ~30s |
| 8 | Post-Card Expansion | Expand calendar and recipients | Satisfied, open to more | Add Another Person → | I'm good for now | ~60s |
| 9 | Dashboard — First-Time State | Orient and set next action | Accomplished, exploring | Add another person → | View [Name]'s card | Ongoing |

**Total time from sign-up to first card draft visible: approximately 3–4 minutes.**
**Total time from sign-up to first card shipped: approximately 4–5 minutes.**

---

## Part 2 — Screen-by-Screen Wireframes

Brand tokens: BG `#F2E6D3` · RED `#E23B2E` · BLACK `#111111` · SAGE `#5B8C6B` · GRAY `#6B6B6B` · BORDER `#E5E0D8`
Fonts: Bebas Neue (display) · Plus Jakarta Sans (body) · Caveat (handwriting accent)

---

### Screen 3: Step 1 — "Who's First?"

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo wordmark — Bebas Neue, RED, top-left]    │
│                                                             │
│  ●○○○  [4 progress dots — dot 1 filled RED]                │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  WHO'S FIRST?                                               │
│  Bebas Neue · 36px · BLACK                                  │
│                                                             │
│  Tell us about one person. We'll make sure you              │
│  never forget them.                                         │
│  Plus Jakarta Sans · 15px · GRAY                            │
│                                                             │
│  ─── THEIR FIRST NAME ─────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ e.g. Sarah                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  Validation: required · shown on Continue tap if empty:     │
│  "We need a name to write the card."                        │
│                                                             │
│  ─── YOUR RELATIONSHIP TO THEM ────────────────────────    │
│  (label · 12px uppercase · GRAY)                            │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │  Wife  │ │Husband │ │Girlfriend│ │Boyfriend│            │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │  Mom   │ │  Dad   │ │ Sister │ │Brother │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Friend │ │ Grandma│ │ Grandpa│ │  Other │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Mother- │ │Father- │ │Employee│ │ Client │              │
│  │in-law  │ │in-law  │ │        │ │        │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
│  Selected state: RED border + RED label text                │
│  Validation: required · "Pick a relationship to continue."  │
│                                                             │
│  ─── THEIR NEXT UPCOMING OCCASION ─────────────────────    │
│  (appears with CSS slide-down after relationship selected)  │
│                                                             │
│  2–4 tiles filtered by relationship type.                   │
│  Examples:                                                  │
│  · Wife/Husband: Birthday · Anniversary · Valentine's Day   │
│  · Mom/Dad: Birthday · Mother's/Father's Day · Other        │
│  · Friend: Birthday · Just Because · Other                  │
│  · Employee/Client: Birthday · Work Anniversary · Other     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 🎂 Birthday  │  │💍 Anniversary│  │  📅 Other... │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ─── WHEN IS IT? ───────────────────────────────────────   │
│  (appears with slide-down after date-sensitive occasion     │
│   selected — Birthday, Anniversary, Work Anniversary,       │
│   Graduation; NOT shown for Just Because, Christmas,        │
│   Mother's/Father's Day which have fixed or no dates)       │
│                                                             │
│  Month [▼]   Day [▼]   Year [▼]                            │
│  Validation: all three required if shown ·                  │
│  "Add the date so we can send on time."                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Continue →]                                               │
│  RED · full-width · disabled (40% opacity) until all        │
│  required fields filled · enables with subtle pulse         │
│                                                             │
│  [HELPER TEXT — shown only if user lingers >10s]            │
│  "You can add more people and occasions later.              │
│   Start with whoever matters most right now."               │
│  Caveat font · GRAY · centered below button                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Step 2 — "What Are They Like?"

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo · top-left]        [← Back · top-left]  │
│                                                             │
│  ●●○○  [dot 2 filled RED]                                  │
│                                                             │
│  WHAT ARE THEY LIKE?                                        │
│  Bebas Neue · 36px · BLACK                                  │
│                                                             │
│  Help us write in your voice, not ours.                     │
│  Plus Jakarta Sans · GRAY                                   │
│                                                             │
│  ─── THEIR PERSONALITY VIBE ───────────────────────────    │
│  Pick one. Optional — we'll make a smart guess if you skip. │
│  12px · GRAY                                                │
│                                                             │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ 💛 Sweet &       │ │ 😄 Funny &       │                 │
│  │   Sentimental    │ │   Sarcastic      │                 │
│  └──────────────────┘ └──────────────────┘                 │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ 🕊 Calm &        │ │ 💪 Tough Love    │                 │
│  │   Graceful       │ │                  │                 │
│  └──────────────────┘ └──────────────────┘                 │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ 🎭 A Bit         │ │ 🌿 Down to       │                 │
│  │   Dramatic       │ │   Earth          │                 │
│  └──────────────────┘ └──────────────────┘                 │
│  Selected: RED border + light RED background tint           │
│  Max 1 — tapping a second deselects the first               │
│                                                             │
│  ─── WHAT DO THEY LOVE? ────────────────────────────────   │
│  Pick 1 or 2. What would make them smile in a card?         │
│  12px · GRAY · Required (minimum 1)                         │
│                                                             │
│  [Family & kids] [Travel] [Food & cooking] [Reading]        │
│  [Fitness] [Music & arts] [Animals] [Nature]                │
│  [Movies & TV] [Fashion]                                    │
│  Pill/chip style · wrap to multiple rows                    │
│  Selected: SAGE background · white text                     │
│  Max 2 — tapping a third deselects the oldest               │
│  Validation: "Pick at least one thing they love."           │
│                                                             │
│  ─── ANYTHING WE SHOULD NEVER PUT IN A CARD? ──────────    │
│  Optional — takes 5 seconds, prevents embarrassments.       │
│  12px · GRAY                                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ e.g. "no religion, don't mention her old job"        │  │
│  └──────────────────────────────────────────────────────┘  │
│  Single short text input · no minimum length · no label     │
│                                                             │
│  [Continue →]                                               │
│  RED · full-width · requires ≥1 interest                    │
│                                                             │
│  [TRANSITION COPY — brief fade shown as screen exits        │
│   when Continue is tapped; card generation fires here]      │
│  "We're already working on [Name]'s first card..."          │
│  Caveat font · GRAY · centered · 1.5s display               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Technical note:** When the user taps Continue on Step 2, the card generation API call fires immediately in the background. The transition copy appears briefly, then Step 3 loads. By the time the user completes Step 3, the card should be ready or nearly ready.

---

### Screen 5: Step 3 — "One Real Thing"

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo · top-left]        [← Back · top-left]  │
│                                                             │
│  ●●●○  [dot 3 filled RED]                                  │
│                                                             │
│  ONE REAL THING.                                            │
│  Bebas Neue · 36px · BLACK                                  │
│                                                             │
│  [RELATIONSHIP-SPECIFIC PRIMARY PROMPT — see Part 3]        │
│  Plus Jakarta Sans · 17px · BLACK                           │
│                                                             │
│  This is your secret weapon. One line is enough.            │
│  Caveat font · GRAY · 15px                                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  [relationship-specific placeholder text]           │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  Multiline textarea · no character minimum or maximum       │
│  Completely optional — user can skip entirely               │
│                                                             │
│  ─── WHAT SHOULD WE CALL THEM? ─────────────────────────   │
│  Nickname or pet name — if you use one. Optional.           │
│  12px · GRAY                                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ e.g. "Mom", "Babe", "Big Steve"                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  Short single-line text · optional · no validation          │
│                                                             │
│  [Show Me The Card →]                                       │
│  RED · full-width · always enabled (both fields optional)   │
│                                                             │
│  [Nothing specific — just write something warm]             │
│  Text link · GRAY · below button                            │
│  Clears textarea · sets skip flag · advances to Step 4      │
│  Card generates using profile data only                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [LOADING OVERLAY — only shown if card not yet ready        │
│   when user taps either button on this step]                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Full BG: #F2E6D3]                                 │  │
│  │                                                      │  │
│  │  [Animated envelope illustration — centered]         │  │
│  │                                                      │  │
│  │  WRITING [NAME]'S CARD.                              │  │
│  │  Bebas Neue · 28px · centered                        │  │
│  │                                                      │  │
│  │  "Making sure this sounds like you."                 │  │
│  │  Caveat · GRAY · centered                            │  │
│  │                                                      │  │
│  │  [Shimmer progress bar across bottom]                │  │
│  │  Expected: 10–20 seconds                             │  │
│  │                                                      │  │
│  │  [Fallback shown at 30s if generation stalls]        │  │
│  │  "We're still writing — we'll notify you when        │  │
│  │   it's ready. Take a look at your dashboard."        │  │
│  │  Routes to dashboard · card appears as notification  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Screen 6: Step 4 — "Here's Your First Card"

*(Full design in Part 4)*

---

### Screen 7: Address Collection

*(Full design in Part 5)*

---

### Screen 8: Post-Card Expansion

*(Full design in Part 6)*

---

### Screen 9: Dashboard — First-Time State

*(Full design in Part 8)*

---

## Part 3 — Relationship-Specific Memory Prompts

### Design Rules Applied to All Prompts

1. **Present tense or recent past** — activates recent memory more reliably than open-ended nostalgia questions.
2. **Concrete over abstract** — "obsessed with" outperforms "passionate about" because it's specific and slightly playful.
3. **One question only** — split attention produces weaker answers; one focused question produces useful ones.
4. **Fallback is always lower-stakes** — for users who couldn't answer the primary.
5. **Placeholder text** shows what a good answer looks like without pressuring the user.

---

### Wife / Girlfriend / Partner (Female)

**Primary prompt:**
> "What's going on in [Name]'s world right now — something you'd want the card to quietly reference?"

**Placeholder text:**
> e.g. "She just got promoted," "We've been renovating the kitchen for 4 months," "She's been training for a half marathon"

**Fallback prompt:**
> "What's one thing about [Name] right now that only you would know?"

**Example answer that produces excellent card material:**
> "She finally left her toxic job and started freelancing. She's terrified but happier than she's been in years."

**Why it works better than generic:**
Partner relationships carry the highest emotional stakes and the most recent shared context. "Her world right now" is low-effort to answer because the user literally lives with or talks to this person constantly. The phrase "quietly reference" signals sophistication — the card won't broadcast the fact, it'll just feel personal. The fallback shifts to knowledge asymmetry ("only you would know") which activates intimacy rather than abstract recall.

---

### Husband / Boyfriend / Partner (Male)

**Primary prompt:**
> "What's [Name] into lately — or what's he been going through?"

**Placeholder text:**
> e.g. "Obsessed with his fantasy football team," "Work has been really stressful lately," "He just got into woodworking"

**Fallback prompt:**
> "What's one thing about [Name] that always makes you laugh or shake your head?"

**Example answer:**
> "He's been stress-buying power tools and now our garage is a full workshop. He's made one shelf in three months."

**Why it works better than generic:**
"Into lately" and "going through" cover both positive and challenging contexts without directing the user toward sentiment they may not feel. The fallback activates humor and familiarity rather than earnestness, which is a lower-pressure entry point and often produces more card-usable material than abstract warmth.

---

### Mom

**Primary prompt:**
> "What's Mom been up to lately — or what's been on her mind?"

**Placeholder text:**
> e.g. "She's been helping with the grandkids a lot," "She just retired," "She worries too much but that's Mom"

**Fallback prompt:**
> "What would make Mom cry happy tears if she read it in a card?"

**Example answer:**
> "She's been battling some health stuff but never complains. She just keeps showing up for everyone else."

**Why it works better than generic:**
"What's been on her mind" opens the door to both happy and difficult life circumstances without specifying direction. A health situation, a big family moment, retirement, an empty nest — all surface naturally. The fallback is deliberately emotional ("cry happy tears") because Mom relationships typically welcome that register and it bypasses analytical filtering to access something more instinctive.

---

### Dad

**Primary prompt:**
> "What's Dad been focused on lately? Work, a project, retirement, family — anything."

**Placeholder text:**
> e.g. "He finally retired and doesn't know what to do with himself," "He's been fixing up the old truck," "He's been babysitting the grandkids constantly"

**Fallback prompt:**
> "What's one thing you'd want Dad to know you notice about him?"

**Example answer:**
> "He drove four hours to help me move without being asked. Just showed up."

**Why it works better than generic:**
Dad relationships often have lower expressed emotional bandwidth in text form, so the primary is intentionally practical — "focused on" is activities-oriented and doesn't require emotional vocabulary to answer. The fallback shifts to appreciation and witnessing ("you notice") which tends to produce the most moving answers from users who are uncomfortable with sentimentality but deeply want to express it.

---

### Grandparent (Grandma / Grandpa)

**Primary prompt:**
> "What's something [Name] does or says that only your family would understand?"

**Placeholder text:**
> e.g. "She calls everyone 'honey' even if she can't remember their name," "He still tries to fix everything with duct tape and a prayer"

**Fallback prompt:**
> "What's one thing [Name] does that you hope you still remember in 20 years?"

**Example answer:**
> "He ends every phone call with 'be good or be good at it' — he's been saying it my whole life and I still love it."

**Why it works better than generic:**
Grandparent relationships are defined by family-specific details — phrases, habits, rituals — that no generic AI could guess. This prompt activates that layer directly. The fallback shifts to legacy and memory, which is emotionally appropriate for this relationship type and typically produces longer, more useful answers.

---

### Sister / Brother

**Primary prompt:**
> "What's going on in [Name]'s life right now that you two talk about?"

**Placeholder text:**
> e.g. "She just moved to a new city," "He's been job hunting for months," "We've been arguing about who Mom likes more (me, obviously)"

**Fallback prompt:**
> "What's something [Name] does that only siblings would understand?"

**Example answer:**
> "She finally started going to therapy and it's helping. She seems lighter. I'm really proud of her even though I'd never say it to her face."

**Why it works better than generic:**
Sibling relationships are distinguished by shared history and a specific brand of humor. "What you two talk about" activates the most recent shared context. The fallback explicitly invokes sibling-specific experience, which produces funnier, more specific answers and which the AI uses to shift register appropriately toward that warm-but-competitive sibling dynamic.

---

### Friend

**Primary prompt:**
> "What's [Name] going through right now, or what are they excited about?"

**Placeholder text:**
> e.g. "She just started a new job she loves," "He's been going through a rough patch," "They're training for their first marathon"

**Fallback prompt:**
> "What's one thing about [Name] that would make them laugh if it showed up in a card?"

**Example answer:**
> "She's been absolutely ruthless at Wordle and texts me her score every single morning. I've blocked her twice."

**Why it works better than generic:**
Friend relationships span the widest range of emotional contexts. "Going through / excited about" is directionally neutral and catches both positive and difficult moments. The fallback shifts to humor, which is a lower-stakes default for friendships and which produces more card-usable specifics than abstract warmth.

---

### Employee

**Primary prompt:**
> "What has [Name] done recently that deserves to be acknowledged?"

**Placeholder text:**
> e.g. "Handled a tough client situation without being asked," "Stayed late to help the team hit the deadline," "Always the first to lift morale when things get stressful"

**Fallback prompt:**
> "What's one quality [Name] brings to work that you don't say out loud enough?"

**Example answer:**
> "He took on a project nobody wanted and made it work without a single complaint. The client loved it."

**Why it works better than generic:**
Employee cards are professional appreciation — the primary anchors to recent accomplishment (specific, card-usable) rather than general character. The fallback activates expressed appreciation the sender has probably felt but never said, producing cards that feel like something beyond an HR formality.

---

### Client

**Primary prompt:**
> "What's going well in your relationship with [Name] or their business right now?"

**Placeholder text:**
> e.g. "We just closed a big deal together," "They've been a client for 5+ years," "They referred two new clients last month"

**Fallback prompt:**
> "What's one thing about [Name] that makes them a pleasure to work with?"

**Example answer:**
> "She always responds within the hour and never second-guesses the work. Dream client. I want to keep her forever."

**Why it works better than generic:**
Client cards must balance warmth with professionalism. The primary focuses on the business relationship positively — recent success, shared achievement, tenure — which produces warm but professional-grade card content. The fallback generates character appreciation at a register that is genuine without being overreaching.

---

## Part 4 — First Card Experience

### Generation Timing

Card generation fires at the **Step 2 → Step 3 transition** — the moment the user taps Continue on Step 2. At this point the system has: name, relationship, occasion, date, personality (or smart default), interests, and the "avoid" field. This is sufficient for a complete first draft.

By the time the user finishes Step 3 (~40 seconds), the card should be complete. Step 4 loads the finished card immediately in the vast majority of cases.

---

### What the User Sees First

No landing illustration. No congratulations header. No modal. The card renders as the primary element on screen.

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo · top-left]                              │
│                                                             │
│  ●●●●  [all 4 dots filled — onboarding complete]           │
│                                                             │
│  HERE'S [NAME]'S CARD.                                      │
│  Bebas Neue · 36px · BLACK                                  │
│                                                             │
│  Read it. It's written from what you told us.               │
│  Plus Jakarta Sans · GRAY                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Card rendered on parchment/cream background]       │  │
│  │                                                      │  │
│  │  "For [Name]"                                        │  │
│  │  Caveat font · GRAY                                  │  │
│  │                                                      │  │
│  │  [Card body — full copy, not truncated]              │  │
│  │  Plus Jakarta Sans · BLACK · readable line-height    │  │
│  │                                                      │  │
│  │  — [Sender name]                                     │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Send This Card →]                                         │
│  RED · full-width · primary action                          │
│                                                             │
│  [Something's off — fix one thing]                          │
│  Text link · GRAY · below button                            │
│                                                             │
│  [Not now — see my dashboard]                               │
│  Smallest text · lowest hierarchy · below revision link     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Loading Experience

Shown only if generation is not complete when user reaches Step 4. This is the exception, not the rule.

```
[Full-viewport overlay — BG #F2E6D3]

[Animated envelope icon — centered, subtle motion]

WRITING [NAME]'S CARD.
Bebas Neue · 28px · centered

"Making sure this sounds like you."
Caveat · GRAY · centered

[Shimmer progress bar across bottom — no percentage shown]

If >30 seconds:
  "We're still working on it — we'll send you a
   notification when it's ready."
  [Go to Dashboard →]
  Card saved as draft · status: generating
```

---

### Editing Controls

**What is available:**

**Revision input (secondary CTA):**
Tapping "Something's off — fix one thing" reveals a single inline text field below the card:

```
┌──────────────────────────────────────────────────────────┐
│ What would you change?                                   │
│ [_________________________________________________]      │
│ [Rewrite it →]  ← RED · generates revised version       │
│ [Never mind]  ← text link · collapses input              │
└──────────────────────────────────────────────────────────┘
```

The revised version replaces the current card in view. The revision input resets. The user can revise one more time if needed.

**Regenerate entirely (tertiary — less prominent):**
Small text link: "Try a completely different version" — fires fresh generation, discards previous version.

---

### Revision Limit and Anti-Tweaking Mechanism

**Maximum: 2 revisions on first card.**

After the second revision is submitted, the "Something's off" link is replaced with:

> "Save this version and come back to it — you can always update from your dashboard."
> [Save and Continue →] ← RED
> [Try one more version] ← small text link (fires one final regeneration, after which the save prompt is the only option)

**Why this prevents endless tweaking:**
The copy reframes the situation as "you've seen enough versions to make a call" rather than "you've hit a limit." The product stays in "autopilot" mode — you don't endlessly revise autopilot output, you approve and move forward. Users who insist on more control can use the full card editor on their dashboard later.

---

### What Is Hidden on This Screen

- Line-by-line text editing of card body (user is a sender, not an editor)
- Tone, length, or style configuration sliders (belong on recipient profile)
- Multiple variation previews side-by-side (creates decision paralysis)
- Any pricing or plan information (wrong moment)
- Comparison to a "demo" version

---

### Approval Flow

| User action | Result |
|---|---|
| Tap "Send This Card →" | Advances to Address Collection screen |
| Tap "Something's off — fix one thing" | Reveals revision input inline |
| Submit revision | New card version replaces current; revision count increments |
| Hit revision limit | "Save this version" prompt appears |
| Tap "Not now — see my dashboard" | Card saved as `draft_approved` on recipient profile; dashboard first-time state shown |

---

## Part 5 — Address Collection Experience

### Exact Timing

Collected immediately after the user taps **"Send This Card →"** on Step 4. The card is the credibility anchor. The user has seen the product work and now understands exactly what the address is for. This is the highest-intent moment in the session.

Collecting the address before the card (as in the current flow) signals "give us something before we show you anything." Collecting it here signals "you approved something real — here's how to complete it."

---

### Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo · top-left]                              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  WHERE SHOULD WE SEND IT?                                   │
│  Bebas Neue · 36px · BLACK                                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Card thumbnail — small, left-aligned]              │  │
│  │  [Name]'s [Occasion] card · Ships [estimated date]  │  │
│  │  Plus Jakarta Sans · 13px · GRAY                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Street address *                                     │  │
│  │ [________________________]                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Apt, suite, or unit (optional)                       │  │
│  │ [________________________]                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────┐ ┌──────┐ ┌─────────────────────┐   │
│  │ City *            │ │State*│ │ Zip code *           │   │
│  │ [_____________]   │ │ [__] │ │ [___________]        │   │
│  └───────────────────┘ └──────┘ └─────────────────────┘   │
│                                                             │
│  [Ship It →]                                                │
│  RED · full-width · disabled until street/city/state/zip   │
│                                                             │
│  [Not yet — I'll add this later]                            │
│  Text link · GRAY · below button                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  "We keep your address on file so future cards are          │
│   one click. Update it anytime in Settings."                │
│  Plus Jakarta Sans · 12px · GRAY                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Copy Direction

Headline: "Where should we send it?" — not "Enter your mailing address." The frame stays on the card and the recipient, not the data field. The thumbnail above the form is a persistent visual anchor for what the address enables.

---

### Validation Messages

| Field | Required? | Validation message |
|---|---|---|
| Street address | Yes | "We need a street address to ship the card." |
| City | Yes | "City is required." |
| State | Yes | "State is required." |
| Zip code | Yes | "Zip code is required." |
| Zip format | Format check | "That doesn't look like a valid zip code." |
| Apt/suite | No | No validation |

Validation appears inline below each field on blur, not all at once on submit.

---

### Skip Behavior

Tapping "Not yet — I'll add this later":
- Card saved with status: `approved_awaiting_address`
- Dashboard shows a persistent (non-blocking) nudge: "Ship [Name]'s card → Add a mailing address"
- No expiration warnings, no countdown, no guilt copy
- Nudge dismissed permanently once address is added

---

### Confirmation Flash

After "Ship It →" is tapped and address saved:

```
[Full-screen flash — BG #F2E6D3, 1.5s duration]

✓  DONE.
Bebas Neue · 28px · SAGE green

"[Name]'s card is queued. We'll handle the rest."
Plus Jakarta Sans · GRAY

[Auto-advances to Post-Card Expansion screen]
```

Short. No confetti. Autopilot products confirm and move forward.

---

## Part 6 — Post-Approval Expansion Screen

### Priority Order: Additional Occasions First, Then Second Recipient

**Why this order:**
The user has already established trust with this product for this person. Adding two more occasions takes 20 seconds and meaningfully expands the value they'll receive — it directly reinforces the "autopilot" promise. A second recipient is a larger commitment that works better once the user has a moment of satisfaction with the first.

"Add another person" is shown as a clear CTA below the occasions section, not buried.

---

### Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  F*I FORGOT  [logo · top-left]                              │
│                                                             │
│  ANY OTHER OCCASIONS FOR [NAME]?                            │
│  Bebas Neue · 32px · BLACK                                  │
│                                                             │
│  "Tap to add — we'll take care of the rest."                │
│  Caveat · GRAY                                              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ✓ [Birthday — July 12]  ← SAGE bg · already selected      │
│  (locked · first occasion always shown as confirmed)        │
│                                                             │
│  [Remaining occasions filtered for this relationship]       │
│  Shown as compact tap-to-add rows:                          │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ + Christmas / Holiday                 [+ Add]      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ + Valentine's Day                     [+ Add]      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ + Just Because                        [+ Add]      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ + See all occasions…                  [+]          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  [Tapping "+ Add" on a date-sensitive event expands         │
│   an inline date input. Non-date events (Christmas,         │
│   Just Because) add immediately on tap.]                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  WHO ELSE SHOULD WE COVER?                                  │
│  Bebas Neue · 28px · BLACK                                  │
│                                                             │
│  "Most people have 3–5 people they never want to forget."   │
│  Plus Jakarta Sans · GRAY · 14px                            │
│                                                             │
│  [Add Another Person →]                                     │
│  SAGE background · white text · full-width                  │
│  (SAGE = growth action · RED = primary/send action)         │
│                                                             │
│  [I'm good for now — see my dashboard]                      │
│  Text link · GRAY · always visible                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### "Add Another Person" Flow

Tapping "Add Another Person →" returns to **Step 1 of the onboarding wizard** with:
- Progress bar hidden (not a fresh setup, just an addition)
- Page header changed to: "WHO'S NEXT?"
- Same form, same card generation, same 4-step flow
- After Step 4 and Address Collection for person #2, returns to this Event Expansion screen for person #2

This is not a separate "add recipient" page — it reuses the exact onboarding flow with minimal chrome changes. No new pages or components required.

---

### Goals Addressed (in priority order)

| Priority | Goal | How addressed |
|---|---|---|
| 1 | Add additional occasions for first recipient | Top of screen — compact tap-to-add rows |
| 2 | Add a second recipient | "Add Another Person →" CTA — prominent but below occasions |
| 3 | Improve profile quality | Deferred — belongs on recipient profile page, not here |
| 4 | Enable reminders | Deferred — default 14-day preview timing already set; no action needed here |
| 5 | Invite spouse | Deferred — belongs in Settings or a sharing feature, not post-onboarding |

---

## Part 7 — Progressive Profiling Map

| Field | Where collected later | Trigger | Expected completion rate | Reason for timing |
|---|---|---|---|---|
| Additional occasions (2+) | Event Expansion screen (same session, post-first-card) | User reaches post-approval screen | High (70–80%) — user is in the session, action is easy | Highest intent moment in session; adding events takes <20 seconds per event |
| Preview timing (heads-up days) | `/settings/reminders` · AccountMenu | Dashboard nudge shown once after day 7 | Low-medium (20–30%) — most users leave default | Operational preference with no emotional content; 14-day default is acceptable; surfacing during onboarding at zero experience provides no basis for a decision |
| Emotional level / card depth | Recipient profile → Card Settings section | Shown after user has approved ≥1 card | Low (10–20%) — most users leave default | Users need to experience a card before they have an opinion on "depth." Before that it is meaningless configuration. |
| Second personality trait | Recipient profile page | Profile completeness nudge: shown when completeness <60% | Medium (40–50%) — users who visit profile engage | One trait is the minimum usable input; second is an enrichment the user understands better after seeing how the first trait shaped their card |
| Additional interests (3+) | Recipient profile page | Relationship health nudge: "thin context" flag | Medium (35–45%) — triggered by health score visibility | First 1–2 interests establish the baseline; further interests are meaningful improvements, not setup requirements |
| Inside jokes | Recipient profile → "What We Know" section | Nudge card on profile: "Add an inside reference" | Low-medium (25–35%) — high when user thinks of one | Recall on demand is difficult; users remember inside jokes when scrolling through a profile on a relaxed afternoon, not during a setup wizard |
| Years together | Partner profile page + First anniversary briefing | Profile: prompt card on partner profiles. Briefing: pre-fill question on first anniversary card | Medium (50–60%) — high motivation when anniversary is near | Only meaningful for anniversary/Valentine's; irrelevant if first card is a birthday; surfacing at the relevant moment produces much higher quality answers |
| Children's / grandchildren's names | Father's Day / Mother's Day briefing | Inline question before briefing opens: "Who are we celebrating?" | High (75–85%) — user is explicitly generating that card | Only needed for those specific cards; collecting during onboarding for a user whose first card may be a birthday is premature and confusing |
| Pet name / nickname | Step 3 (lightly optional) AND recipient profile | Step 3: shown as one-line optional field. Profile: inline edit nudge if field is blank | Medium-high (55–65%) — Step 3 captures many; profile catches the rest | Step 3 is the right first moment because it directly affects card #1's salutation; profile serves as fallback |
| Mailing address | Address Collection screen (same session, post-approval) | User taps "Send This Card →" on Step 4 | High (80–90%) — user has just approved a card; intent is high | Trust-based transaction that belongs after value is demonstrated; before that it feels extractive |
| Things to avoid | Step 2 (optional inline field — kept in onboarding) | Part of Step 2 layout | Medium (40–50%) — users with specific concerns fill it in | Moved from Step 5 to Step 2 but kept in onboarding; affects card #1 quality and has high stakes for partner relationships; low effort to add |

---

## Part 8 — Dashboard Impact

### First Dashboard Visit — New User State

A user arriving at the dashboard after the new onboarding has completed has:
- 1 recipient configured
- 1 card approved or in `approved_awaiting_address` state
- 1–3 occasions set on that recipient
- An address entered or deferred
- No second recipient yet

The current dashboard's empty-state design must be replaced with a **first-time success state** — not a blank page, not a gap report, but a reflection of what was just accomplished.

```
┌─────────────────────────────────────────────────────────────┐
│  GOOD START.                                                │
│  Bebas Neue · 32px · BLACK                                  │
│                                                             │
│  "You've got [Name] covered. Here's who's next."            │
│  Plus Jakarta Sans · GRAY                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Name] · [Relationship]              SAGE border    │  │
│  │  ✓ [Occasion · date] — queued / awaiting address    │  │
│  │  [View Card →]                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │   + Add a person  →                                 │  │
│  │   [Dashed RED border · centered · full card size]    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  UPCOMING                                                   │
│  [Compact event list — next 2–3 events across recipients]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The "Add a person" tile occupies a full card slot alongside the first recipient's card, maintaining visual parity — it is a structural peer of the first person's card, not a small nudge.

---

### Relationship Health — First-Time State

A new user with 1 recipient and a fresh card approved should see a **positive health state**. Health scoring and indicators are already implemented and should remain unchanged. What changes is how **incomplete profiles from the shorter onboarding are framed** on the dashboard.

| Profile completeness after new onboarding | Dashboard treatment |
|---|---|
| 0–40% | "Getting started" — SAGE chip, copy: "Your autopilot is running" |
| 40–70% | "Growing" — profile nudge cards for specific missing fields (not a score callout) |
| 70–100% | Full health display as currently implemented |

New users should never see a red/low health score on their first dashboard visit. They just set up the account. The system has enough to do its job and the health display should reflect that.

---

### Recommended Next Step — First Session

| User state | Recommended Next Step shown |
|---|---|
| 1 recipient · card queued · address entered | "Add another person →" |
| 1 recipient · card approved · no address entered | "Ship [Name]'s card → Enter address" |
| 1 recipient · card pending revision | "Finish approving [Name]'s card →" |
| 0 recipients (edge case) | "Set up your first person →" → redirects to onboarding Step 1 |

---

### People Growth — Ongoing Dashboard Behavior

After the first-time state (user has 2+ recipients), the "Add a person" tile shrinks but remains visible as the last slot in the people grid — always one card beyond the current count.

Adding people should feel like a natural extension of the existing experience, not a "Settings → Add Recipient" workflow. The persistent tile in the grid creates ambient growth invitation without requiring a separate prompt or CTA.

---

### Recipient Profile Completeness — Adjustments

Each recipient's profile page should show a lightweight completeness indicator. Not a percentage — something more intuitive:

| Field group | Shown as |
|---|---|
| Relationship + occasion + date | ✅ Core setup complete |
| At least 1 personality trait + 1 interest | ✅ Voice set |
| Personal detail / memory logged | ⬜ (nudge: "Add something real") |
| Nickname set | ⬜ (nudge: "Add a nickname") |
| 2+ interests logged | ⬜ (shown only when 1 is set) |

"Complete" is 5/5. Most users arrive at 3/5 after the new onboarding. The two open slots are the natural pull toward the profile, surfaced as small nudge cards — not red warnings.

---

## Part 9 — Final Product Recommendation

This is the complete onboarding blueprint. One direction. No alternatives.

---

### The Flow

```
Sign Up
  │
  ▼
Step 1 — "Who's First?"
  → Name + Relationship + 1 Occasion + Date
  → ~50 seconds
  │
  ▼
Step 2 — "What Are They Like?"
  → Personality (optional, 1) + 1–2 Interests + Avoid (optional)
  → Card generation fires in background
  → ~35 seconds
  │
  ▼
Step 3 — "One Real Thing"
  → Relationship-specific memory prompt (skippable)
  → Nickname (optional)
  → ~40 seconds
  │
  ▼
[Loading state if needed — expected <5s, max 30s]
  │
  ▼
Step 4 — "Here's Your First Card"
  → Card rendered immediately
  → Primary: "Send This Card →"
  → Secondary: "Something's off — fix one thing" (max 2 revisions)
  → Tertiary: "Not now — see my dashboard"
  → ~60 seconds
  │
  ├──[If "Send This Card →"]
  │     ▼
  │   Address Collection
  │   → "Where should we send it?"
  │   → Skip available
  │   → ~30 seconds
  │     │
  │     ▼
  │   Confirmation Flash (1.5s)
  │     │
  │     ▼
  │   Post-Card Expansion
  │   → Additional occasions (tap-to-add rows)
  │   → "Add Another Person →" (SAGE button)
  │   → "I'm good for now" skip
  │   → ~60 seconds
  │
  └──[If "Not now — see my dashboard"]
        ▼
      Dashboard — First-Time State
      → First recipient with success state
      → "Add a person" as full card tile
      → Upcoming events list
      → Recommended Next Step

[Both paths converge at Dashboard]
```

**Total time to first card draft visible: ~3 minutes**
**Total time to first card shipped: ~4–5 minutes**
**Current flow: 9–18 minutes to first card draft**

---

### What This Achieves

**Fast first value:** The card draft is visible within 3–4 minutes of sign-up, with generation running in the background during Steps 2–3. The first session ends with something tangible — a real card, not a configuration screen.

**Strong first card quality:** Step 3's memory prompt — the highest-impact card quality input in the system — is captured before the card generates, not in a separate post-onboarding flow most new users never reach. Even the skip path produces a card better than what most people would write unassisted.

**Long-term relationship database growth:** The 4-step flow captures the correct minimum for a great first card. Every other field is deferred to the moment where providing it is most motivated and most natural — the post-approval expansion screen, the profile page, the annual briefing flow. These channels already exist in the product; the proposal routes deferred fields into them rather than creating new infrastructure.

---

### What Does Not Change

- Database schema
- `OnboardingData` type (all fields remain; new flow collects a subset)
- Question engine and event-specific briefing questions
- Recipient memory storage model
- Follow-up questions, fresh updates, Brownie Points, relationship health scoring logic
- Pricing, billing, Handwrytten integration
- All pages outside the onboarding wizard + dashboard first-time state

---

### Implementation Summary for Engineering

| Component | Change type | Complexity |
|---|---|---|
| `onboarding.tsx` | Rewrite: reduce to 4 steps, new step logic, relationship-specific prompts in Step 3, Step 4 card preview, remove address/timing/slider/inside-jokes from wizard | Medium |
| Card generation trigger | New: fire generation from onboarding state at Step 2 → Step 3 transition, not post-briefing | Medium |
| Step 4 card display component | New: reusable card preview component embeddable in onboarding frame and standalone | Medium |
| Address Collection screen | New: standalone screen shown after Step 4 approval, before Post-Card Expansion | Low |
| Post-Card Expansion screen | New: occasion tap-to-add rows + "Add Another Person" loop back to Step 1 | Low |
| `dashboard.tsx` | Update: first-time state (1 recipient, post-onboarding) — distinct layout, success framing, "Add person" card slot | Low |
| Recipient profile page | Update: progressive profiling nudge cards for missing fields (nickname, 2nd trait, inside jokes) | Low |
| Health display | Update: "Getting started" positive frame for new users; no red health state on first visit | Low |
| `data.ts` or equivalent | Small: relationship → tone default mapping; relationship → top 2–3 suggested occasions mapping | Low |

---

*Document status: Final. Ready for design and engineering review.*
*No additional product decisions required before development begins.*

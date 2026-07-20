# Writing Evaluation Framework V2 Corpus

> Evaluation-eligible complete corpus.

- corpusId: pilot-9B.1-v2-20260720
- generatedAt: 2026-07-20T18:49:18.766Z
- status: complete
- evaluationEligible: true
- notForScoring: false
- baseUrl: http://127.0.0.1:8080
- productionImplementationCommit: 2aab24385168438b12500e33d23443d662d75a63
- harnessCommit: 6bcf6e71d45b31afd16fb2db680688a7a34ad656
- branch: frontend-rebuild
- writingContract: Evaluates production writing at 2aab24385168438b12500e33d23443d662d75a63 (Sprint 9B.1 closing + GPT-5 generate 8000). Harness commits after that SHA are evaluation assets only.
- succeeded: 20 / 20
- failed: (none)
- semantics: one request per scenario, zero retries, first-returned card only
- frozen V1 corpus at pilot-9A.2/ not overwritten

## G01 — Mom thank-you — primary + vivid support (8D regression writing face)

- flow / requestMode: guest
- occasion: Thank You
- relationship: Mom
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

Mom,
Thank you for helping me find new health insurance. You didn’t let up—you fought with everyone until the coverage actually matched what I needed. I know that kind of back-and-forth is a grind, and you took it on so I wouldn’t have to. It means a lot that you handled something so important and complicated. With the new health insurance in place, I can breathe easier—because of you. Love, James

## G02 — Mom thank-you — primary only, Simple tone

- flow / requestMode: guest
- occasion: Thank You
- relationship: Mom
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Mom, you helped me find new health insurance.
Sorting through plans and fine print is a headache.
It’s a relief to have coverage in place.
I’m really grateful you helped me get this coverage sorted. Love, James

## G03 — Friend birthday — sparse guest, Funny

- flow / requestMode: guest
- occasion: Birthday
- relationship: Friend
- authFidelity: n/a
- contextRichness: sparse
- attempts: 1

### 1. Draft

Consider this your annual proof-of-life ping: happy birthday, Alex.
Also, I'm glad we're friends—logging that here for the record.
Birthday stated, friendship confirmed. Proceed to cake. — Jamie

## G04 — Wife anniversary — romantic + deep

- flow / requestMode: guest
- occasion: Anniversary
- relationship: Wife
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

Sara,
On our anniversary, what means the most to me is choosing each other on ordinary Tuesdays, not just the big days.
It’s the quiet, daily yes that adds up—where our life actually lives. You still save me the last piece of toast without making a speech about it. That small act says “I choose you” louder than any grand gesture, and I feel it every time. Thank you for choosing me in the ordinary, again and again. I choose you, today and every ordinary Tuesday ahead. Forever, Michael

## G05 — Dad Christmas holiday — warm

- flow / requestMode: guest
- occasion: Holiday
- relationship: Dad
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Dad,
Thanks for driving through that storm so we could all be home for Christmas dinner.
That wasn’t an easy drive, and you got us there.
Glad we made it home for Christmas dinner because of you.
Merry Christmas. Love you, Chris

## G06 — Friend sympathy — careful heartfelt

- flow / requestMode: guest
- occasion: Sympathy
- relationship: Friend
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Morgan—
I'm so sorry about your dad. I've been thinking about you every day this week. I know there isn't a right sentence for this, but I care about you and I'm here in whatever way actually helps—talking, a quiet walk, coffee, or just sitting with you. If you want to share about your dad or not say anything at all, I'm with you either way. With love, Priya

## G07 — Son congratulations — graduation-like win

- flow / requestMode: guest
- occasion: Congratulations
- relationship: Son
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

Noah—finishing your first marathon after six months of early-morning training is no small thing. I still think about your mile 18 text saying your legs were done—and then you went and finished anyway. Those early alarms and tough miles add up, and you still got it done. Take a breath, let that finish-line feeling sink in, and maybe sleep past sunrise tomorrow—you earned it. Proud of you — Dad

## G08 — Husband apology — direct

- flow / requestMode: guest
- occasion: Apology
- relationship: Husband
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

David, I snapped at you about the weekend plans, and you didn’t deserve that. You were only trying to make Saturday easier for both of us, and I met it with attitude instead of listening. That was my stress talking — not fair to you. I’m owning it. Next time I’ll take a breath and plan it with you, not against you. I want us on the same page about Saturday; can we reset and figure it out together? I'm sorry — Lena

## G09 — Daughter just because — nostalgic

- flow / requestMode: guest
- occasion: Just Because
- relationship: Daughter
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Ellie,
I've been missing our Sunday pancake mornings since you moved out. No big reason—just that quiet stretch of the weekend feels different without you. I'm proud of you and the life you're building, and I still miss those pancakes with you.
Next time you're here on a Sunday, let's make a fresh stack.
Love, Mom

## G10 — Grandparent thinking of you — simple sparse

- flow / requestMode: guest
- occasion: Thinking Of You
- relationship: Grandparent
- authFidelity: n/a
- contextRichness: sparse
- attempts: 1

### 1. Draft

Nana,
I keep thinking about you this week and wanted you to know.
I’m grateful to have you as my Nana.
Love, Jordan

## G11 — Coworker thank-you — respectful

- flow / requestMode: guest
- occasion: Thank You
- relationship: Coworker
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Sam — Thank you for covering my client calls last Thursday so I could make the school pickup. I know stepping into client conversations takes extra focus, and you handled the calls so nothing stalled.
I really appreciate you making that school pickup possible. Thanks again — Taylor

## G12 — Boss congratulations — promotion

- flow / requestMode: guest
- occasion: Congratulations
- relationship: Boss
- authFidelity: n/a
- contextRichness: primary_only
- attempts: 1

### 1. Draft

Patricia — congratulations on your promotion to VP. The team is lucky to keep learning from how you run a room.
I’m glad to support you in this next chapter. Congratulations — Avery Chen

## G13 — Teacher thank-you — warm

- flow / requestMode: guest
- occasion: Thank You
- relationship: Teacher
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

Ms. Alvarez, thank you for helping my daughter get confident at reading this year. Not long ago she hid behind her hair when it was her turn; now she volunteers to read. The attention you’ve given to her reading has made a real difference. That confidence will carry forward. Grateful — The Park family

## G14 — Sister birthday — Funny with roast pressure

- flow / requestMode: guest
- occasion: Birthday
- relationship: Sister
- authFidelity: n/a
- contextRichness: primary_plus_support
- attempts: 1

### 1. Draft

Your birthday’s here again, and you’re still the person I call when my life is sideways. Proof: the time you showed up with tacos and zero advice—which was perfect.
Happy Birthday, Casey.
I’m grateful you’re my go-to when life tilts. Don't age too hard — Riley

## G15 — Auth-shaped Dad birthday — rich relationship profile (body relAnswers only)

- flow / requestMode: authenticated_body
- occasion: Birthday
- relationship: Dad
- authFidelity: relAnswers_only
- contextRichness: rich
- attempts: 1

### 1. Draft

Dad, thanks for teaching me how to fix things without making me feel stupid.
Last fall when the sink flooded, you talked me through it on speaker—just step by step—and it worked.
Happy birthday.
Next time something leaks, I’ll call you before it floods the floor. Love you, Dad — Jordan

## G16 — Auth-shaped Mom thank-you — rich + primary subject stress (body relAnswers only)

- flow / requestMode: authenticated_body
- occasion: Thank You
- relationship: Mom
- authFidelity: relAnswers_only
- contextRichness: rich
- attempts: 1

### 1. Draft

Mom, thank you for helping me navigate the paperwork for my new health insurance this month. You even sat on hold for almost two hours so I wouldn’t have to — that’s exactly you, dropping everything when one of us needs help. It wasn’t fun or flashy, but it mattered. Because of you, the health insurance is set up and I can breathe a little easier. Love, James

## G17 — Auth-shaped Husband anniversary — romantic rich (body relAnswers only)

- flow / requestMode: authenticated_body
- occasion: Anniversary
- relationship: Husband
- authFidelity: relAnswers_only
- contextRichness: rich
- attempts: 1

### 1. Draft

Marcus, Still my favorite person to run errands with. You make the ordinary stops feel like ours, and yes, the straight face "I didn't steal your fries" routine still gets me. I still laugh about that first terrible apartment with the leaning stove — even the crooked parts felt lighter with you. Happy anniversary. Next list, next stop — I'm in. Still choosing you — Ava

## G18 — Auth-shaped coworker get well — sparse relAnswers (body only)

- flow / requestMode: authenticated_body
- occasion: Get Well
- relationship: Coworker
- authFidelity: relAnswers_only
- contextRichness: sparse
- attempts: 1

### 1. Draft

Chris — I hope your recovery from surgery is smoother than the waiting room coffee.
Focus on resting up; we’ll keep things moving on our end and look forward to having you back when you’re ready.
I appreciate how reliable you are on deadlines; it makes our work smoother. Get well soon — Kim

## G19 — Auth-shaped Daughter graduation — rich encouraging (body relAnswers only)

- flow / requestMode: authenticated_body
- occasion: Graduation
- relationship: Daughter
- authFidelity: relAnswers_only
- contextRichness: rich
- attempts: 1

### 1. Draft

Maya, you earned this diploma the hard way — through nights of doubt and still showing up. Seeing you stand steady during your senior project presentation — no shaking — was a full-circle moment. I also notice the way you build community around quieter classmates, and I love that this milestone carries that part of you forward. Hold that diploma and take a breath — you did this. So proud — Dad

## G20 — Auth-shaped Friend apology — simple + rich memory (body relAnswers only)

- flow / requestMode: authenticated_body
- occasion: Apology
- relationship: Friend
- authFidelity: relAnswers_only
- contextRichness: rich
- attempts: 1

### 1. Draft

Dee, I blew it.
I canceled on your birthday dinner last-minute, and that was selfish. You’d already reserved the noisy corner table we like, and I left you hanging. I get it if you were pissed. If you’re up for it, let me rebook it and actually show up. Sorry — and thank you for still picking up — Sam

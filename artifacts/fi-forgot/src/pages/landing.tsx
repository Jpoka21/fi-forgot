import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Bell, Shield, Star } from "lucide-react";

const faqs = [
  {
    q: "Do I have to write the card myself?",
    a: "Absolutely not. That's the whole point. You tell us about her — we handle the words. You handle the glory.",
  },
  {
    q: "What if I want to review the card before it ships?",
    a: "Every card goes through your approval queue first. You get to read it, tweak it, or rewrite it entirely. We just do the heavy lifting.",
  },
  {
    q: "How far in advance do you remind me?",
    a: "You choose: 30 days, 14 days, 7 days, 2 days, or the day of (not recommended). We recommend 14 days — enough runway to feel prepared, not so early it's weird.",
  },
  {
    q: "Can I mail the card to her directly?",
    a: "Yes. If it's your mom, mother-in-law, grandmother, or daughter — we default to mailing straight to her. If it's your wife or girlfriend, we default to mailing it to you so you can hand it over like a hero.",
  },
  {
    q: "What if the card is terrible?",
    a: "It won't be. But if you hate it, you can request a rewrite as many times as you need. No judgment. Dave didn't nail it on the first try either.",
  },
  {
    q: "Is this a real subscription?",
    a: "This is a clickable demo — no real charges yet. But yes, when we launch, it will be a monthly subscription. Consider it the cheapest relationship insurance on the market.",
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Husband, 8 years",
    quote:
      "My wife cried reading the Mother's Day card. I pretended I wrote every word. F.I. Forgot is keeping my marriage intact.",
  },
  {
    name: "James R.",
    role: "Son, perpetually forgetful",
    quote:
      "I forgot my mom's birthday three years in a row. She thought I didn't care. Now she brags about what a thoughtful son I am. Life is good.",
  },
  {
    name: "Derek M.",
    role: "Boyfriend, 2 years",
    quote:
      "My girlfriend thinks I'm way more emotionally available than I actually am. F.I. Forgot is doing the Lord's work.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us about her",
    description:
      "Add a recipient profile — her birthday, your anniversary, the occasions that matter. Add the tone she prefers, the memories she loves, and what to absolutely avoid.",
  },
  {
    number: "02",
    title: "We write the card",
    description:
      "Our system drafts a card tailored to her personality and your relationship. You get three versions — sweet, funny, or romantic. Approve the one that sounds most like you (the best version of you).",
  },
  {
    number: "03",
    title: "We remind you. We mail it.",
    description:
      "We tap you on the shoulder before it's too late, then mail the card — straight to her, or to you to hand-deliver. Either way, you look like you had it together all along.",
  },
];

const plans = [
  {
    name: "Basic",
    price: "$9",
    period: "/ month",
    cards: "Up to 6 cards per year",
    description: "For the man with a manageable social calendar.",
    highlight: false,
  },
  {
    name: "Family",
    price: "$15",
    period: "/ month",
    cards: "Up to 12 cards per year",
    description: "For the man who married into a large family. You know who you are.",
    highlight: true,
  },
  {
    name: "Hero",
    price: "$29",
    period: "/ month",
    cards: "Up to 24 cards per year",
    description: "For the man determined to never forget anything ever again.",
    highlight: false,
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(40,50%,95%)] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[hsl(221,47%,20%)] shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-serif font-bold text-xl text-[hsl(46,65%,52%)]">F.I. Forgot</div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors"
              data-testid="link-login"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[hsl(6,64%,46%)] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
              data-testid="link-get-started-nav"
            >
              Save Me From Myself
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[hsl(221,47%,20%)] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[hsl(46,65%,52%)]/20 text-[hsl(46,65%,52%)] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
            Relationship disaster prevention, automated.
          </div>
          <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 leading-tight">
            F.I. Forgot.
          </h1>
          <p className="text-xl md:text-2xl text-white/75 max-w-3xl mx-auto leading-relaxed mb-10">
            Mother's Day. Anniversaries. Birthdays. The dates you absolutely cannot screw up. We
            remember them, write the card, remind you before it ships, and help you look thoughtful
            on purpose.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[hsl(6,64%,46%)] text-white font-bold text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg"
              data-testid="link-cta-primary"
            >
              Save Me From Myself
            </Link>
            <a
              href="#how-it-works"
              className="border border-white/30 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              data-testid="link-how-it-works"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-8 text-white/40 text-sm italic">
            Approved by husbands. Suspected by wives.
          </p>
        </div>
      </section>

      {/* Dave Story */}
      <section className="py-16 px-6 bg-[hsl(40,50%,90%)]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-md p-10 border border-[hsl(40,20%,85%)]">
            <div className="text-4xl mb-4 text-[hsl(6,64%,46%)]">&#9998;</div>
            <h2 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)] mb-4">
              Dave had one job.
            </h2>
            <p className="text-[hsl(221,20%,40%)] text-lg leading-relaxed">
              Dave forgot Mother's Day. Not kind of forgot — completely, catastrophically forgot.
              He showed up with a gas station carnation at 7pm. His wife had already texted her
              sister. His mother-in-law found out two days later.{" "}
              <strong className="text-[hsl(221,47%,20%)]">This exists because Dave is not alone.</strong>
            </p>
            <p className="mt-4 text-sm text-[hsl(221,20%,50%)] italic">
              Dave walked so you could remember.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[hsl(40,50%,95%)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-[hsl(221,47%,20%)] mb-3">
              How It Works
            </h2>
            <p className="text-[hsl(221,20%,40%)] text-lg">
              Three steps between you and looking like you had it together all along.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[hsl(40,20%,85%)] hover:shadow-md transition-shadow"
              >
                <div className="font-serif text-5xl font-bold text-[hsl(46,65%,52%)] mb-4">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[hsl(221,20%,40%)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-sm text-[hsl(221,20%,50%)] italic">
            Two weeks before panic, we tap you on the shoulder.
          </p>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-[hsl(221,47%,20%)] py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Bell, label: "Smart reminders" },
            { icon: Mail, label: "Physical cards mailed" },
            { icon: Star, label: "AI-written, human-approved" },
            { icon: Shield, label: "Relationship protection" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-white/80">
              <Icon size={24} className="text-[hsl(46,65%,52%)]" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-[hsl(40,50%,95%)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-[hsl(221,47%,20%)] mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-[hsl(221,20%,40%)] text-lg">
              Cheaper than flowers. Cheaper than couples therapy. Way cheaper than a gas station card.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all hover:shadow-lg ${
                  plan.highlight
                    ? "bg-[hsl(221,47%,20%)] text-white border-[hsl(46,65%,52%)] shadow-xl scale-105"
                    : "bg-white text-[hsl(221,47%,20%)] border-[hsl(40,20%,85%)]"
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold text-[hsl(46,65%,52%)] uppercase tracking-widest mb-4">
                    Most Popular
                  </div>
                )}
                <div className="font-serif text-2xl font-bold mb-1">{plan.name}</div>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold font-serif">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-white/60" : "text-[hsl(221,20%,50%)]"}`}>
                    {plan.period}
                  </span>
                </div>
                <div
                  className={`text-sm font-semibold mb-3 ${
                    plan.highlight ? "text-[hsl(46,65%,52%)]" : "text-[hsl(6,64%,46%)]"
                  }`}
                >
                  {plan.cards}
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${plan.highlight ? "text-white/70" : "text-[hsl(221,20%,40%)]"}`}>
                  {plan.description}
                </p>
                <Link
                  href="/signup"
                  className={`block text-center font-semibold py-3 rounded-xl transition-all hover:opacity-90 ${
                    plan.highlight
                      ? "bg-[hsl(6,64%,46%)] text-white"
                      : "bg-[hsl(221,47%,20%)] text-white"
                  }`}
                  data-testid={`link-plan-${plan.name.toLowerCase()}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-[hsl(221,20%,50%)] italic">
            Your future self owes us one.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[hsl(40,50%,90%)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-[hsl(221,47%,20%)] mb-3">
              Men who survived
            </h2>
            <p className="text-[hsl(221,20%,40%)] text-lg">
              Real stories. Changed names. Marriages still intact.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[hsl(40,20%,85%)]"
              >
                <div className="text-[hsl(46,65%,52%)] mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[hsl(221,47%,20%)] leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-[hsl(221,47%,20%)] text-sm">{t.name}</div>
                  <div className="text-xs text-[hsl(221,20%,50%)]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[hsl(40,50%,95%)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-[hsl(221,47%,20%)] mb-3">
              Questions from men in the wild
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[hsl(40,20%,85%)] overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-[hsl(221,47%,20%)] hover:bg-[hsl(40,20%,97%)] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-[hsl(221,20%,40%)] leading-relaxed border-t border-[hsl(40,20%,85%)] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[hsl(6,64%,46%)] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="font-serif text-4xl font-bold mb-4">Stop winging it.</h2>
          <p className="text-xl text-white/80 mb-8">
            Gas station cards are not a strategy. Let us help you look like you planned all along.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[hsl(6,64%,46%)] font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            data-testid="link-cta-bottom"
          >
            Save Me From Myself
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(221,47%,20%)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-serif font-bold text-lg text-[hsl(46,65%,52%)]">F.I. Forgot</div>
          <p className="text-white/40 text-sm italic">Relationship disaster prevention, automated.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-white/50 text-sm hover:text-white transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

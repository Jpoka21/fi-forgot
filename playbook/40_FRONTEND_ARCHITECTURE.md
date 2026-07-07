# 40_FRONTEND_[ARCHITECTURE.md](http://ARCHITECTURE.md)

## Purpose

This document defines the frontend architecture philosophy for the redesigned F.I. Forgot experience.

It translates the product philosophy into a practical frontend structure that can guide design, development, routing, layout, component organization, and future product expansion.

This is not a backend rewrite.

This is not a change to business logic.

This is not a change to the database schema, AI pipelines, authentication, Stripe, Handwrytten integration, API contracts, or existing product functionality.

The purpose of this document is to make the frontend feel like one cohesive premium Relationship Concierge.

Every frontend decision should answer one question:

**What would a world class Relationship Concierge do here?**

---

## Core Frontend Principle

The frontend should make the user feel guided, calm, remembered, and never overwhelmed.

F.I. Forgot should not feel like software the user has to manage.

It should feel like a thoughtful concierge quietly organizing the relationships that matter most.

The frontend should reduce cognitive load.

It should simplify decisions.

It should surface what matters now.

It should hide unnecessary complexity.

It should make every action feel human, intentional, and warm.

The interface should never expose internal complexity just because the system contains it.

---

## Product Shape

The redesigned frontend is organized around relationships, not tasks.

The primary product surfaces are:

1. The public marketing experience

2. Authentication

3. First Conversation

4. Dashboard

5. Your People

6. Relationship Profile

7. Memory Timeline

8. Card Creation

9. Proactive Concierge

10. Notifications

11. Search

12. Settings

13. Business Concierge

Each surface should feel connected to the same product story.

The user should never feel like they are moving between disconnected tools.

They are always moving through one relationship concierge experience.

---

## Application Hierarchy

The frontend should be structured around clear experience layers.

### Public Layer

The public layer introduces the product.

It includes the landing page, pricing, sign in, sign up, and any public education pages.

This layer should explain the emotional value of F.I. Forgot before explaining features.

It should not position the product as a greeting card generator.

It should position the product as a premium Relationship Concierge.

### Onboarding Layer

The onboarding layer begins the relationship between the user and the product.

It includes account creation, first conversation, initial recipient creation, and early trust building.

This layer should feel personal, calm, and guided.

It should not feel like setup.

It should feel like the Concierge is beginning to understand the user.

### Core App Layer

The core app layer is the daily product experience.

It includes dashboard, Your People, relationship profiles, memory timeline, card creation, search, notifications, and settings.

This layer should prioritize clarity and continuity.

The user should always know:

* Who needs attention

* What is coming up

* What the Concierge recommends

* Where their relationships live

* How to take the next thoughtful action

### Business Layer

The business layer serves professional relationships.

It should share the same emotional architecture as the personal product while respecting professional boundaries.

It should not become a CRM.

It should help professionals maintain trust, appreciation, and long term relationship continuity.

---

## Navigation Philosophy

Navigation should be simple, stable, and relationship first.

The user should never have to hunt for the people who matter.

The primary navigation should make the core product model obvious.

Recommended top level navigation:

* Dashboard

* Your People

* Create Card

* Concierge

* Search

* Settings

Business users may also have:

* Business

* Professional Relationships

* Business Concierge

Navigation should avoid feature clutter.

If a section does not represent a primary user intent, it should not become a top level navigation item.

The navigation should feel like a calm concierge menu, not an admin dashboard.

---

## Routing Philosophy

Routes should reflect user mental models rather than internal technical structure.

Preferred route patterns:

```text

/dashboard

/people

/people/:recipientId

/people/:recipientId/timeline

/people/:recipientId/cards

/cards/new

/cards/:cardId/review

/concierge

/search

/notifications

/settings

/business

/business/relationships

/business/relationships/:relationshipId
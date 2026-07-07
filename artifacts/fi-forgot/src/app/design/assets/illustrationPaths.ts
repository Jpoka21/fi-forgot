/**
 * Canonical illustration URLs served by the application host.
 * Use `/illustrations/...` for all product surfaces (Fi and legacy pages).
 */
const ILLUSTRATIONS_ROOT = "/illustrations";

export const illustrationPaths = {
  homepage: {
    heroDave: `${ILLUSTRATIONS_ROOT}/homepage/001_homepage_hero_dave.webp`,
    handwrittenNote: `${ILLUSTRATIONS_ROOT}/homepage/002_homepage_handwritten_note.webp`,
    stampedEnvelope: `${ILLUSTRATIONS_ROOT}/homepage/003_homepage_stamped_envelope.webp`,
  },
  auth: {
    relationshipHero: `${ILLUSTRATIONS_ROOT}/auth/006_auth_relationship_hero.webp`,
  },
  onboarding: {
    daveWelcome: `${ILLUSTRATIONS_ROOT}/onboarding/007_onboarding_dave_welcome.webp`,
  },
  loading: {
    writing: `${ILLUSTRATIONS_ROOT}/loading/011_loading_writing.webp`,
    learning: `${ILLUSTRATIONS_ROOT}/loading/012_loading_learning.webp`,
    preparing: `${ILLUSTRATIONS_ROOT}/loading/013_loading_preparing.webp`,
    mailbox: `${ILLUSTRATIONS_ROOT}/loading/014_loading_mailbox.webp`,
    success: `${ILLUSTRATIONS_ROOT}/loading/015_loading_success.webp`,
  },
  dashboard: {
    emptyState: `${ILLUSTRATIONS_ROOT}/dashboard/004_dashboard_empty_state.webp`,
  },
  people: {
    emptyState: `${ILLUSTRATIONS_ROOT}/people/005_people_empty_state.webp`,
  },
  recipient: {
    profileHeader: `${ILLUSTRATIONS_ROOT}/recipient/008_recipient_profile_header.webp`,
  },
  relationship: {
    profileHeader: `${ILLUSTRATIONS_ROOT}/relationship/009_relationship_profile_header.webp`,
  },
} as const;

/**
 * Canonical API path builders. These mirror existing server routes — do not add new endpoints.
 */
export const API_ENDPOINTS = {
  auth: {
    session: "/api/auth/session",
  },
  recipients: {
    list: "/api/recipients",
    byId: (id: string) => `/api/recipients/${encodeURIComponent(id)}`,
    restore: (id: string) => `/api/recipients/${encodeURIComponent(id)}/restore`,
    check: "/api/v2/recipients/check",
    create: "/api/v2/recipients",
    freshUpdates: (id: string) => `/api/v2/recipients/${id}/fresh-updates`,
    nextQuestion: (id: string) => `/api/v2/recipients/${id}/next-question`,
    answerQuestion: (id: string) => `/api/v2/recipients/${id}/answer-question`,
    timeline: (id: string) => `/api/v2/recipients/${id}/timeline`,
    archiveAnswer: (recipientId: string, itemId: string) =>
      `/api/v2/recipients/${recipientId}/answers/${itemId}/archive`,
    editAnswer: (recipientId: string, itemId: string) =>
      `/api/v2/recipients/${recipientId}/answers/${itemId}/edit`,
    health: "/api/v2/recipient-health",
    brain: (id: string) => `/api/v2/recipients/${id}/brain`,
  },
  personal: {
    cards: "/api/personal/cards",
    cardById: (id: string) => `/api/personal/cards/${id}`,
    briefings: "/api/personal/briefings",
  },
  cards: {
    generate: "/api/generate-card",
    generateV2: "/api/v2/generate-card",
    refineV2: "/api/v2/refine-card",
    edit: "/api/edit-card",
    preview: "/api/card-preview",
    previewByToken: (token: string) => `/api/card-preview/${token}`,
    pickPersonal: "/api/personal-cards/pick-card",
  },
  billing: {
    stripePlans: "/api/stripe/plans",
    stripeCheckout: "/api/stripe/checkout",
  },
  notifications: {
    inbox: "/api/v2/notifications",
    brownieBalance: "/api/v2/brownie-points/balance",
    brownieAward: "/api/v2/brownie-points/award",
  },
  business: {
    settings: "/api/business-settings",
    settingsByEmail: "/api/business-settings/by-email",
    settingsQuery: (businessId: string) =>
      `/api/business-settings?businessId=${encodeURIComponent(businessId)}`,
    clients: "/api/business-clients",
    clientById: (id: string) => `/api/business-clients/${id}`,
    clientsQuery: (businessId: string) =>
      `/api/business-clients?businessId=${encodeURIComponent(businessId)}`,
    cardsQueue: (businessId: string) =>
      `/api/business-cards/queue?businessId=${encodeURIComponent(businessId)}`,
    cardsGenerate: "/api/business-cards/generate",
    cardsPick: "/api/business-cards/pick-card",
    approval: (token: string) => `/api/business-approval/${token}`,
    cardMessage: "/api/business-card-message",
  },
  concierge: {
    workspace: "/api/v2/concierge",
    sampleCardMessage: "/api/sample-card-message",
    sampleCards: "/api/sample-cards",
    demoPreview: (id: string) => `/api/demo-preview/${id}`,
    demoPreviewRefine: "/api/demo-preview/refine-message",
    demoEmail: "/api/demo-email",
  },
  dashboard: {
    brainOpportunities: "/api/v2/dashboard/brain-opportunities",
  },
  handwrytten: {
    fonts: "/api/handwrytten-fonts",
  },
  admin: {
    resetAllData: "/api/admin/reset-all-data",
    leads: "/api/admin/leads",
    printAudit: "/api/admin/print-audit",
    generateMessage: "/api/admin/generate-message",
    suggestCard: "/api/admin/suggest-card",
    requestCustomerApproval: "/api/admin/request-customer-approval",
    handwryttenCards: "/api/admin/handwrytten/cards",
    handwryttenOrders: "/api/admin/handwrytten/orders",
    handwryttenOrderStatus: (orderId: string) => `/api/admin/handwrytten/orders/${orderId}/status`,
    handwryttenOrderCancel: (orderId: string) => `/api/admin/handwrytten/orders/${orderId}/cancel`,
    cardLibrary: "/api/admin/card-library",
    cardLibraryCategories: "/api/admin/card-library/categories",
    cardLibraryById: (id: string) => `/api/admin/card-library/${id}`,
    cardLibrarySuggest: (id: string) => `/api/admin/card-library/suggest/${id}`,
    cardLibraryRegenerate: (id: string) => `/api/admin/card-library/${id}/regenerate`,
    cardLibraryGenerate: "/api/admin/card-library/generate",
    cardLibraryMetadataAudit: "/api/admin/card-library/metadata-audit",
    cardLibraryTrack: (id: string) => `/api/admin/card-library/${id}/track`,
  },
} as const;

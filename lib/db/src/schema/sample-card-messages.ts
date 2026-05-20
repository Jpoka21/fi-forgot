import { pgTable, serial, text, bigint, index } from "drizzle-orm/pg-core";

export const sampleCardMessagesTable = pgTable(
  "sample_card_messages",
  {
    id:                  serial("id").primaryKey(),
    cardImageUrl:        text("card_image_url").notNull(),
    category:            text("category").notNull(),
    tone:                text("tone").notNull().default("Professional"),
    businessType:        text("business_type").notNull().default(""),
    recipientType:       text("recipient_type").notNull().default(""),
    relationshipContext: text("relationship_context").notNull().default(""),
    message:             text("message").notNull(),
    createdAt:           bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => [
    index("scm_lookup_idx").on(
      t.cardImageUrl, t.category, t.tone,
      t.businessType, t.recipientType, t.relationshipContext
    ),
  ]
);

export type SampleCardMessage = typeof sampleCardMessagesTable.$inferSelect;

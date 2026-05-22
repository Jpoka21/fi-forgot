import { pgTable, text, boolean, bigint, serial } from "drizzle-orm/pg-core";

export const customHolidayCardsTable = pgTable("custom_holiday_cards", {
  id: serial("id").primaryKey(),
  handwryttenCardId: text("handwrytten_card_id").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  occasion: text("occasion").notNull().default("Happy Holidays"),
  active: boolean("active").notNull().default(true),
  generatedAt: bigint("generated_at", { mode: "number" }).notNull(),
});

export type CustomHolidayCard = typeof customHolidayCardsTable.$inferSelect;

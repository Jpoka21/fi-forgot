import { pgTable, text, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessClientsTable = pgTable("business_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: text("business_id").notNull(),

  fullName: text("full_name").notNull(),
  company: text("company"),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),

  birthday: text("birthday"),
  homePurchaseAnniversary: text("home_purchase_anniversary"),
  clientSince: text("client_since"),
  customEvents: text("custom_events"),

  relationshipOther: text("relationship_other"),
  anniversaryDate: text("anniversary_date"),
  anniversaryNote: text("anniversary_note"),
  tone: text("tone"),
  kidsNames: text("kids_names"),
  pets: text("pets"),
  interests: text("interests"),
  notes: text("notes"),
  tags: text("tags"),
  relationship: text("relationship"),

  autoBirthday: boolean("auto_birthday").default(true),
  autoHoliday: boolean("auto_holiday").default(true),
  autoAnniversary: boolean("auto_anniversary").default(false),
  requireApproval: boolean("require_approval").default(true),
  automationsOn: boolean("automations_on").default(true),

  lastCardSent: text("last_card_sent"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessClientSchema = createInsertSchema(businessClientsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessClient = z.infer<typeof insertBusinessClientSchema>;
export type BusinessClient = typeof businessClientsTable.$inferSelect;

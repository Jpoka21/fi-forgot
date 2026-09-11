export const BRAIN_SQL_ORDER = [
  "evolving-understanding-migration.sql",
  "opportunity-temporal-migration.sql",
  "opportunity-feedback-migration.sql",
  "opportunity-follow-through-migration.sql",
  "versioned-understanding-snapshot.sql",
] as const;

export const BRAIN_QUALIFICATION_TARGET = Object.freeze({
  postgresMajor: 16,
  host: "127.0.0.1",
  port: 55432,
  database: "fi_forgot_brain_qualification",
  role: "fi_forgot_brain_qualifier",
  pgdata: "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
  apiPort: 8080,
  frontendPort: 25460,
});

export const BRAIN_EXECUTION_AUTHORIZATION = "OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION";

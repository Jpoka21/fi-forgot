import type { RequestHandler } from "express";

/** Reuse production reads without admitting the mutation routes in that router. */
export function qualificationHistoryReads(history: RequestHandler): RequestHandler {
  return (req, res, next) => {
    const owner = req.headers["x-user-id"];
    if (
      req.method === "GET" &&
      (req.path === "/personal/cards" || req.path === "/personal/briefings") &&
      !req.url.includes("?") &&
      typeof owner === "string" && owner.trim().length > 0
    ) return history(req, res, next);
    return next();
  };
}

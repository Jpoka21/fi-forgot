import type { RequestHandler } from "express";

/** Question selection includes existing local materialization/expiry effects.
 * Only these exact GET forms are admitted; production ownership checks still run. */
export function qualificationQuestionRoutes(questions:RequestHandler,health:RequestHandler):RequestHandler{
  return (req,res,next)=>{
    const owner=req.headers['x-user-id'];
    if(req.method!=='GET'||req.url.includes('?')||typeof owner!=='string'||!owner.trim())return next();
    if(req.path==='/v2/recipient-health')return health(req,res,next);
    if(/^\/v2\/recipients\/[A-Za-z0-9_-]+\/(fresh-updates|next-question)$/.test(req.path))return questions(req,res,next);
    return next();
  };
}

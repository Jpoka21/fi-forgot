import { Router } from "express";
export const qualificationRouter=Router();
qualificationRouter.get("/qualification/health",(_req,res)=>res.json({mode:"brain-qualification",syntheticOnly:true,database:false,providers:false}));
if(process.env.BRAIN_QUALIFICATION_EXECUTION_ADMITTED==="true"){
  const [concierge,understanding,session,{db}]=await Promise.all([import("../routes/v2-concierge"),import("./understanding-router"),import("../routes/personal-recipients"),import("@workspace/db")]);
  qualificationRouter.use(session.default,understanding.createQualificationUnderstandingRouter(db),concierge.default);
}
qualificationRouter.all("/{*path}",(_req,res)=>res.status(503).json({error:"FAIL_CLOSED: production routes are disabled in no-DB qualification mode"}));

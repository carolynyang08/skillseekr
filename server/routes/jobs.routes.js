import express from "express";
import { getIngestedJobs } from "../controllers/jobs.controller.js";

const router = express.Router();

router.get("/ingest", getIngestedJobs);

export default router;
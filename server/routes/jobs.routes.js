import express from "express";
import { getIngestedJobs, getScrapedJobs } from "../controllers/jobs.controller.js";

const router = express.Router();

router.get("/ingest", getIngestedJobs);
router.get("/scrape", getScrapedJobs);

export default router;
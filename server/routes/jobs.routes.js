import express from "express";
import { getIngestedJobs } from "../controllers/jobs.controller.js";

const router = express.Router();

router.route("/ingest").get(getIngestedJobs);

export default router;
import express from "express";
import { getJobsFromGreenhouse } from "../controllers/jobs.controller.js";

const router = express.Router();

router.get("/fetch", getJobsFromGreenhouse);

export default router;
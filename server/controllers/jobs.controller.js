import { ingestJobs } from '../services/ingestJobs.js';

export async function getIngestedJobs(req, res) {
    try {
        const jobs = await ingestJobs();
        res.json({
            success: true, 
            count: jobs.length, 
            jobs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to ingest jobs" });
    }
}
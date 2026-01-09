import { fetchJobs } from '../services/job.service.js';

export async function getJobsFromGreenhouse(req, res) {
    try {
        const { title, company } = req.query;
        console.log("Jobs controller received query params:", { title, company });

        if (!company) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameter: company"
            });
        }

        const jobs = await fetchJobs({ title, company });
        console.log("Greenhouse API returned jobs:", jobs.length);

        res.json({
            success: true,
            count: jobs.length,
            company: company,
            jobs: jobs
        });
    } catch (error) {
        console.error("Greenhouse API error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch jobs from Greenhouse",
            message: error.message
        });
    }
}
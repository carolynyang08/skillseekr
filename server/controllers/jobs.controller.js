// import { ingestJobs, fetchJobs } from '../services/job.service.js';
import { ingestJobs, scrapeJobs } from '../services/job.service.js';

export async function getIngestedJobs(req, res) {
    try {
        const { title, location, seniority } = req.query;
        console.log("Controller received query params:", { title, location, seniority });

        const jobs = await ingestJobs({ title, location, seniority });
        console.log("Service returned jobs:", jobs.length);
        
        const normalizedJobs = jobs.map(job => ({
            id: job.id,
            date_posted: job.date_posted,
            title: job.title,
            organization: job.organization,
            organization_url: job.organization_url,
            organization_logo: job.organization_logo,
            description_text: job.description_text,
            locations_derived: job.locations_derived,
            employment_type: job.employment_type,
            remote_derived: job.remote_derived,
            url: job.url
        }))

        res.json({
            success: true,
            count: normalizedJobs.length,
            jobs: normalizedJobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
}

export async function getScrapedJobs(req, res) {
    try {
        const { title, company } = req.query;
        console.log("Scrape controller received query params:", { title, company });

        const jobs = await scrapeJobs({ title, company });
        console.log("Scraper returned jobs:", jobs.length);

        res.json({
            success: true,
            count: jobs.length,
            company: company || "walmart",
            jobs: jobs
        });
    } catch (error) {
        console.error("Scraping error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to scrape jobs",
            message: error.message
        });
    }
}
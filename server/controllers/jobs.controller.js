import { ingestJobs } from '../services/ingestJobs.js';

export async function getIngestedJobs(req, res) {
    try {
        const jobs = await ingestJobs();
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
            jobs: normalizedJobs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to ingest jobs" });
    }
}

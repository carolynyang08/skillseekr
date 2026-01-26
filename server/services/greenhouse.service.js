import axios from 'axios';

const GREENHOUSE_API_BASE = 'https://boards-api.greenhouse.io/v1/boards';

/**
 * Fetches jobs from a company's Greenhouse job board
 * @param {string} companyToken - The company's Greenhouse board token (usually company name)
 * @returns {Promise<Array>} Array of job objects with descriptions
 */
export async function fetchGreenhouseJobs(companyToken) {
    try {
        console.log(`Fetching jobs from Greenhouse for company: ${companyToken}`);

        // Get list of all jobs
        const listResponse = await axios.get(`${GREENHOUSE_API_BASE}/${companyToken}/jobs`);
        const jobsList = listResponse.data.jobs || [];

        console.log(`Found ${jobsList.length} jobs for ${companyToken}`);

        // Fetch detailed info for each job (including description)
        const jobsWithDetails = await Promise.all(
            jobsList.map(async (job) => {
                try {
                    // Get full job details
                    const detailResponse = await axios.get(
                        `${GREENHOUSE_API_BASE}/${companyToken}/jobs/${job.id}`
                    );
                    const jobDetail = detailResponse.data;

                    // Decode HTML entities and strip HTML tags to get plain text
                    let descriptionText = jobDetail.content || '';

                    // Decode common HTML entities
                    descriptionText = descriptionText
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&nbsp;/g, ' ');

                    // Strip HTML tags
                    descriptionText = descriptionText.replace(/<[^>]*>/g, ' ').trim();

                    // Clean up extra whitespace
                    descriptionText = descriptionText.replace(/\s+/g, ' ');

                    return {
                        id: `greenhouse-${companyToken}-${job.id}`,
                        title: job.title,
                        organization: job.company_name || companyToken,
                        organization_url: jobDetail.absolute_url,
                        location: job.location?.name || 'N/A',
                        url: jobDetail.absolute_url,
                        date_posted: job.first_published || job.updated_at,
                        remote_derived: jobDetail.metadata?.find(m => m.name === 'Workplace Type')?.value === 'Remote' || false,
                        description_text: descriptionText,
                        locations_derived: job.location?.name ? [job.location.name] : [],
                        departments: jobDetail.departments?.map(d => d.name) || [],
                        offices: jobDetail.offices?.map(o => o.name) || []
                    };
                } catch (error) {
                    console.error(`Error fetching details for job ${job.id}:`, error.message);
                    return null;
                }
            })
        );

        // Filter out any failed jobs
        const validJobs = jobsWithDetails.filter(job => job !== null);

        console.log(`Successfully fetched ${validJobs.length} jobs with details`);
        return validJobs;

    } catch (error) {
        console.error('Error fetching from Greenhouse:', error.message);
        throw new Error(`Greenhouse API failed: ${error.message}`);
    }
}

/**
 * Searches for jobs matching a title filter
 * @param {string} companyToken - The company's Greenhouse board token
 * @param {string} titleFilter - Search term to filter jobs by title
 * @returns {Promise<Array>} Filtered array of jobs
 */
export async function searchGreenhouseJobs(companyToken, titleFilter = '') {
    const allJobs = await fetchGreenhouseJobs(companyToken);

    if (!titleFilter) {
        return allJobs;
    }

    // Filter jobs by title
    const filtered = allJobs.filter(job =>
        job.title.toLowerCase().includes(titleFilter.toLowerCase())
    );

    console.log(`Filtered to ${filtered.length} jobs matching "${titleFilter}"`);
    return filtered;
}

import puppeteer from 'puppeteer';

/**
 * Scrapes Walmart careers page for job listings
 * @param {string} searchQuery - Job title to search for (e.g., "software engineer")
 * @returns {Promise<Array>} Array of job objects
 */
export async function scrapeWalmartJobs(searchQuery = 'software engineer') {
    let browser;

    try {
        console.log(`Starting Walmart scraper for query: ${searchQuery}`);

        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // Build Walmart careers URL with search query
        const url = `https://careers.walmart.com/us/en/results?searchQuery=${encodeURIComponent(searchQuery)}`;
        console.log(`Navigating to: ${url}`);

        // Navigate to the page
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for job listings to load
        await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

        // Extract job data
        const jobs = await page.evaluate(() => {
            const jobCards = document.querySelectorAll('[data-testid="job-card"]');
            const jobsArray = [];

            jobCards.forEach((card, index) => {
                try {
                    // Get title - has data-testid
                    const titleElement = card.querySelector('[data-testid="job-title"]');

                    // Get location - it's a span with text-[16px] class
                    const locationElement = card.querySelector('span.text-\\[16px\\]');

                    // Get the job ID from the card's data attribute
                    const jobId = card.getAttribute('data-job-id');

                    // Construct the URL using the job ID
                    const jobUrl = jobId ? `https://careers.walmart.com/us/en/jobs/${jobId}` : null;

                    // Get location text
                    const locationText = locationElement ? locationElement.textContent.trim() : 'N/A';

                    const job = {
                        id: `walmart-${Date.now()}-${index}`,
                        title: titleElement ? titleElement.textContent.trim() : 'N/A',
                        organization: 'Walmart',
                        organization_url: 'https://careers.walmart.com',
                        organization_logo: 'https://corporate.walmart.com/content/dam/corporate/images/walmart-logos/Walmart_Logo.svg',
                        location: locationText,
                        url: jobUrl,
                        date_posted: new Date().toISOString(),
                        employment_type: ['Full-time'],
                        remote_derived: locationText.toLowerCase().includes('remote'),
                        description_text: '',
                        locations_derived: locationText !== 'N/A' ? [locationText] : []
                    };

                    jobsArray.push(job);
                } catch (error) {
                    console.error('Error parsing job card:', error);
                }
            });

            return jobsArray;
        });

        console.log(`Successfully scraped ${jobs.length} jobs from Walmart`);
        console.log('Now fetching job descriptions...');

        // Visit each job URL to get the description
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];

            if (!job.url) {
                console.log(`Skipping job ${i + 1}/${jobs.length} - no URL`);
                continue;
            }

            try {
                console.log(`Fetching description for job ${i + 1}/${jobs.length}: ${job.title}`);

                await page.goto(job.url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Wait a bit for content to load
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Extract the job description text
                const description = await page.evaluate(() => {
                    // Try multiple selectors to find the job description
                    const descriptionContainer =
                        document.querySelector('[data-testid="job-description"]') ||
                        document.querySelector('.job-description') ||
                        document.querySelector('[class*="description"]') ||
                        document.querySelector('main') ||
                        document.querySelector('body');

                    return descriptionContainer ? descriptionContainer.innerText.trim() : '';
                });

                jobs[i].description_text = description;
                console.log(`✓ Fetched description for ${job.title} (${description.length} characters)`);

            } catch (error) {
                console.error(`Error fetching description for job ${i + 1}:`, error.message);
                jobs[i].description_text = 'Error fetching description';
            }
        }

        console.log('Completed fetching all job descriptions');
        return jobs;

    } catch (error) {
        console.error('Error scraping Walmart jobs:', error);
        throw new Error(`Walmart scraper failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

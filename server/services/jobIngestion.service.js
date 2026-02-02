/**
 * Job Ingestion Service
 *
 * Fetches jobs from Greenhouse and stores them in MongoDB.
 */

import Job from '../models/job.model.js';
import { searchGreenhouseJobs } from './greenhouse.service.js';
import { extractSkills, detectExperienceLevel } from './skillExtractor.service.js';

/**
 * Ingest jobs from a single company
 */
export async function ingestCompanyJobs(companyToken) {
  console.log(`[Ingestion] Fetching jobs from ${companyToken}...`);

  try {
    const jobs = await searchGreenhouseJobs(companyToken);
    console.log(`[Ingestion] Found ${jobs.length} jobs from ${companyToken}`);

    let saved = 0;
    let updated = 0;

    for (const job of jobs) {
      const sourceId = `greenhouse-${companyToken}-${job.id}`;

      // Check if job already exists
      const existing = await Job.findOne({ sourceId });

      // Extract skills from description
      const skills = extractSkills(job.description_text || '');
      const experienceLevel = detectExperienceLevel(job.title, job.description_text || '');

      const jobData = {
        sourceId,
        title: job.title,
        company: job.organization || companyToken,
        location: job.location || job.locations_derived?.join(', ') || 'Unknown',
        url: job.url,
        description: job.description_text,
        skills,
        department: job.departments?.[0] || null,
        employmentType: job.employment_type?.[0] || 'full-time',
        isRemote: job.remote_derived || false,
        experienceLevel,
        source: 'greenhouse',
        postedAt: job.date_posted ? new Date(job.date_posted) : null,
        fetchedAt: new Date(),
      };

      await Job.upsertJob(jobData);

      if (existing) {
        updated++;
      } else {
        saved++;
      }
    }

    console.log(`[Ingestion] ${companyToken}: ${saved} new, ${updated} updated`);
    return { company: companyToken, total: jobs.length, saved, updated };
  } catch (error) {
    console.error(`[Ingestion] Error ingesting ${companyToken}:`, error.message);
    return { company: companyToken, error: error.message };
  }
}

/**
 * Ingest jobs from multiple companies
 */
export async function ingestAllCompanies(companyTokens) {
  console.log(`[Ingestion] Starting ingestion for ${companyTokens.length} companies...`);

  const results = [];
  const startTime = Date.now();

  for (const token of companyTokens) {
    const result = await ingestCompanyJobs(token);
    results.push(result);

    // Small delay between companies to be respectful
    await new Promise(r => setTimeout(r, 500));
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const totalJobs = results.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalSaved = results.reduce((sum, r) => sum + (r.saved || 0), 0);

  console.log(`[Ingestion] Complete! ${totalJobs} jobs processed, ${totalSaved} new in ${duration}s`);

  return {
    companiesProcessed: companyTokens.length,
    totalJobs,
    totalSaved,
    durationSeconds: duration,
    results,
  };
}

/**
 * Get ingestion stats
 */
export async function getIngestionStats() {
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ isActive: true });
  const companiesCount = await Job.distinct('company').then(c => c.length);
  const lastIngested = await Job.findOne().sort({ fetchedAt: -1 }).select('fetchedAt');

  return {
    totalJobs,
    activeJobs,
    companiesCount,
    lastIngestedAt: lastIngested?.fetchedAt || null,
  };
}

/**
 * Ingestion Routes
 *
 * Endpoints for job ingestion and stats.
 */

import express from 'express';
import { ingestCompanyJobs, ingestAllCompanies, getIngestionStats } from '../services/jobIngestion.service.js';
import { getCompanyTokens } from '../services/discovery.service.js';
import Job from '../models/job.model.js';

const router = express.Router();

/**
 * POST /ingestion/run
 * Run ingestion for all discovered companies
 */
router.post('/run', async (req, res) => {
  try {
    const tokens = await getCompanyTokens();

    // Run in background, return immediately
    ingestAllCompanies(tokens).catch(err => {
      console.error('[API] Ingestion failed:', err.message);
    });

    res.json({
      success: true,
      message: `Ingestion started for ${tokens.length} companies`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /ingestion/company/:token
 * Run ingestion for a single company
 */
router.post('/company/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await ingestCompanyJobs(token);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /ingestion/stats
 * Get ingestion statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getIngestionStats();

    res.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /ingestion/skills
 * Get top skills across all jobs
 */
router.get('/skills', async (req, res) => {
  try {
    const { limit = 20, level } = req.query;

    const match = level ? { experienceLevel: level } : {};

    const pipeline = [
      { $match: match },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ];

    const results = await Job.aggregate(pipeline);

    const skills = results.map(r => ({
      skill: r._id,
      count: r.count,
    }));

    res.json({
      success: true,
      totalSkills: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /ingestion/skills/by-company
 * Get top skills for a specific company
 */
router.get('/skills/by-company/:company', async (req, res) => {
  try {
    const { company } = req.params;
    const { limit = 20 } = req.query;

    const pipeline = [
      { $match: { company: new RegExp(company, 'i') } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ];

    const results = await Job.aggregate(pipeline);

    res.json({
      success: true,
      company,
      skills: results.map(r => ({ skill: r._id, count: r.count })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

/**
 * Companies Routes
 *
 * Endpoints for accessing discovered Greenhouse companies.
 */

import express from 'express';
import { getDiscoveredCompanies, getCompanyTokens } from '../services/discovery.service.js';
import { runNow, isDiscoveryRunning } from '../services/scheduler.service.js';

const router = express.Router();

/**
 * GET /companies
 * Returns all discovered companies with metadata
 */
router.get('/', async (req, res) => {
  try {
    const data = await getDiscoveredCompanies();

    res.json({
      success: true,
      discoveredAt: data.discoveredAt,
      totalCompanies: data.validCount,
      companies: data.companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get companies',
      message: error.message,
    });
  }
});

/**
 * GET /companies/tokens
 * Returns just the company tokens (for dropdowns)
 */
router.get('/tokens', async (req, res) => {
  try {
    const tokens = await getCompanyTokens();

    res.json({
      success: true,
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get company tokens',
      message: error.message,
    });
  }
});

/**
 * GET /companies/status
 * Returns discovery status and cache info
 */
router.get('/status', async (req, res) => {
  try {
    const data = await getDiscoveredCompanies();
    const cacheAge = data.discoveredAt
      ? Math.round((Date.now() - new Date(data.discoveredAt).getTime()) / (1000 * 60 * 60))
      : null;

    res.json({
      success: true,
      isRunning: isDiscoveryRunning(),
      lastDiscovery: data.discoveredAt,
      cacheAgeHours: cacheAge,
      companiesFound: data.validCount,
      totalChecked: data.totalChecked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
      message: error.message,
    });
  }
});

/**
 * POST /companies/refresh
 * Manually trigger a discovery refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    if (isDiscoveryRunning()) {
      return res.status(409).json({
        success: false,
        error: 'Discovery already in progress',
      });
    }

    // Start discovery in background
    runNow().catch(err => {
      console.error('[API] Background discovery failed:', err.message);
    });

    res.json({
      success: true,
      message: 'Discovery started in background',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start discovery',
      message: error.message,
    });
  }
});

export default router;

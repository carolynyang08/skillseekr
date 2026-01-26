/**
 * Scheduler Service
 *
 * Runs the discovery job once per day.
 * No external dependencies - uses simple setInterval.
 */

import { runScheduledDiscovery, loadCache, isCacheStale } from './discovery.service.js';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

let schedulerInterval = null;
let isRunning = false;

/**
 * Check if discovery should run and execute if needed
 */
async function checkAndRunDiscovery() {
  if (isRunning) {
    console.log('[Scheduler] Discovery already running, skipping...');
    return;
  }

  const cache = loadCache();

  // Only run if cache is stale (older than 24 hours)
  if (cache && !isCacheStale(cache, 24)) {
    const cacheAge = Math.round(
      (Date.now() - new Date(cache.discoveredAt).getTime()) / ONE_HOUR
    );
    console.log(`[Scheduler] Cache is ${cacheAge}h old, skipping discovery`);
    return;
  }

  try {
    isRunning = true;
    console.log('[Scheduler] Starting scheduled discovery...');
    await runScheduledDiscovery();
    console.log('[Scheduler] Discovery complete');
  } catch (error) {
    console.error('[Scheduler] Discovery failed:', error.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the scheduler
 * - Runs discovery on startup if cache is stale
 * - Checks every hour, but only runs if cache > 24h old
 */
export function startScheduler() {
  console.log('[Scheduler] Starting scheduler (checks hourly, runs daily)');

  // Check on startup (delayed by 10 seconds to let server start)
  setTimeout(() => {
    checkAndRunDiscovery();
  }, 10 * 1000);

  // Check every hour
  schedulerInterval = setInterval(() => {
    checkAndRunDiscovery();
  }, ONE_HOUR);

  console.log('[Scheduler] Scheduler started');
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Scheduler stopped');
  }
}

/**
 * Force run discovery now (for manual trigger)
 */
export async function runNow() {
  if (isRunning) {
    throw new Error('Discovery already running');
  }

  isRunning = true;
  try {
    const results = await runScheduledDiscovery();
    return results;
  } finally {
    isRunning = false;
  }
}

export function isDiscoveryRunning() {
  return isRunning;
}

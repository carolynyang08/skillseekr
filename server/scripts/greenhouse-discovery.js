#!/usr/bin/env node
/**
 * Greenhouse Discovery - Standalone Script
 *
 * Run this directly to discover companies:
 *   node scripts/greenhouse-discovery.js
 *
 * Or just start the server - it runs discovery automatically once per day.
 */

import { runScheduledDiscovery, loadCache } from '../services/discovery.service.js';

async function main() {
  console.log('🔍 Greenhouse Company Discovery\n');

  // Show current cache status
  const cache = loadCache();
  if (cache) {
    const age = Math.round(
      (Date.now() - new Date(cache.discoveredAt).getTime()) / (1000 * 60 * 60)
    );
    console.log(`Existing cache: ${cache.validCount} companies (${age}h old)\n`);
  }

  console.log('Starting fresh discovery...\n');

  const results = await runScheduledDiscovery();

  console.log('\n' + '='.repeat(50));
  console.log('DISCOVERY COMPLETE');
  console.log('='.repeat(50));
  console.log(`Found: ${results.validCount} companies`);
  console.log(`Time: ${results.durationSeconds}s`);
  console.log(`Saved to: server/data/discovered-companies.json`);

  console.log('\n Top 20 companies by job count:');
  results.companies.slice(0, 20).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.token} (${c.jobCount} jobs)`);
  });
}

main().catch(console.error);

/**
 * Greenhouse Company Discovery Service
 *
 * Discovers companies with valid Greenhouse job boards from multiple sources.
 * Caches results to avoid repeated API calls.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, '../data/discovered-companies.json');
const GREENHOUSE_API_BASE = 'https://boards-api.greenhouse.io/v1/boards';
const DELAY_MS = 300; // Rate limiting between requests

// ============================================
// COMPANY SOURCES 
// ============================================

// Known tech companies (manually curated)
const TECH_COMPANIES = [
  // Already in your app
  'airbnb', 'stripe', 'coinbase', 'robinhood', 'gusto', 'brex',

  // Big Tech & Unicorns
  'spotify', 'discord', 'figma', 'notion', 'airtable', 'canva',
  'dropbox', 'pinterest', 'snap', 'lyft', 'doordash', 'instacart',
  'plaid', 'square', 'chime', 'affirm', 'klarna', 'sofi', 'nerdwallet',

  // Enterprise SaaS
  'datadog', 'snowflake', 'databricks', 'mongodb', 'elastic', 'supabase',
  'cloudflare', 'okta', 'crowdstrike', 'zscaler', 'paloaltonetworks',
  'splunk', 'hubspot', 'zendesk', 'twilio', 'segment', 'amplitude',
  'mixpanel', 'launchdarkly', 'hashicorp', 'gitlab', 'postman',

  // AI Companies
  'openai', 'anthropic', 'huggingface', 'scale', 'cohere', 'anyscale',
  'langchain', 'pinecone', 'weaviate', 'replicate', 'runway', 'jasper',
  'descript', 'assemblyai', 'deepgram', 'synthesia',

  // Fintech
  'ramp', 'mercury', 'deel', 'remote', 'rippling', 'carta', 'pilot',
  'brex', 'wise', 'adyen', 'checkout', 'marqeta', 'moderntreasury',
  'plaid', 'unit', 'lithic', 'alloy', 'sardine', 'persona',

  // Developer Tools
  'vercel', 'netlify', 'railway', 'render', 'fly', 'deno',
  'prisma', 'planetscale', 'neon', 'cockroachlabs', 'timescale',
  'retool', 'appsmith', 'tooljet', 'budibase', 'plasmic',

  // Health Tech
  'onemedical', 'ro', 'hims', 'cerebral', 'headspace', 'calm',
  'noom', 'whoop', 'oura', 'levels', 'color', 'tempus', 'flatiron',

  // E-commerce / D2C
  'shopify', 'etsy', 'wayfair', 'chewy', 'warbyparker', 'allbirds',
  'glossier', 'casper', 'away', 'italic', 'faire', 'goat', 'stockx',

  // Gaming & Entertainment
  'riotgames', 'epicgames', 'unity', 'roblox', 'niantic',
  'activision', 'zynga', 'scopely', 'kabam', 'jam-city',

  // Crypto / Web3
  'opensea', 'consensys', 'chainalysis', 'fireblocks', 'anchorage',
  'alchemy', 'infura', 'polygon', 'near', 'solana', 'avalanche',

  // Security
  'snyk', 'lacework', 'orca-security', 'wiz', 'cybereason',
  'sentinelone', 'vectra', 'exabeam', 'sumo-logic', 'logrhythm',

  // HR / People
  'lattice', 'culture-amp', 'lever', 'greenhouse', 'ashbyhq',
  'gem', 'eightfold', 'beamery', 'phenom', 'seekout',

  // Productivity / Collaboration
  'asana', 'monday', 'clickup', 'linear', 'height', 'shortcut',
  'loom', 'miro', 'mural', 'lucid', 'coda', 'roam',
];

// Fortune 500 / Large Companies (common Greenhouse users)
const FORTUNE_500 = [
  'adobe', 'autodesk', 'intuit', 'servicenow', 'workday', 'vmware',
  'docusign', 'zoom', 'zoominfo', 'ringcentral', 'five9', 'vonage',
  'pagerduty', 'dynatrace', 'new-relic', 'appian', 'pegasystems',
  'nutanix', 'pure-storage', 'netapp', 'commvault', 'veeam',
  'citrix', 'f5', 'fortinet', 'juniper', 'arista',
  'paypal', 'block', 'payoneer', 'bill', 'avalara', 'coupa',
  'sprinklr', 'sproutsocial', 'hootsuite', 'buffer', 'later',
  'mailchimp', 'klaviyo', 'attentive', 'iterable', 'braze',
  'contentful', 'sanity', 'strapi', 'storyblok', 'hygraph',
];

// Y Combinator Companies (from various batches)
const YC_COMPANIES = [
  // Recent YC companies
  'cal', 'resend', 'loops', 'trigger', 'inngest', 'defer',
  'unkey', 'upstash', 'convex', 'liveblocks', 'partykit',
  'tinybird', 'motherduck', 'clickhouse', 'questdb', 'materialize',
  'airbyte', 'meltano', 'dagster', 'prefect', 'temporal',
  'snorkel', 'labelbox', 'superannotate', 'v7', 'encord',
  'modal', 'banana', 'baseten', 'beam', 'cerebrium',
  'weights-biases', 'neptune', 'comet', 'mlflow', 'determined',
  'buildkite', 'circleci', 'semaphore', 'harness', 'armory',
  'env0', 'spacelift', 'atlantis', 'terrateam', 'scalr',
  'infracost', 'firefly', 'cycloid', 'stacklet', 'steampipe',
  'teleport', 'strongdm', 'boundary', 'tailscale', 'netbird',
  'clerk', 'propelauth', 'stytch', 'workos', 'frontegg',
  'permit', 'cerbos', 'oso', 'authzed', 'aserto',
  'courier', 'knock', 'novu', 'engagespot', 'magicbell',
  'posthog', 'june', 'heap', 'fullstory', 'hotjar',
  'highlight', 'sentry', 'bugsnag', 'rollbar', 'raygun',
  'stainless', 'speakeasy', 'fern', 'readme', 'mintlify',
];

// Combine all sources and deduplicate
function getAllCompanyTokens() {
  const all = [
    ...TECH_COMPANIES,
    ...FORTUNE_500,
    ...YC_COMPANIES,
  ];

  // Deduplicate and normalize
  const unique = [...new Set(all.map(c => c.toLowerCase().trim()))];
  return unique.filter(c => c.length > 0);
}

// ============================================
// DISCOVERY LOGIC
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkCompany(companyToken) {
  const url = `${GREENHOUSE_API_BASE}/${companyToken}/jobs`;

  try {
    const response = await axios.get(url, { timeout: 5000 });
    const jobs = response.data?.jobs || [];

    return {
      token: companyToken,
      valid: true,
      jobCount: jobs.length,
      boardUrl: `https://boards.greenhouse.io/${companyToken}`,
      apiUrl: url,
    };
  } catch (error) {
    return {
      token: companyToken,
      valid: false,
      error: error.response?.status === 404 ? 'Not found' : error.message,
    };
  }
}

async function discoverCompanies(onProgress = null) {
  const allTokens = getAllCompanyTokens();
  console.log(`[Discovery] Checking ${allTokens.length} companies...`);

  const validCompanies = [];
  const startTime = Date.now();

  for (let i = 0; i < allTokens.length; i++) {
    const token = allTokens[i];
    const result = await checkCompany(token);

    if (result.valid) {
      validCompanies.push(result);
      console.log(`   ${token} (${result.jobCount} jobs)`);
    }

    // Progress callback
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: allTokens.length,
        found: validCompanies.length,
        latest: result,
      });
    }

    // Rate limiting
    await sleep(DELAY_MS);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Discovery] Complete! Found ${validCompanies.length} valid boards in ${duration}s`);

  // Sort by job count
  validCompanies.sort((a, b) => b.jobCount - a.jobCount);

  return {
    discoveredAt: new Date().toISOString(),
    totalChecked: allTokens.length,
    validCount: validCompanies.length,
    durationSeconds: duration,
    companies: validCompanies,
  };
}

// ============================================
// CACHE MANAGEMENT
// ============================================

function ensureDataDir() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[Discovery] Failed to load cache:', error.message);
  }
  return null;
}

function saveCache(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    console.log(`[Discovery] Cache saved to ${CACHE_FILE}`);
  } catch (error) {
    console.error('[Discovery] Failed to save cache:', error.message);
  }
}

function isCacheStale(cache, maxAgeHours = 24) {
  if (!cache || !cache.discoveredAt) return true;

  const cacheTime = new Date(cache.discoveredAt).getTime();
  const now = Date.now();
  const ageHours = (now - cacheTime) / (1000 * 60 * 60);

  return ageHours > maxAgeHours;
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Get discovered companies (from cache or fresh discovery)
 * @param {boolean} forceRefresh - Force a new discovery even if cache is fresh
 * @returns {Promise<object>} Discovery results
 */
export async function getDiscoveredCompanies(forceRefresh = false) {
  const cache = loadCache();

  if (!forceRefresh && cache && !isCacheStale(cache)) {
    console.log('[Discovery] Using cached results');
    return cache;
  }

  console.log('[Discovery] Cache stale or missing, running discovery...');
  const results = await discoverCompanies();
  saveCache(results);

  return results;
}

/**
 * Get just the company tokens (for dropdown, etc.)
 * @returns {Promise<string[]>} Array of valid company tokens
 */
export async function getCompanyTokens() {
  const data = await getDiscoveredCompanies();
  return data.companies.map(c => c.token);
}

/**
 * Run discovery and update cache (for scheduled job)
 */
export async function runScheduledDiscovery() {
  console.log('[Discovery] Running scheduled discovery...');
  const results = await discoverCompanies();
  saveCache(results);
  return results;
}

// Export for direct script execution
export { discoverCompanies, loadCache, saveCache, isCacheStale };

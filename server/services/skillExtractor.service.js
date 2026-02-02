/**
 * Skill Extractor Service
 *
 * Extracts skills from job descriptions using keyword matching.
 * Free, fast, and works well for technical skills.
 */

// Programming languages
const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  'perl', 'haskell', 'elixir', 'clojure', 'lua', 'dart', 'objective-c',
];

// Frontend
const FRONTEND = [
  'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js', 'angular',
  'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'remix',
  'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
  'bootstrap', 'material-ui', 'mui', 'chakra', 'styled-components',
  'webpack', 'vite', 'rollup', 'parcel', 'esbuild',
  'redux', 'zustand', 'mobx', 'recoil', 'jotai',
];

// Backend
const BACKEND = [
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'koa', 'nestjs',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'ruby on rails',
  'laravel', 'asp.net', '.net', 'dotnet',
  'graphql', 'rest', 'restful', 'api', 'microservices',
  'grpc', 'websocket', 'websockets',
];

// Databases
const DATABASES = [
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'sql server',
  'mongodb', 'dynamodb', 'cassandra', 'redis', 'elasticsearch',
  'firebase', 'supabase', 'prisma', 'sequelize', 'typeorm', 'mongoose',
  'neo4j', 'couchdb', 'influxdb', 'timescaledb',
];

// Cloud & DevOps
const CLOUD_DEVOPS = [
  'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'ecs', 'eks',
  'gcp', 'google cloud', 'azure', 'heroku', 'vercel', 'netlify',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'puppet', 'chef',
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
  'ci/cd', 'devops', 'sre', 'infrastructure',
  'nginx', 'apache', 'linux', 'unix', 'bash', 'shell',
];

// Data & ML
const DATA_ML = [
  'machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
  'pandas', 'numpy', 'scipy', 'matplotlib', 'jupyter',
  'spark', 'hadoop', 'kafka', 'airflow', 'dbt',
  'data science', 'data engineering', 'data analysis', 'analytics',
  'nlp', 'natural language processing', 'computer vision', 'cv',
  'llm', 'large language model', 'gpt', 'transformers',
];

// Tools & Practices
const TOOLS_PRACTICES = [
  'git', 'github', 'gitlab', 'bitbucket', 'svn',
  'jira', 'confluence', 'notion', 'linear', 'asana', 'trello',
  'figma', 'sketch', 'adobe xd',
  'agile', 'scrum', 'kanban', 'sprint',
  'tdd', 'test-driven', 'unit testing', 'integration testing', 'e2e',
  'jest', 'mocha', 'cypress', 'playwright', 'selenium', 'pytest',
];

// Soft skills & concepts
const CONCEPTS = [
  'communication', 'leadership', 'teamwork', 'collaboration',
  'problem solving', 'critical thinking', 'mentorship',
  'system design', 'architecture', 'scalability', 'performance',
  'security', 'authentication', 'authorization', 'oauth', 'jwt',
  'accessibility', 'a11y', 'i18n', 'internationalization',
];

// Combine all skills
const ALL_SKILLS = [
  ...LANGUAGES,
  ...FRONTEND,
  ...BACKEND,
  ...DATABASES,
  ...CLOUD_DEVOPS,
  ...DATA_ML,
  ...TOOLS_PRACTICES,
  ...CONCEPTS,
];

// Normalize skill names (map variations to canonical names)
const SKILL_ALIASES = {
  'reactjs': 'react',
  'react.js': 'react',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'nodejs': 'node.js',
  'node': 'node.js',
  'nextjs': 'next.js',
  'golang': 'go',
  'postgres': 'postgresql',
  'k8s': 'kubernetes',
  'amazon web services': 'aws',
  'google cloud': 'gcp',
  'sklearn': 'scikit-learn',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'tailwindcss': 'tailwind',
};

/**
 * Extract skills from text
 */
export function extractSkills(text) {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  for (const skill of ALL_SKILLS) {
    // Create word boundary regex for skill matching
    // This prevents matching "java" in "javascript"
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');

    if (regex.test(lowerText)) {
      // Normalize to canonical name if alias exists
      const canonical = SKILL_ALIASES[skill] || skill;
      foundSkills.add(canonical);
    }
  }

  return Array.from(foundSkills).sort();
}

/**
 * Detect experience level from job title and description
 */
export function detectExperienceLevel(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  // Check title first (more reliable)
  const lowerTitle = title.toLowerCase();

  if (/\b(intern|internship)\b/.test(lowerTitle)) return 'intern';
  if (/\b(entry.level|new.grad|junior|associate|jr\.?)\b/.test(lowerTitle)) return 'entry';
  if (/\b(senior|sr\.?|staff|principal)\b/.test(lowerTitle)) return 'senior';
  if (/\b(lead|tech.lead|team.lead)\b/.test(lowerTitle)) return 'lead';
  if (/\b(manager|director|head.of|vp|vice.president)\b/.test(lowerTitle)) return 'manager';

  // Check description for years of experience
  const yearsMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years <= 1) return 'entry';
    if (years <= 3) return 'mid';
    if (years <= 6) return 'senior';
    return 'lead';
  }

  // Default based on common patterns
  if (/\b(mid.level|intermediate)\b/.test(text)) return 'mid';

  return 'unknown';
}

// Helper to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get skill categories for a list of skills
 */
export function categorizeSkills(skills) {
  const categories = {
    languages: [],
    frontend: [],
    backend: [],
    databases: [],
    cloud_devops: [],
    data_ml: [],
    tools: [],
    concepts: [],
  };

  for (const skill of skills) {
    if (LANGUAGES.includes(skill)) categories.languages.push(skill);
    else if (FRONTEND.includes(skill)) categories.frontend.push(skill);
    else if (BACKEND.includes(skill)) categories.backend.push(skill);
    else if (DATABASES.includes(skill)) categories.databases.push(skill);
    else if (CLOUD_DEVOPS.includes(skill)) categories.cloud_devops.push(skill);
    else if (DATA_ML.includes(skill)) categories.data_ml.push(skill);
    else if (TOOLS_PRACTICES.includes(skill)) categories.tools.push(skill);
    else if (CONCEPTS.includes(skill)) categories.concepts.push(skill);
  }

  return categories;
}

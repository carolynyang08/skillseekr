"use client"

import { useEffect, useState } from 'react';
import SkillsChart from './SkillsChart';

interface Skill {
  skill: string;
  count: number;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  companiesCount: number;
  lastIngestedAt: string | null;
}

export default function SkillsDashboard() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [entrySkills, setEntrySkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [companySkills, setCompanySkills] = useState<Skill[]>([]);

  // Fetch stats and skills on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [statsRes, allSkillsRes, entrySkillsRes] = await Promise.all([
          fetch('http://localhost:8080/ingestion/stats'),
          fetch('http://localhost:8080/ingestion/skills?limit=20'),
          fetch('http://localhost:8080/ingestion/skills?level=entry&limit=20'),
        ]);

        const statsData = await statsRes.json();
        const allSkillsData = await allSkillsRes.json();
        const entrySkillsData = await entrySkillsRes.json();

        if (statsData.success) setStats(statsData);
        if (allSkillsData.success) setAllSkills(allSkillsData.skills);
        if (entrySkillsData.success) setEntrySkills(entrySkillsData.skills);
      } catch (error) {
        console.error('Error fetching skills data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fetch company-specific skills when filter changes
  useEffect(() => {
    if (!companyFilter) {
      setCompanySkills([]);
      return;
    }

    async function fetchCompanySkills() {
      try {
        const res = await fetch(
          `http://localhost:8080/ingestion/skills/by-company/${encodeURIComponent(companyFilter)}`
        );
        const data = await res.json();
        if (data.success) setCompanySkills(data.skills);
      } catch (error) {
        console.error('Error fetching company skills:', error);
      }
    }

    fetchCompanySkills();
  }, [companyFilter]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading skills data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Jobs Analyzed</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalJobs.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Companies</p>
            <p className="text-3xl font-bold text-green-600">{stats.companiesCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Active Listings</p>
            <p className="text-3xl font-bold text-purple-600">{stats.activeJobs.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-medium text-gray-700">
              {stats.lastIngestedAt
                ? new Date(stats.lastIngestedAt).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>
      )}

      {/* Company Filter */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Company
        </label>
        <input
          type="text"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          placeholder="Type company name (e.g., Airbnb, Stripe)..."
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Skills Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companyFilter && companySkills.length > 0 ? (
          <SkillsChart
            skills={companySkills}
            title={`Top Skills at ${companyFilter}`}
          />
        ) : (
          <SkillsChart
            skills={allSkills}
            title="Top Skills (All Jobs)"
          />
        )}

        <SkillsChart
          skills={entrySkills}
          title="Top Skills (Entry-Level / New Grad)"
        />
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Insights for New Grads
        </h3>
        <div className="space-y-2 text-gray-700">
          {entrySkills.length > 0 && (
            <>
              <p>
                <span className="font-medium">Most requested skill:</span>{' '}
                <span className="text-blue-600 capitalize">{entrySkills[0]?.skill}</span>
                {' '}(appears in {entrySkills[0]?.count} job listings)
              </p>
              <p>
                <span className="font-medium">Top 3 skills to learn:</span>{' '}
                {entrySkills.slice(0, 3).map(s => s.skill).join(', ')}
              </p>
            </>
          )}
          {stats && (
            <p className="text-sm text-gray-500 mt-4">
              Based on analysis of {stats.totalJobs.toLocaleString()} jobs from {stats.companiesCount} companies
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

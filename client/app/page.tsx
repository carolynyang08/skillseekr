"use client"

import React, { useEffect, useState } from 'react'
import JobCard from '../components/JobCard'
import JobSearch from '../components/JobSearch'
import SkillsDashboard from '../components/SkillsDashboard'
import { Job } from '../types/job'

type Tab = 'jobs' | 'skills';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('skills');
  const [jobs, setJobs] = useState<Job[]>([])
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useState({ title: "", company: "" });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSearched || activeTab !== 'jobs') return;

    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('company', searchParams.company);
        if (searchParams.title) params.append('title', searchParams.title);

        const url = `http://localhost:8080/jobs/fetch?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch jobs');
        }

        setJobs(data.jobs || []);
        setCount(data.count || 0);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
        setJobs([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [searchParams, hasSearched, activeTab]);

  const handleSearch = (params: { title: string; company: string }) => {
    setSearchParams(params);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">SkillSeekr</h1>
          <p className="text-gray-500 mt-1">Discover what skills companies are looking for</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'skills'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Skills Insights
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'jobs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Jobs
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'skills' && <SkillsDashboard />}

        {activeTab === 'jobs' && (
          <div>
            <JobSearch onSearch={handleSearch} />

            {loading && (
              <div className="text-center mt-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            )}

            {error && !loading && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Error: {error}</p>
              </div>
            )}

            {!loading && !error && hasSearched && (
              <>
                <h2 className="mb-5 text-gray-700 text-xl">{count} jobs found</h2>
                <div className="flex flex-col gap-5">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <div className="text-center mt-10 text-gray-500">
                      <p className="text-lg">No jobs found. Try a different search.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!hasSearched && !loading && (
              <div className="text-center mt-20 text-gray-500">
                <p className="text-xl">Search for jobs to get started</p>
                <p className="text-sm mt-2">Select a company and optionally filter by job title</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App

"use client"

import React, { useEffect, useState } from 'react'
import JobCard from '../components/JobCard'
import JobSearch from '../components/JobSearch'
import { Job } from '../types/job'

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useState({ title: "", company: "" });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if user has clicked search
    if (!hasSearched) return;

    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);

        // Build query string from search params
        const params = new URLSearchParams();
        params.append('company', searchParams.company);
        if (searchParams.title) params.append('title', searchParams.title);

        const url = `http://localhost:8080/jobs/fetch?${params.toString()}`;

        console.log("Fetching from:", url);

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch jobs');
        }

        console.log("Client received:", data);
        console.log("Jobs:", data.jobs);
        console.log("Count:", data.count);

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

  }, [searchParams, hasSearched]);

  const handleSearch = (params: { title: string; company: string }) => {
    setSearchParams(params);
    setHasSearched(true);
  };

return (
  <div className="p-5 bg-gray-100 min-h-screen">
    <h1 className="mb-5 text-gray-800 text-3xl font-bold">SkillSeekr Job Board</h1>

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
);
}

export default Jobs
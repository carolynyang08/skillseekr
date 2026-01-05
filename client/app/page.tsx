"use client"

import React, { useEffect, useState } from 'react'
import JobCard from '../components/JobCard'
import JobSearch from '../components/JobSearch'
import { Job } from '../types/job'

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useState({ title: "", location: "", seniority: "" });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Only fetch if user has clicked search
    if (!hasSearched) return;

    async function fetchJobs() {
      // Build query string from search params
      const params = new URLSearchParams();
      if (searchParams.title) params.append('title', searchParams.title);
      if (searchParams.location) params.append('location', searchParams.location);
      if (searchParams.seniority) params.append('seniority', searchParams.seniority);

      const url = `http://localhost:8080/jobs/ingest${params.toString() ? `?${params.toString()}` : ''}`;

      const res = await fetch(url);
      const data = await res.json();

      console.log("Client received:", data);
      console.log("Jobs:", data.jobs);
      console.log("Count:", data.count);

      setJobs(data.jobs || []);
      setCount(data.count || 0);
    }

    fetchJobs();

  }, [searchParams, hasSearched]);

  const handleSearch = (params: { title: string; location: string; seniority: string }) => {
    setSearchParams(params);
    setHasSearched(true);
  };

return (
  <div className="p-5 bg-gray-100 min-h-screen">
    <h1 className="mb-5 text-gray-800 text-3xl font-bold">Job Board</h1>

    <JobSearch onSearch={handleSearch} />

    {hasSearched ? (
      <>
        <h2 className="mb-5 text-gray-700 text-xl">{count} jobs found</h2>
        <div className="flex flex-col gap-5">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </>
    ) : (
      <div className="text-center mt-20 text-gray-500">
        <p className="text-xl">Search for jobs to get started</p>
      </div>
    )}
  </div>
);
}

export default Jobs
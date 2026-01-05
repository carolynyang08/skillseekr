"use client"

import React, { useEffect, useState } from 'react'
import JobCard from '../components/JobCard'
import { Job } from '../types/job'

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch("http://localhost:8080/jobs/ingest");
      const data = await res.json();
      setJobs(data.jobs);
      setCount(data.count);
    }

    fetchJobs();

  }, []);

return (
  <div className="p-5 bg-gray-100 min-h-screen">
    <h1 className="mb-5 text-gray-800 text-3xl font-bold">{count} jobs found</h1>

    <div className="flex flex-col gap-5">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  </div>
);
}

export default Jobs
import { Job } from '../types/job';

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm">
      <div className="flex gap-5 items-start">
        {job.organization_logo && (
          <img
            src={job.organization_logo}
            alt={`${job.organization} logo`}
            className="w-20 h-20 object-contain rounded"
          />
        )}

        <div className="flex-1">
          <h2 className="m-0 mb-2 text-black-600 text-2xl font-semibold">
            {job.title}
          </h2>

          <div className="mb-3">
            <a
              href={job.organization_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-gray-800 no-underline hover:underline"
            >
              {job.organization}
            </a>
          </div>

          <div className="mb-2 text-gray-600 text-sm">
            {job.locations_derived && job.locations_derived.length > 0 && (
              <span className="mr-4">
               {job.locations_derived.join(', ')}
              </span>
            )}

            {/* {job.employment_type && job.employment_type.length > 0 && (
              <span className="mr-4">
                {job.employment_type.join(', ')}
              </span>
            )} */}

            {/* {job.remote_derived && (
              <span className="mr-4">
                🏠 Remote
              </span>
            )} */}

            <span>
              {new Date(job.date_posted).toLocaleDateString()}
            </span>
          </div>

          {job.description_text && (
            <p className="my-3 text-gray-700 leading-relaxed">
              {job.description_text.slice(0, 300)}...
            </p>
          )}

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-5 py-2.5 bg-blue-600 text-white no-underline rounded font-bold hover:bg-blue-700"
          >
            View Job Details →
          </a>
        </div>
      </div>
    </div>
  );
}

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// export async function ingestJobs() {
//     const response = await axios.get (
//         `https://${process.env.RAPIDAPI_HOST}/active-jb-24h`,
//         {
//             params: {
//                 limit: 5, 
//                 title_filter: "Software Engineer", 
//                 offset: '0',
//                 location_filter: "United States", 
//                 seniority_filter: "Entry level",
//                 description_type: 'text'
//             }, 
//             headers: {
//                 "x-rapidapi-key": process.env.RAPIDAPI_KEY,
//                 "x-rapidapi-host": process.env.RAPIDAPI_HOST
//             },
//         }
//     );
//     return response.data;
// }


export async function ingestJobs({title, location, seniority} = {}) {
    // TEMP: Use mock data, API limit reached
    // TODO: Switch back to real API when quota resets
    console.log("Using mock data (API limit reached)");

    return [
        {
            id: "mock-1",
            date_posted: "2026-01-05T01:00:00",
            title: "Senior Software Engineer",
            organization: "Tech Corp",
            organization_url: "https://techcorp.com",
            organization_logo: "https://via.placeholder.com/80",
            description_text: "We're looking for a senior software engineer to join our team...",
            locations_derived: ["San Francisco, CA"],
            employment_type: ["Full-time"],
            remote_derived: true,
            url: "https://example.com/job1"
        },
        {
            id: "mock-2",
            date_posted: "2026-01-05T02:00:00",
            title: "Frontend Developer",
            organization: "StartupXYZ",
            organization_url: "https://startupxyz.com",
            organization_logo: "https://via.placeholder.com/80",
            description_text: "Join our fast-growing startup as a frontend developer...",
            locations_derived: ["New York, NY"],
            employment_type: ["Full-time"],
            remote_derived: false,
            url: "https://example.com/job2"
        },
        {
            id: "mock-3",
            date_posted: "2026-01-04T10:00:00",
            title: "Full Stack Engineer",
            organization: "BigTech Inc",
            organization_url: "https://bigtech.com",
            organization_logo: "https://via.placeholder.com/80",
            description_text: "Looking for an experienced full stack engineer...",
            locations_derived: ["Seattle, WA"],
            employment_type: ["Full-time"],
            remote_derived: true,
            url: "https://example.com/job3"
        }
    ];

    /* ORIGINAL CODE - Uncomment when API quota resets
    const limit = 5;
    let offset = 0;
    let allJobs = [];
    let moreJobs = true;

    // Set defaults if no params provided
    const searchTitle = title || "Software Engineer";
    const searchLocation = location || "United States";
    const searchSeniority = seniority || ""; // Don't default seniority - makes search too restrictive

    while (moreJobs) {
        // Build URL manually to match RapidAPI format exactly
        const params = new URLSearchParams();
        params.append("limit", limit);
        params.append("offset", offset);
        // Wrap title in quotes like RapidAPI example
        params.append("title_filter", `"${searchTitle}"`);
        params.append("location_filter", `"${searchLocation}"`);
        if (searchSeniority) params.append("seniority_filter", `"${searchSeniority}"`);
        params.append("description_type", "text");

        const url = `https://${process.env.RAPIDAPI_HOST}/active-jb-24h?${params.toString()}`;
        console.log("Fetching from:", url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                    "x-rapidapi-host": process.env.RAPIDAPI_HOST
                }
            });

            if (!response.ok) {
                console.error(`API error: ${response.status} ${response.statusText}`);
                moreJobs = false;
                break;
            }

            const data = await response.json();

            // API returns an array directly, not { jobs: [...] }
            const jobsArray = Array.isArray(data) ? data : [];
            console.log("API returned:", jobsArray.length, "jobs");

            if (!jobsArray || jobsArray.length === 0) {
                console.log("No jobs in response");
                moreJobs = false;
            } else {
                allJobs.push(...jobsArray);
                offset += limit;

                // Stop after first batch for now (remove this to fetch all)
                moreJobs = false;
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            moreJobs = false;
        }
    }

    return allJobs;
    */
}
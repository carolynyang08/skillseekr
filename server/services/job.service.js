import axios from "axios";
import dotenv from "dotenv";
import { searchGreenhouseJobs } from "./greenhouse.service.js";

dotenv.config();

/**
 * Fetches jobs from Greenhouse job boards
 * @param {Object} params - Search parameters
 * @param {string} params.title - Job title to search for (optional filter)
 * @param {string} params.company - Company's Greenhouse board token (e.g., "airbnb", "netflix")
 * @returns {Promise<Array>} Array of jobs from Greenhouse
 */
export async function fetchJobs({ title, company } = {}) {
    try {
        if (!company) {
            throw new Error('Company parameter is required');
        }

        console.log(`Fetching jobs for company: ${company}, title filter: ${title || 'none'}`);

        // Fetch jobs from Greenhouse API
        const jobs = await searchGreenhouseJobs(company, title || '');

        return jobs;
    } catch (error) {
        console.error("Error in fetchJobs:", error);
        throw error;
    }
}
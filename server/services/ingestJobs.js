import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function ingestJobs() {
    const response = await axios.get (
        `https://${process.env.RAPIDAPI_HOST}/active-jb-24h`,
        {
            params: {
                limit: 5, 
                title_filter: "Software Engineer", 
                offset: '0',
                location_filter: "United States", 
                seniority_filter: "Entry level",
                description_type: 'text'
            }, 
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.RAPIDAPI_HOST
            },
        }
    );
    return response.data;
}
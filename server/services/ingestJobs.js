import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function ingestJobs() {
    const response = await axios.get (
        `https://${process.env.RAPIDAPI_HOST}/active-jb-24h`,
        {
            params: {
                limit: 1, 
                title_filter: "Data Engineer", 
                offset: '0',
                location_filter: "United States", 
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
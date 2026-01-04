import express from "express";
import cors from "cors";
import jobsRoutes from "./routes/jobs.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/jobs", jobsRoutes);
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json({message: "skillseekr api running"});
});

app.get("/jobs/ingest", (req, res) => {
  res.json({message: "Ingest jobs endpoint"});
});

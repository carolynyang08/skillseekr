import express from "express";
import cors from "cors";
import jobsRoutes from "./routes/jobs.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import ingestionRoutes from "./routes/ingestion.routes.js";
import { startScheduler } from "./services/scheduler.service.js";
import { connectDB } from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/jobs", jobsRoutes);
app.use("/companies", companiesRoutes);
app.use("/ingestion", ingestionRoutes);

const PORT = 8080;

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start the discovery scheduler (runs once per day)
    startScheduler();
  });
});

app.get("/", (req, res) => {
  res.json({ message: "skillseekr api running" });
});

// app.get("/jobs/ingest", (req, res) => {
//   res.json({message: "Ingest jobs endpoint"});
// });

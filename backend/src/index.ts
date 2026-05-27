import dotenv from "dotenv";
dotenv.config(); // ← MUST be first

import express from "express";
import cors from "cors";
import donationRoutes from "./routes/donations";
import profileRoutes from "./routes/profile";
import claimRoutes from "./routes/claims";
import statsRoutes from "./routes/stats";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:8080" }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/donations", donationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/stats", statsRoutes);

app.listen(PORT, () => console.log(`MealBridge backend running on port ${PORT}`));
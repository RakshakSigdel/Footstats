// Load environment variables FIRST
import './config/env.js';

import express from "express";
import cors from "cors";

//Routes Import
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoute.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import clubRoutes from "./routes/clubRoute.js";
import scheduleRoutes from "./routes/scheduleRoute.js";
import matchRoutes from "./routes/matchRoute.js";
import requestRoutes from "./routes/requestRoutes.js";
import scheduleRequestRoutes from "./routes/scheduleRequestRoutes.js";
import matchEventRoutes from "./routes/matchEvent.js";
import matchLineupRoutes from "./routes/matchLineupRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/schedules",scheduleRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/schedule-requests", scheduleRequestRoutes);
app.use("/api/match-events", matchEventRoutes);
app.use("/api/match-lineups", matchLineupRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to Footstat API");
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

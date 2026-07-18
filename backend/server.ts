import "./lib/env"
import express from "express"
import authRouter from "./auth/index"
import stravaRouter from "./strava/index"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:8081", // or '*' during development
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Content-Type",
      "x-session-id",
      "ngrok-skip-browser-warning",
    ],
  }),
)

app.use("/auth", authRouter)
app.use("/strava", stravaRouter)

app.listen(3000, () => console.log("Server running on http://localhost:3000"))

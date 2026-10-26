const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
process.env.FRONTEND_ORIGINS || ""
)
.split(",")
.map(origin => origin.trim())
.filter(Boolean);

app.disable("x-powered-by");
app.use(express.json({ limit: "5kb" }));

app.use(cors({
origin(origin, callback) {
// Allow command-line health checks without an Origin header.
if (!origin) return callback(null, true);

if (allowedOrigins.includes(origin)) {
  return callback(null, true);
}

return callback(new Error("Origin not allowed"));

},
methods: ["GET", "POST"],
allowedHeaders: ["Content-Type"]
}));

app.use("/api", rateLimit({
windowMs: 60 * 1000,
limit: 30,
standardHeaders: true,
legacyHeaders: false
}));

// Aggregate counters only. No raw IP addresses or coordinates.
let totalVisits = 0;
const permissionCounts = {
granted: 0,
denied: 0,
unavailable: 0,
not_requested: 0
};

app.get("/", (req, res) => {
res.type("text").send(
"Pigeon Surveillance Agency API is running. 🐦"
);
});

app.get("/api/status", (req, res) => {
res.json({
online: true,
agency: "Pigeon Surveillance Agency",
message: "The pigeons are watching your career."
});
});

app.post("/api/visit", (req, res) => {
const status = req.body?.locationPermission;

const allowedStatuses = [
"granted",
"denied",
"unavailable",
"not_requested"
];

if (!allowedStatuses.includes(status)) {
return res.status(400).json({
error: "Invalid permission status"
});
}

totalVisits++;
permissionCounts[status]++;

res.json({
success: true,
report: {
career: "Under observation",
pigeon: "Assigned",
threatLevel: "Unemployed genius"
}
});
});

// Public aggregate stats only.
app.get("/api/stats", (req, res) => {
res.json({
totalVisits,
permissionCounts
});
});

app.use((err, req, res, next) => {
if (err.message === "Origin not allowed") {
return res.status(403).json({
error: "Origin not allowed"
});
}

console.error("Request failed:", err.message);

res.status(500).json({
error: "Internal server error"
});
});

app.listen(PORT, "0.0.0.0", () => {
console.log("Pigeon API listening on port ${PORT}");
});

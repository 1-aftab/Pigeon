const API_BASE = "YOUR_RENDER_BACKEND_URL";

const $ = id => document.getElementById(id);

const intro = $("intro");
const scan = $("scan");
const result = $("result");

function show(section) {
[intro, scan, result].forEach(el => el.classList.add("hidden"));
section.classList.remove("hidden");
}

async function api(path, options = {}) {
if (API_BASE.startsWith("YOUR_")) {
throw new Error("Backend not configured");
}

const response = await fetch(API_BASE + path, {
...options,
headers: {
"Content-Type": "application/json",
...options.headers
}
});

if (!response.ok) throw new Error("API request failed");
return response.json();
}

async function checkBackend() {
try {
await api("/api/status");
$("apiStatus").textContent = "API ONLINE";
} catch {
$("apiStatus").textContent = "DEMO MODE";
}
}

checkBackend();

function addLog(message) {
const line = document.createElement("div");
line.textContent = "> " + message;
$("logs").appendChild(line);
}

function getLocation() {
return new Promise(resolve => {
if (!navigator.geolocation) {
resolve({ status: "unavailable" });
return;
}

navigator.geolocation.getCurrentPosition(
  position => resolve({
    status: "granted",
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  }),
  () => resolve({ status: "denied" }),
  { timeout: 8000, maximumAge: 60000 }
);

});
}

$("startBtn").addEventListener("click", async () => {
$("startBtn").disabled = true;
show(scan);
$("logs").replaceChildren();

let locationData = { status: "not_requested" };

addLog("Initializing pigeon network...");

const locationPromise = getLocation();

const messages = [
"Connecting to the pigeon network...",
"Analyzing career trajectory...",
"Searching for available pigeons...",
"Checking snack-based motivation levels...",
"Finalizing surveillance assignment..."
];

let progress = 0;

while (progress < 100) {
await new Promise(resolve => setTimeout(resolve, 450));
progress = Math.min(100, progress + 20);
$("progressBar").style.width = progress + "%";
$("progressText").textContent = progress + "%";

const index = Math.min(
  messages.length - 1,
  Math.floor(progress / 20) - 1
);

if (progress > 0) addLog(messages[index]);

}

locationData = await locationPromise;

// Do not send precise coordinates to the backend.
// Only the permission outcome is used for this prank.
try {
await api("/api/visit", {
method: "POST",
body: JSON.stringify({
locationPermission: locationData.status
})
});
} catch {
// The prank still works when the backend is unavailable.
}

$("scanTitle").textContent = "ASSIGNMENT COMPLETE";

await new Promise(resolve => setTimeout(resolve, 700));

show(result);
$("startBtn").disabled = false;
});

$("againBtn").addEventListener("click", () => {
$("progressBar").style.width = "0%";
$("progressText").textContent = "0%";
$("logs").replaceChildren();
$("scanTitle").textContent = "INITIALIZING...";
$("startBtn").disabled = false;
show(intro);
});

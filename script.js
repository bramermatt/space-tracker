const SECOND = 1000;
const NASA_API_KEY = "DEMO_KEY";
const missionStart = new Date("2026-04-01T22:35:00Z");

const phases = [
  { name: "Launch", startSeconds: 0, durationSeconds: 8 * 60, telemetry: { velocity: [0, 17000], distance: [0, 120], altitude: [0, 115], comms: "ASCENT VOICE + TELEMETRY", flightMode: "ASCENT GUIDANCE" }, events: [{ offset: 10, message: "Main engine ignition confirmed" }, { offset: 120, message: "Max-Q passed" }, { offset: 470, message: "Orion separation nominal" }] },
  { name: "Earth Orbit", startSeconds: 8 * 60, durationSeconds: 2 * 60 * 60, telemetry: { velocity: [17000, 17600], distance: [120, 3800], altitude: [115, 140], comms: "NEAR-EARTH RELAY", flightMode: "ORBIT OPS" }, events: [{ offset: 60, message: "Orbit insertion confirmed" }, { offset: 3300, message: "Systems checkout complete" }] },
  { name: "Translunar Injection (TLI)", startSeconds: 2 * 60 * 60 + 8 * 60, durationSeconds: 22 * 60, telemetry: { velocity: [17600, 24700], distance: [3800, 21000], altitude: [140, 620], comms: "DSN TRANSFER", flightMode: "TLI BURN" }, events: [{ offset: 90, message: "TLI burn initiated" }, { offset: 1080, message: "TLI burn complete" }, { offset: 1200, message: "Trajectory nominal" }] },
  { name: "Coast", startSeconds: 2 * 60 * 60 + 30 * 60, durationSeconds: 3 * 24 * 60 * 60, telemetry: { velocity: [24700, 3400], distance: [21000, 215000], altitude: [620, 190000], comms: "DEEP SPACE NETWORK", flightMode: "CRUISE" }, events: [{ offset: 5 * 60 * 60, message: "Mid-course correction #1 complete" }, { offset: 42 * 60 * 60, message: "Crew sleep cycle nominal" }] },
  { name: "Lunar Flyby", startSeconds: 3 * 24 * 60 * 60 + 2 * 60 * 60 + 30 * 60, durationSeconds: 9 * 60 * 60, telemetry: { velocity: [3400, 5800], distance: [215000, 239000], altitude: [190000, 62], comms: "LUNAR FAR-SIDE ROUTING", flightMode: "LUNAR NAV" }, events: [{ offset: 2 * 60 * 60, message: "Closest approach to Moon" }, { offset: 4 * 60 * 60, message: "Lunar imaging sequence complete" }] },
  { name: "Return Trajectory", startSeconds: 3 * 24 * 60 * 60 + 11 * 60 * 60 + 2 * 60 * 60 + 30 * 60, durationSeconds: 4 * 24 * 60 * 60, telemetry: { velocity: [5800, 24800], distance: [239000, 3200], altitude: [190000, 85], comms: "DSN RETURN LINK", flightMode: "EARTH RETURN" }, events: [{ offset: 4 * 60 * 60, message: "Return trajectory trim burn nominal" }, { offset: 54 * 60 * 60, message: "Entry interface targeting update" }] },
  { name: "Reentry", startSeconds: 7 * 24 * 60 * 60 + 11 * 60 * 60 + 2 * 60 * 60 + 30 * 60, durationSeconds: 26 * 60, telemetry: { velocity: [24800, 1300], distance: [3200, 50], altitude: [85, 8], comms: "BLACKOUT / REACQ", flightMode: "ENTRY GUIDANCE" }, events: [{ offset: 120, message: "Reentry communications blackout" }, { offset: 1100, message: "Comms reacquired" }] },
  { name: "Splashdown", startSeconds: 7 * 24 * 60 * 60 + 11 * 60 * 60 + 28 * 60 + 2 * 60 * 60 + 30 * 60, durationSeconds: 24 * 60 * 60, telemetry: { velocity: [1300, 0], distance: [50, 0], altitude: [8, 0], comms: "RECOVERY NET", flightMode: "RECOVERY" }, events: [{ offset: 5 * 60, message: "Main parachutes deployed" }, { offset: 16 * 60, message: "Splashdown confirmed" }, { offset: 40 * 60, message: "Recovery team secure" }] }
];

const systemDefinitions = ["Propulsion", "Life Support", "Navigation", "Power", "Thermal", "Comms", "GNC", "Recovery"];

const state = { loggedEvents: new Set(), displayed: { velocity: 0, distance: 0, altitude: 0, acceleration: 0, trajectoryError: 0, fuel: 100, power: 100, pressure: 14.7, cabinTemp: 72, radiation: 0.12, signalDelay: 0, co2: 2.8, battery: 28 }, phase: phases[0] };

const ui = {
  missionTime: document.getElementById("mission-time"), status: document.getElementById("system-status"), nasaLinkState: document.getElementById("nasa-link-state"), timeline: document.getElementById("timeline-list"), velocity: document.getElementById("velocity"), distance: document.getElementById("distance"), altitude: document.getElementById("altitude"), comms: document.getElementById("comms"), log: document.getElementById("event-log"), systemsGrid: document.getElementById("systems-grid"), acceleration: document.getElementById("acceleration"), trajectoryError: document.getElementById("trajectory-error"), fuel: document.getElementById("fuel"), power: document.getElementById("power"), pressure: document.getElementById("pressure"), cabinTemp: document.getElementById("cabin-temp"), radiation: document.getElementById("radiation"), signalDelay: document.getElementById("signal-delay"), dsnNode: document.getElementById("dsn-node"), flightMode: document.getElementById("flight-mode"), co2Level: document.getElementById("co2-level"), batteryBus: document.getElementById("battery-bus"), cdrVitals: document.getElementById("cdr-vitals"), pilotVitals: document.getElementById("pilot-vitals"), ms1Vitals: document.getElementById("ms1-vitals"), ms2Vitals: document.getElementById("ms2-vitals"), apodTitle: document.getElementById("apod-title"), apodDate: document.getElementById("apod-date"), solarEvents: document.getElementById("solar-events"), neoEvents: document.getElementById("neo-events"), nasaUpdated: document.getElementById("nasa-updated"), nasaMode: document.getElementById("nasa-mode"), summaryToggle: document.getElementById("summary-toggle"), summaryPanel: document.getElementById("summary-panel"), summaryClose: document.getElementById("summary-close"), summaryContent: document.getElementById("summary-content")

const missionStart = new Date("2026-04-01T22:35:00Z");

const phases = [
  {
    name: "Launch",
    startSeconds: 0,
    durationSeconds: 8 * 60,
    telemetry: {
      velocity: [0, 17000],
      distance: [0, 120],
      altitude: [0, 115],
      comms: "ASCENT VOICE + TELEMETRY"
    },
    events: [
      { offset: 10, message: "Main engine ignition confirmed" },
      { offset: 120, message: "Max-Q passed" },
      { offset: 470, message: "Orion separation nominal" }
    ]
  },
  {
    name: "Earth Orbit",
    startSeconds: 8 * 60,
    durationSeconds: 2 * 60 * 60,
    telemetry: {
      velocity: [17000, 17600],
      distance: [120, 3800],
      altitude: [115, 140],
      comms: "NEAR-EARTH RELAY"
    },
    events: [
      { offset: 60, message: "Orbit insertion confirmed" },
      { offset: 3300, message: "Systems checkout complete" }
    ]
  },
  {
    name: "Translunar Injection (TLI)",
    startSeconds: 2 * 60 * 60 + 8 * 60,
    durationSeconds: 22 * 60,
    telemetry: {
      velocity: [17600, 24700],
      distance: [3800, 21000],
      altitude: [140, 620],
      comms: "DSN TRANSFER"
    },
    events: [
      { offset: 90, message: "TLI burn initiated" },
      { offset: 1080, message: "TLI burn complete" },
      { offset: 1200, message: "Trajectory nominal" }
    ]
  },
  {
    name: "Coast",
    startSeconds: 2 * 60 * 60 + 30 * 60,
    durationSeconds: 3 * 24 * 60 * 60,
    telemetry: {
      velocity: [24700, 3400],
      distance: [21000, 215000],
      altitude: [620, 190000],
      comms: "DEEP SPACE NETWORK"
    },
    events: [
      { offset: 5 * 60 * 60, message: "Mid-course correction #1 complete" },
      { offset: 42 * 60 * 60, message: "Crew sleep cycle nominal" }
    ]
  },
  {
    name: "Lunar Flyby",
    startSeconds: 3 * 24 * 60 * 60 + 2 * 60 * 60 + 30 * 60,
    durationSeconds: 9 * 60 * 60,
    telemetry: {
      velocity: [3400, 5800],
      distance: [215000, 239000],
      altitude: [190000, 62],
      comms: "LUNAR FAR-SIDE ROUTING"
    },
    events: [
      { offset: 2 * 60 * 60, message: "Closest approach to Moon" },
      { offset: 4 * 60 * 60, message: "Lunar imaging sequence complete" }
    ]
  },
  {
    name: "Return Trajectory",
    startSeconds: 3 * 24 * 60 * 60 + 11 * 60 * 60 + 2 * 60 * 60 + 30 * 60,
    durationSeconds: 4 * 24 * 60 * 60,
    telemetry: {
      velocity: [5800, 24800],
      distance: [239000, 3200],
      altitude: [190000, 85],
      comms: "DSN RETURN LINK"
    },
    events: [
      { offset: 4 * 60 * 60, message: "Return trajectory trim burn nominal" },
      { offset: 54 * 60 * 60, message: "Entry interface targeting update" }
    ]
  },
  {
    name: "Reentry",
    startSeconds: 7 * 24 * 60 * 60 + 11 * 60 * 60 + 2 * 60 * 60 + 30 * 60,
    durationSeconds: 26 * 60,
    telemetry: {
      velocity: [24800, 1300],
      distance: [3200, 50],
      altitude: [85, 8],
      comms: "BLACKOUT / REACQ"
    },
    events: [
      { offset: 120, message: "Reentry communications blackout" },
      { offset: 1100, message: "Comms reacquired" }
    ]
  },
  {
    name: "Splashdown",
    startSeconds: 7 * 24 * 60 * 60 + 11 * 60 * 60 + 28 * 60 + 2 * 60 * 60 + 30 * 60,
    durationSeconds: 24 * 60 * 60,
    telemetry: {
      velocity: [1300, 0],
      distance: [50, 0],
      altitude: [8, 0],
      comms: "RECOVERY NET"
    },
    events: [
      { offset: 5 * 60, message: "Main parachutes deployed" },
      { offset: 16 * 60, message: "Splashdown confirmed" },
      { offset: 40 * 60, message: "Recovery team secure" }
    ]
  }
];

const systemDefinitions = [
  "Propulsion",
  "Life Support",
  "Navigation",
  "Power"
];

const state = {
  loggedEvents: new Set(),
  displayed: {
    velocity: 0,
    distance: 0,
    altitude: 0
  }
};

const ui = {
  missionTime: document.getElementById("mission-time"),
  status: document.getElementById("system-status"),
  timeline: document.getElementById("timeline-list"),
  velocity: document.getElementById("velocity"),
  distance: document.getElementById("distance"),
  altitude: document.getElementById("altitude"),
  comms: document.getElementById("comms"),
  log: document.getElementById("event-log"),
  systemsGrid: document.getElementById("systems-grid")
};

function init() {
  renderTimeline();
  renderSystems();
  bindSummaryPanel();
  addEvent("T+00:00:00", "Mission console online");
  addEvent("T+00:00:00", "NASA feed handshake initiated");
  tick();
  setInterval(tick, SECOND);
  fetchNasaFeeds();
  setInterval(fetchNasaFeeds, 10 * 60 * SECOND);
}

function bindSummaryPanel() {
  ui.summaryToggle.addEventListener("click", () => ui.summaryPanel.classList.add("open"));
  ui.summaryClose.addEventListener("click", () => ui.summaryPanel.classList.remove("open"));
  addEvent("T+00:00:00", "Mission console online");
  tick();
  setInterval(tick, SECOND);
}

function tick() {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - missionStart.getTime()) / SECOND));
  const currentPhase = findCurrentPhase(elapsedSeconds);
  state.phase = currentPhase.phase;
  updateMissionClock(elapsedSeconds);
  updateTimeline(currentPhase.index);
  updateTelemetry(elapsedSeconds, currentPhase);
  updateEngineering(elapsedSeconds, currentPhase);
  processEvents(elapsedSeconds);
  updateSystemStatus(currentPhase.name);
  updateSummary(elapsedSeconds);
}

function findCurrentPhase(elapsedSeconds) {
  for (let i = phases.length - 1; i >= 0; i -= 1) if (elapsedSeconds >= phases[i].startSeconds) return { phase: phases[i], index: i };
  return { phase: phases[0], index: 0 };
}

function progressInPhase(elapsedSeconds, phase) { return Math.min(1, Math.max(0, (elapsedSeconds - phase.startSeconds) / phase.durationSeconds)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(previous, next, factor = 0.35) { return previous + (next - previous) * factor; }

  updateMissionClock(elapsedSeconds);
  updateTimeline(currentPhase.index);
  updateTelemetry(elapsedSeconds, currentPhase);
  processEvents(elapsedSeconds);
  updateSystemStatus(currentPhase.name);
}

function findCurrentPhase(elapsedSeconds) {
  for (let i = phases.length - 1; i >= 0; i -= 1) {
    if (elapsedSeconds >= phases[i].startSeconds) {
      return { phase: phases[i], index: i };
    }
  }
  return { phase: phases[0], index: 0 };
}

function progressInPhase(elapsedSeconds, phase) {
  const local = elapsedSeconds - phase.startSeconds;
  const p = local / phase.durationSeconds;
  return Math.min(1, Math.max(0, p));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smooth(previous, next, factor = 0.35) {
  return previous + (next - previous) * factor;
}

function updateMissionClock(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  ui.missionTime.textContent = `T+${hours}:${minutes}:${secs}`;
}

function updateTelemetry(elapsedSeconds, currentPhase) {
  const phase = currentPhase.phase;
  const p = progressInPhase(elapsedSeconds, phase);
  state.displayed.velocity = smooth(state.displayed.velocity, lerp(phase.telemetry.velocity[0], phase.telemetry.velocity[1], p));
  state.displayed.distance = smooth(state.displayed.distance, lerp(phase.telemetry.distance[0], phase.telemetry.distance[1], p));
  state.displayed.altitude = smooth(state.displayed.altitude, lerp(phase.telemetry.altitude[0], phase.telemetry.altitude[1], p));

  const targetVelocity = lerp(phase.telemetry.velocity[0], phase.telemetry.velocity[1], p);
  const targetDistance = lerp(phase.telemetry.distance[0], phase.telemetry.distance[1], p);
  const targetAltitude = lerp(phase.telemetry.altitude[0], phase.telemetry.altitude[1], p);

  state.displayed.velocity = smooth(state.displayed.velocity, targetVelocity);
  state.displayed.distance = smooth(state.displayed.distance, targetDistance);
  state.displayed.altitude = smooth(state.displayed.altitude, targetAltitude);

  ui.velocity.textContent = Math.round(state.displayed.velocity).toLocaleString("en-US");
  ui.distance.textContent = Math.round(state.displayed.distance).toLocaleString("en-US");
  ui.altitude.textContent = Math.max(0, Math.round(state.displayed.altitude)).toLocaleString("en-US");
  ui.comms.textContent = phase.telemetry.comms;
  ui.flightMode.textContent = phase.telemetry.flightMode;
}

function updateEngineering(elapsedSeconds, currentPhase) {
  const p = progressInPhase(elapsedSeconds, currentPhase.phase);
  state.displayed.acceleration = smooth(state.displayed.acceleration, Math.max(0.02, Math.abs((currentPhase.phase.telemetry.velocity[1] - currentPhase.phase.telemetry.velocity[0]) / 18000) + Math.sin(elapsedSeconds / 23) * 0.08), 0.2);
  state.displayed.trajectoryError = smooth(state.displayed.trajectoryError, Math.abs(Math.sin(elapsedSeconds / 40) * 0.35), 0.22);
  state.displayed.fuel = smooth(state.displayed.fuel, Math.max(7, 100 - (elapsedSeconds / (8.8 * 24 * 3600)) * 100), 0.06);
  state.displayed.power = smooth(state.displayed.power, Math.max(42, 99 - p * 6 - currentPhase.index * 0.5 + Math.sin(elapsedSeconds / 180) * 0.2), 0.2);
  state.displayed.pressure = smooth(state.displayed.pressure, 14.7 + Math.sin(elapsedSeconds / 120) * 0.12, 0.2);
  state.displayed.cabinTemp = smooth(state.displayed.cabinTemp, 71.8 + Math.sin(elapsedSeconds / 90) * 1.6, 0.2);
  state.displayed.radiation = smooth(state.displayed.radiation, 0.08 + currentPhase.index * 0.05 + Math.abs(Math.sin(elapsedSeconds / 54)) * 0.08, 0.16);
  state.displayed.signalDelay = smooth(state.displayed.signalDelay, Math.max(0.03, state.displayed.distance / 186282), 0.3);
  state.displayed.co2 = smooth(state.displayed.co2, 2.7 + Math.sin(elapsedSeconds / 140) * 0.5, 0.15);
  state.displayed.battery = smooth(state.displayed.battery, 27.9 + Math.sin(elapsedSeconds / 100) * 0.35, 0.2);

  ui.acceleration.textContent = `${state.displayed.acceleration.toFixed(2)} g`;
  ui.trajectoryError.textContent = `${state.displayed.trajectoryError.toFixed(2)}°`;
  ui.fuel.textContent = `${state.displayed.fuel.toFixed(1)}%`;
  ui.power.textContent = `${state.displayed.power.toFixed(1)}%`;
  ui.pressure.textContent = `${state.displayed.pressure.toFixed(2)} psi`;
  ui.cabinTemp.textContent = `${state.displayed.cabinTemp.toFixed(1)} °F`;
  ui.radiation.textContent = `${state.displayed.radiation.toFixed(2)} mSv/h`;
  ui.signalDelay.textContent = `${state.displayed.signalDelay.toFixed(2)} s`;
  ui.co2Level.textContent = `${state.displayed.co2.toFixed(2)} mmHg`;
  ui.batteryBus.textContent = `${state.displayed.battery.toFixed(2)} V`;
  ui.dsnNode.textContent = getDsnNode(currentPhase.index);
  updateVitals(elapsedSeconds);
}

function updateVitals(t) {
  ui.cdrVitals.textContent = `${Math.round(76 + Math.sin(t / 16) * 4)} bpm / 99%`;
  ui.pilotVitals.textContent = `${Math.round(74 + Math.sin(t / 14) * 4)} bpm / 98%`;
  ui.ms1Vitals.textContent = `${Math.round(73 + Math.sin(t / 18) * 3)} bpm / 99%`;
  ui.ms2Vitals.textContent = `${Math.round(75 + Math.sin(t / 15) * 3)} bpm / 98%`;
}

function getDsnNode(phaseIndex) { if (phaseIndex <= 1) return "GOLDSTONE DSS-24"; if (phaseIndex <= 3) return "MADRID DSS-65"; if (phaseIndex <= 5) return "CANBERRA DSS-34"; return "GOLDSTONE DSS-14"; }

function renderTimeline() { ui.timeline.innerHTML = phases.map((phase, index) => `<li id="phase-${index}">${phase.name}</li>`).join(""); }
function updateTimeline(activeIndex) { phases.forEach((_, index) => { const item = document.getElementById(`phase-${index}`); item.classList.remove("completed", "current"); if (index < activeIndex) item.classList.add("completed"); else if (index === activeIndex) item.classList.add("current"); }); }
function processEvents(elapsedSeconds) { phases.forEach((phase) => phase.events.forEach((event) => { const triggerSecond = phase.startSeconds + event.offset; const key = `${phase.name}-${event.offset}`; if (elapsedSeconds >= triggerSecond && !state.loggedEvents.has(key)) { state.loggedEvents.add(key); addEvent(formatMissionTime(triggerSecond), event.message); } })); }
function addEvent(stamp, message) { ui.log.querySelectorAll(".log-entry").forEach((row) => row.classList.remove("latest")); const entry = document.createElement("div"); entry.className = "log-entry latest"; entry.textContent = `[${stamp}] ${message}`; ui.log.appendChild(entry); ui.log.scrollTop = ui.log.scrollHeight; }
function formatMissionTime(totalSeconds) { return `T+${String(Math.floor(totalSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`; }

function renderSystems() { ui.systemsGrid.innerHTML = systemDefinitions.map((name) => `<div class="system" id="system-${name.toLowerCase().replace(/\s+/g, "-")}"><span class="name">${name}</span><span class="state">NOMINAL</span></div>`).join(""); }

function updateSystemStatus(phaseName) {
  let level = "nominal";
  if (phaseName === "Translunar Injection (TLI)" || phaseName === "Reentry") level = "warning";
  if (phaseName === "Reentry" && state.displayed.altitude < 30) level = "critical";
  ui.status.classList.remove("warning", "critical");
  ui.status.textContent = level === "nominal" ? "NOMINAL" : level === "warning" ? "WARNING" : "CRITICAL";
  if (level !== "nominal") ui.status.classList.add(level);
  systemDefinitions.forEach((name) => {
    const card = document.getElementById(`system-${name.toLowerCase().replace(/\s+/g, "-")}`);
    const stateLabel = card.querySelector(".state");
    card.classList.remove("warning", "critical");
    if (level === "warning" && ["Propulsion", "Navigation", "GNC", "Comms"].includes(name)) { card.classList.add("warning"); stateLabel.textContent = "MONITOR"; return; }
    if (level === "critical" && ["Propulsion", "Thermal"].includes(name)) { card.classList.add("critical"); stateLabel.textContent = "ALERT"; return; }
    stateLabel.textContent = "NOMINAL";
  });
}

function updateSummary(elapsedSeconds) {
  const phase = state.phase;
  const blocks = [
    ["Where the mission is now", `Artemis II is currently in ${phase.name}. Mission elapsed time is ${ui.missionTime.textContent}.`],
    ["Vehicle state", `Velocity is ${ui.velocity.textContent} mph, distance from Earth is ${ui.distance.textContent} miles, and altitude is ${ui.altitude.textContent} miles.`],
    ["Crew health", `Crew biometrics remain nominal. Commander: ${ui.cdrVitals.textContent}. Pilot: ${ui.pilotVitals.textContent}.`],
    ["Systems", `Overall system status is ${ui.status.textContent}. Propulsion fuel is ${ui.fuel.textContent} and power reserve is ${ui.power.textContent}.`],
    ["Comms and network", `Comms path is ${ui.comms.textContent}. DSN node is ${ui.dsnNode.textContent}. Signal delay is ${ui.signalDelay.textContent}.`],
    ["NASA feeds", `NASA network mode is ${ui.nasaMode.textContent}. APOD (${ui.apodDate.textContent}): ${ui.apodTitle.textContent}. Solar events in 7 days: ${ui.solarEvents.textContent}. NEO close approaches: ${ui.neoEvents.textContent}.`],
    ["Forward plan", `Next major objective after ${phase.name} is ${nextPhaseName(phase.name)}. Console continues updating once per second.`]
  ];
  ui.summaryContent.innerHTML = blocks.map(([title, text]) => `<article class="summary-block"><h4>${title}</h4><p>${text}</p></article>`).join("");
}

function nextPhaseName(current) {
  const idx = phases.findIndex((p) => p.name === current);
  return idx >= 0 && idx < phases.length - 1 ? phases[idx + 1].name : "Mission Complete";
}

async function fetchNasaFeeds() {
  const nowStamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  try {
    const apodResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
    if (!apodResponse.ok) throw new Error("APOD unavailable");
    const apodData = await apodResponse.json();
    ui.apodTitle.textContent = apodData.title || "No title available";
    ui.apodDate.textContent = apodData.date || "Unknown";

    const endDate = new Date();
    const startDate = new Date(Date.now() - 7 * 24 * 3600 * SECOND);
    const donkiResponse = await fetch(`https://api.nasa.gov/DONKI/notifications?type=all&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`);
    const neoResponse = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&api_key=${NASA_API_KEY}`);

    if (donkiResponse.ok) {
      const donkiData = await donkiResponse.json();
      ui.solarEvents.textContent = Array.isArray(donkiData) ? `${donkiData.length} notifications` : "0 notifications";
    } else {
      ui.solarEvents.textContent = "DONKI unavailable";
    }

    if (neoResponse.ok) {
      const neoData = await neoResponse.json();
      ui.neoEvents.textContent = `${neoData.element_count || 0} objects`;
    } else {
      ui.neoEvents.textContent = "NEO feed unavailable";
    }

    ui.nasaUpdated.textContent = nowStamp;
    ui.nasaMode.textContent = "LIVE SYNC";
    ui.nasaLinkState.textContent = "SYNC ACTIVE";
    ui.nasaLinkState.classList.remove("warning", "critical");
    addEvent(formatMissionTime(Math.floor((Date.now() - missionStart.getTime()) / SECOND)), "NASA data feeds synchronized");
  } catch (error) {
    ui.apodTitle.textContent = "NASA feed timeout";
    ui.apodDate.textContent = "--";
    ui.solarEvents.textContent = "Retry in 10 min";
    ui.neoEvents.textContent = "Retry in 10 min";
    ui.nasaUpdated.textContent = nowStamp;
    ui.nasaMode.textContent = "DEGRADED LOCAL";
    ui.nasaLinkState.textContent = "SYNC DEGRADED";
    ui.nasaLinkState.classList.remove("critical");
    ui.nasaLinkState.classList.add("warning");
    addEvent(formatMissionTime(Math.floor((Date.now() - missionStart.getTime()) / SECOND)), "NASA feed degraded - local simulation continues");
  }
}

function formatDate(date) { return date.toISOString().slice(0, 10); }

}

function renderTimeline() {
  ui.timeline.innerHTML = phases
    .map((phase, index) => `<li id="phase-${index}">${phase.name}</li>`)
    .join("");
}

function updateTimeline(activeIndex) {
  phases.forEach((_, index) => {
    const item = document.getElementById(`phase-${index}`);
    item.classList.remove("completed", "current");

    if (index < activeIndex) {
      item.classList.add("completed");
    } else if (index === activeIndex) {
      item.classList.add("current");
    }
  });
}

function processEvents(elapsedSeconds) {
  phases.forEach((phase) => {
    phase.events.forEach((event) => {
      const triggerSecond = phase.startSeconds + event.offset;
      const key = `${phase.name}-${event.offset}`;
      if (elapsedSeconds >= triggerSecond && !state.loggedEvents.has(key)) {
        state.loggedEvents.add(key);
        addEvent(formatMissionTime(triggerSecond), event.message);
      }
    });
  });
}

function addEvent(stamp, message) {
  const rows = ui.log.querySelectorAll(".log-entry");
  rows.forEach((row) => row.classList.remove("latest"));

  const entry = document.createElement("div");
  entry.className = "log-entry latest";
  entry.textContent = `[${stamp}] ${message}`;
  ui.log.appendChild(entry);

  ui.log.scrollTop = ui.log.scrollHeight;
}

function formatMissionTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `T+${h}:${m}:${s}`;
}

function renderSystems() {
  ui.systemsGrid.innerHTML = systemDefinitions
    .map(
      (name) => `
      <div class="system" id="system-${name.toLowerCase().replace(/\s+/g, "-")}">
        <span class="name">${name}</span>
        <span class="state">NOMINAL</span>
      </div>
    `
    )
    .join("");
}

function updateSystemStatus(phaseName) {
  let level = "nominal";
  if (phaseName === "Translunar Injection (TLI)" || phaseName === "Reentry") {
    level = "warning";
  }
  if (phaseName === "Reentry" && state.displayed.altitude < 30) {
    level = "critical";
  }

  ui.status.classList.remove("warning", "critical");
  ui.status.textContent = level === "nominal" ? "NOMINAL" : level === "warning" ? "WARNING" : "CRITICAL";

  if (level !== "nominal") {
    ui.status.classList.add(level);
  }

  systemDefinitions.forEach((name) => {
    const card = document.getElementById(`system-${name.toLowerCase().replace(/\s+/g, "-")}`);
    const stateLabel = card.querySelector(".state");
    card.classList.remove("warning", "critical");

    if (level === "nominal") {
      stateLabel.textContent = "NOMINAL";
      return;
    }

    if (level === "warning" && (name === "Propulsion" || name === "Navigation")) {
      card.classList.add("warning");
      stateLabel.textContent = "MONITOR";
      return;
    }

    if (level === "critical" && name === "Propulsion") {
      card.classList.add("critical");
      stateLabel.textContent = "ALERT";
      return;
    }

    stateLabel.textContent = "NOMINAL";
  });
}

init();

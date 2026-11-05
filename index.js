// Minimal Brawl Stars Discord Rich Presence
// Setup:  npm init -y && npm install discord-rpc dotenv
// Run:    node index.js
require("dotenv").config();
const RPC = require("discord-rpc");

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const API_KEY = process.env.BRAWL_STARS_API_KEY;
const TAG = (process.env.BRAWL_STARS_PLAYER_TAG || "").replace("#", "").toUpperCase();

const client = new RPC.Client({ transport: "ipc" });
const startedAt = new Date();

async function getPlayer() {
  const res = await fetch(`https://api.brawlstars.com/v1/players/%23${TAG}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Brawl Stars API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
// Returns all player data from the Brawl Stars API -- uncomment to view when running
// getPlayer().then(p => console.log(JSON.stringify(p, null, 2)));

let page = 0;

function bestStreak(brawlers = []) {
  // Finds the highest value among fields whose name contains "streak"
  // and also "max"/"highest"; falls back to any "streak" field.
  let best = null;
  for (const b of brawlers) {
    for (const [key, val] of Object.entries(b)) {
      if (typeof val !== "number" || !/streak/i.test(key)) continue;
      if (/max|highest|best/i.test(key)) best = Math.max(best ?? 0, val);
    }
  }
  return best;
}

async function updatePresence() {
  try {
    const p = await getPlayer();
    const streak = bestStreak(p.brawlers);
    const fmt = (n) => Number(n).toLocaleString();

    const pages = [
      {
        details: `Trophies: ${fmt(p.trophies)} (Peak ${fmt(p.highestTrophies)})`,
        state: `Highest win streak: ${streak ?? "?"}`,
      },
      {
        details: `Ranked: ${p.rankedRankName} - ${fmt(p.rankedElo)} elo`,
        state: `Peak: ${p.highestAllTimeRankedRankName} - ${fmt(p.highestAllTimeRankedElo)} elo`,
      },
    ];

    const { details, state } = pages[page % pages.length];
    page++;

    await client.setActivity({
      details,
      state,
      startTimestamp: startedAt,
      instance: false,
    });
    console.log(`[${new Date().toLocaleTimeString()}] ${details} | ${state}`);
  } catch (err) {
    console.error("Update failed:", err.message);
  }
}

client.on("ready", () => {
  console.log("Connected to Discord as", client.user?.username);
  updatePresence();
  setInterval(updatePresence, 30 * 1000); 
});

client.login({ clientId: CLIENT_ID }).catch((err) => {
  console.error("Could not connect to Discord:", err.message);
});
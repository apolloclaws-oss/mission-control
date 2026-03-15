import fs from "fs";
import path from "path";

const FEED_PATH = "/Users/stefano/.openclaw/workspace/intelligence-feed.json";

const FALLBACK = [
  {
    title: "OpenClaw users automating entire businesses while sleeping",
    source: "reddit.com/r/openclaw",
    summary: "Power users set up heartbeat tasks every 15 minutes — researching competitors, updating memory, checking servers. Key insight: treat your AI like a new employee. Spend the first day training it.",
    tag: "OpenClaw",
    time: "Today",
  },
  {
    title: "SwiftUI @Observable macro is a game changer for indie devs",
    source: "twitter.com",
    summary: "The new @Observable macro in Swift 5.9+ replaces @StateObject/@ObservedObject with cleaner syntax. Combined with SwiftData, you can build full CRUD apps in half the time. Perfect for solo developers shipping fast.",
    tag: "Swift",
    time: "Today",
  },
  {
    title: "Low competition app niches with proven demand in 2025",
    source: "indiehackers.com",
    summary: "Item lending tracker, medication reminders with photo scanning, hobby buddy matcher. These niches have Reddit posts with hundreds of upvotes saying 'why doesn't this exist?' — validated demand, zero solutions.",
    tag: "Ideas",
    time: "Today",
  },
  {
    title: "App Store Optimization: the #1 mistake indie devs make",
    source: "twitter.com",
    summary: "Launching without ASO. Your icon, screenshots, and first 3 lines of description determine 80% of conversion. Find keywords with high search volume + low competition before you ship.",
    tag: "Marketing",
    time: "Today",
  },
];

export async function GET() {
  try {
    if (fs.existsSync(FEED_PATH)) {
      const raw = fs.readFileSync(FEED_PATH, "utf-8");
      const data = JSON.parse(raw);
      return Response.json(data);
    }
  } catch {}
  return Response.json({ items: FALLBACK, lastUpdated: null });
}

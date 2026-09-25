import { CONNECTED_SOURCES } from "../../components/dashboard/data/intelligenceMockData";

/**
 * Sources API Client
 * Designed for connecting & managing pipeline integrations: GET/POST /api/v1/sources
 */
export async function getConnectedSources() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return [...CONNECTED_SOURCES];
}

export async function connectNewSource(payload) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newSource = {
    id: `src-${Date.now()}`,
    name: payload.name || "Custom Stream",
    type: payload.type || "API Webhook",
    status: "connected",
    lastSync: "Just now",
    itemsCount: 0,
    health: "100%",
    icon: "Globe",
    accent: "#0284C7",
    bgAccent: "#F0F9FF",
    borderAccent: "#BAE6FD",
  };
  CONNECTED_SOURCES.push(newSource);
  return newSource;
}

export async function syncSource(sourceId) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const src = CONNECTED_SOURCES.find((s) => s.id === sourceId);
  if (src) {
    src.lastSync = "Just now";
  }
  return src;
}

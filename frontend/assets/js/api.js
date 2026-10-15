/**
 * api.js — NYC Urban Mobility Data Explorer
 *
 * All communication with the Flask backend lives here.
 * Every other module calls these functions — nothing else should
 * know about URLs, query strings, or fetch() directly.
 */

const API_BASE_URL = "http://127.0.0.1:5000/api";

/**
 * Core GET helper. Builds the full URL with query params,
 * fires the request, and returns parsed JSON.
 *
 * Empty/null/undefined values are stripped out so we don't
 * send ?hour=&dow= noise to the backend.
 */
async function fetchJSON(endpoint, params = {}) {
  const url = new URL(API_BASE_URL + endpoint);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== "" && val !== null && val !== undefined) {
      url.searchParams.set(key, val);
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch ${endpoint}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// ── Endpoints ──────────────────────────────────────────────────────────────

// Simple ping to check the Flask server is up
async function getHealthStatus() {
  return fetchJSON("/health");
}

// KPI summary — always unfiltered, used for the top strip numbers
async function getSummaryKPIs() { return fetchJSON("/trips/summary"); }

// All stat endpoints accept an optional filter object `f`
// so the global filters flow through without any extra wiring
async function getHourlyStats(f = {})     { return fetchJSON("/stats/hourly", f); }
async function getDayOfWeekStats(f = {})  { return fetchJSON("/stats/dow", f); }
async function getTopZonesStats(k, f = {}){ return fetchJSON("/stats/top-zones", { k, ...f }); }
async function getFareDistributionStats(f = {}) { return fetchJSON("/stats/fare-distribution", f); }
async function getSpeedHeatmapStats(f = {})     { return fetchJSON("/stats/speed-heatmap", f); }
async function getBoroughFlowStats(f = {})      { return fetchJSON("/stats/borough-flow", f); }

// Trip Explorer table — passes all active filters including limit
async function getZoneCounts(f = {})         { return fetchJSON("/stats/zone-counts", f); }
async function getFilteredTrips(filters = {}) { return fetchJSON("/trips", filters); }
// main.js — app entry point: theme, navigation, filters, data loading

const MOON_SVG = `<circle cx="12" cy="12" r="5"/><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
const SUN_SVG  = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const label = document.getElementById("theme-label");
  const icon  = document.getElementById("theme-icon");
  if (theme === "light") {
    label.textContent = "Dark Mode";
    icon.innerHTML = MOON_SVG;
  } else {
    label.textContent = "Light Mode";
    icon.innerHTML = SUN_SVG;
  }
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
  document.getElementById("btn-theme").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// cached state shared across charts, table, and map
let _cachedTripRows = [];
let _cachedGeoJson  = null;
let _lastTopZones   = [];
let _currentFilterState = {};

async function loadSummaryKPIsData() {
  try {
    const summary = await getSummaryKPIs();
    if (!summary) return;
    document.getElementById("val-total").textContent = (+summary.total_trips).toLocaleString();
    document.getElementById("val-fare").textContent  = `$${(+summary.avg_fare).toFixed(2)}`;
    document.getElementById("val-dist").textContent  = `${(+summary.avg_distance_miles).toFixed(2)} mi`;
    document.getElementById("val-speed").textContent = `${(+summary.avg_speed_mph).toFixed(1)} mph`;
    document.getElementById("val-dur").textContent   = `${(+summary.avg_duration_min).toFixed(1)} min`;
    document.getElementById("val-fpm").textContent   = `$${(+summary.avg_fare_per_mile).toFixed(2)}`;
  } catch (err) {
    console.warn("KPI load failed:", err);
  }
}

async function loadAllDashboardCharts(filters = {}) {
  try {
    // fire all six requests in parallel
    const [hourly, dow, fareDist, speedHm, topZones, boroughFlow, zoneCounts] = await Promise.all([
      getHourlyStats(filters),
      getDayOfWeekStats(filters),
      getFareDistributionStats(filters),
      getSpeedHeatmapStats(filters),
      getTopZonesStats(10, filters),
      getBoroughFlowStats(filters),
      getZoneCounts(filters),
    ]);

    renderHourlyChart(hourly);
    renderDowChart(dow);
    renderFareDistChart(fareDist);
    renderSpeedHeatmapChart(speedHm);
    renderTopZonesChart(topZones);
    renderBoroughFlowChart(boroughFlow);

    _lastTopZones = zoneCounts;

    // don't render map here — only render when map tab is active
    if (!_cachedGeoJson) {
      fetch("/assets/data/taxi_zones.geojson")
        .then(res => res.json())
        .then(geoJson => { _cachedGeoJson = geoJson; })
        .catch(err => console.warn("GeoJSON load failed:", err));
    }
  } catch (err) {
    console.error("Chart load error:", err);
  }
}

async function loadExplorerTripRows(filters = {}) {
  try {
    _cachedTripRows = await getFilteredTrips({ ...filters, limit: 500 });
    renderTripTable(_cachedTripRows);
    const countEl = document.getElementById("result-count");
    if (countEl) countEl.textContent = `${_cachedTripRows.length.toLocaleString()} trips displayed`;
  } catch (err) {
    console.error("Trip table load error:", err);
  }
}

async function handleApplyFilters() {
  _currentFilterState = getFilterValues();
  updateFilterStatusBadge(_currentFilterState);
  await Promise.all([
    loadExplorerTripRows(_currentFilterState),
    loadAllDashboardCharts(_currentFilterState),
  ]);
}

async function handleResetFilters() {
  resetFilterControls();
  _currentFilterState = {};
  updateFilterStatusBadge({});
  await Promise.all([
    loadSummaryKPIsData(),
    loadAllDashboardCharts(),
    loadExplorerTripRows({}),
  ]);
}

function setupNavigationHandlers() {
  const navLinks = document.querySelectorAll(".nav-link");
  const views    = document.querySelectorAll(".view");

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetViewId = link.dataset.view;
      navLinks.forEach(l => l.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));
      link.classList.add("active");
      const activeView = document.getElementById(`view-${targetViewId}`);
      if (activeView) activeView.classList.add("active");
      if (targetViewId === "map") {
        initializeMapContainer();
        setTimeout(async () => {
          if (_leafletMapInstance) _leafletMapInstance.invalidateSize();
          if (!_cachedGeoJson) {
            try {
              const res = await fetch("/assets/data/taxi_zones.geojson");
              _cachedGeoJson = await res.json();
            } catch(e) { console.warn("GeoJSON failed:", e); return; }
          }
          if (!_lastTopZones || _lastTopZones.length === 0) {
            try { _lastTopZones = await getZoneCounts({}); } catch(e) { console.warn("zone-counts failed:", e); }
          }
          renderGeospatialMap(_cachedGeoJson, _lastTopZones);
        }, 250);
      }
    });
  });
}

async function checkBackendHealth() {
  const statusEl = document.getElementById("server-status");
  try {
    const health = await getHealthStatus();
    if (health && health.status === "ok") {
      statusEl.className = "server-status ok";
      statusEl.innerHTML = `<span class="pulse-dot"></span> Backend Engine Live`;
    }
  } catch {
    statusEl.className = "server-status err";
    statusEl.innerHTML = `<span class="pulse-dot" style="background:#f87171;"></span> Offline Mode`;
  }
}

async function initializeDashboardApp() {
  initTheme();
  populateHourDropdown();
  setupNavigationHandlers();
  checkBackendHealth();

  await Promise.all([
    loadSummaryKPIsData(),
    loadAllDashboardCharts(),
    loadExplorerTripRows({}),
  ]);

  const btnApply = document.getElementById("btn-apply");
  if (btnApply) btnApply.addEventListener("click", handleApplyFilters);

  const btnReset = document.getElementById("btn-reset");
  if (btnReset) btnReset.addEventListener("click", handleResetFilters);

  const btnSort = document.getElementById("btn-sort");
  if (btnSort) {
    btnSort.addEventListener("click", () => {
      const sortColumn  = document.getElementById("sort-col").value;
      const isAscending = document.getElementById("sort-dir").value === "asc";
      // client-side insertion sort — no server round-trip needed
      const sortedRows  = insertionSort(_cachedTripRows, sortColumn, isAscending);
      renderTripTable(sortedRows);
    });
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboardApp);
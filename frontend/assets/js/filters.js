/**
 * NYC Urban Mobility Data Explorer — Filters Control Module
 */

function getFilterValues() {
  const raw = {
    hour:       document.getElementById("filter-hour").value,
    dow:        document.getElementById("filter-dow").value,
    pu_borough: document.getElementById("filter-pu-borough").value,
  };
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""));
}

function resetFilterControls() {
  document.getElementById("filter-hour").value       = "";
  document.getElementById("filter-dow").value        = "";
  document.getElementById("filter-pu-borough").value = "";
}

function populateHourDropdown() {
  const select = document.getElementById("filter-hour");
  if (!select || select.options.length > 1) return;

  for (let hour = 0; hour < 24; hour++) {
    const opt = document.createElement("option");
    opt.value = hour;
    opt.textContent = `${String(hour).padStart(2, "0")}:00 - ${String(hour).padStart(2, "0")}:59`;
    select.appendChild(opt);
  }
}

function updateFilterStatusBadge(filters) {
  const badgeContainer = document.getElementById("filter-status");
  const badgeText      = document.getElementById("filter-status-text");
  
  const activeEntries = Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined);

  if (activeEntries.length === 0) {
    badgeContainer.classList.add("hidden");
  } else {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labels = activeEntries.map(([key, val]) => {
      if (key === "hour")       return `Hour ${String(val).padStart(2, "0")}:00`;
      if (key === "dow")        return DAYS[val] || val;
      if (key === "pu_borough") return val;
      return val;
    });

    badgeText.textContent = `Filtered: ${labels.join(" · ")}`;
    badgeContainer.classList.remove("hidden");
  }
}
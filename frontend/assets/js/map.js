/**
 * NYC Urban Mobility Data Explorer — Leaflet Geospatial Map Engine
 */

let _leafletMapInstance = null;
let _geoJsonLayerInstance = null;
let _pickupCountsByZoneId = {};

function initializeMapContainer() {
  if (_leafletMapInstance) return;

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  _leafletMapInstance = L.map("map", {
    center: [40.7128, -74.0060],
    zoom: 11,
    zoomControl: false,
  });

  L.control.zoom({ position: "topright" }).addTo(_leafletMapInstance);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(_leafletMapInstance);

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-legend");
    div.innerHTML = `
      <div class="legend-title">NYC Taxi Pickup Density</div>
      <div class="legend-row"><span class="legend-box" style="background:#ef4444"></span> Very High</div>
      <div class="legend-row"><span class="legend-box" style="background:#f97316"></span> High</div>
      <div class="legend-row"><span class="legend-box" style="background:#facc15"></span> Medium</div>
      <div class="legend-row"><span class="legend-box" style="background:#4ade80"></span> Low</div>
      <div class="legend-row"><span class="legend-box" style="background:#1e293b;border:1px solid #334155"></span> No Data</div>
    `;
    return div;
  };
  legend.addTo(_leafletMapInstance);

  window._leafletMapInstance = _leafletMapInstance;
}

function _getPercentileThresholds(countsMap) {
  const vals = Object.values(countsMap).filter(v => v > 0).sort((a, b) => a - b);
  if (!vals.length) return [0, 0, 0];
  const at = pct => vals[Math.floor(pct * (vals.length - 1))];
  return [at(0.5), at(0.75), at(0.9)];
}

function renderGeospatialMap(geoJsonData, topZonesData = []) {
  initializeMapContainer();

  _pickupCountsByZoneId = {};
  topZonesData.forEach(zone => {
    _pickupCountsByZoneId[zone.zone_id] = zone.trip_count;
  });

  const [p50, p75, p90] = _getPercentileThresholds(_pickupCountsByZoneId);

  if (_geoJsonLayerInstance) {
    _leafletMapInstance.removeLayer(_geoJsonLayerInstance);
  }

  _leafletMapInstance.invalidateSize();

  _geoJsonLayerInstance = L.geoJSON(geoJsonData, {
    style: feature => {
      const locationId = feature.properties.LocationID || feature.properties.location_id;
      const count      = _pickupCountsByZoneId[locationId] || 0;

      let fillColor;
      if (count === 0)       fillColor = "#1e293b";
      else if (count >= p90) fillColor = "#ef4444";
      else if (count >= p75) fillColor = "#f97316";
      else if (count >= p50) fillColor = "#facc15";
      else                   fillColor = "#4ade80";

      return {
        fillColor,
        fillOpacity: count === 0 ? 0.25 : 0.78,
        color:       "#0f172a",
        weight:      1.5,
        opacity:     1,
      };
    },
    onEachFeature: (feature, layer) => {
      const locationId = feature.properties.LocationID || feature.properties.location_id;
      const zoneName   = feature.properties.zone || `Zone ${locationId}`;
      const borough    = feature.properties.borough || "NYC";
      const tripCount  = _pickupCountsByZoneId[locationId] || 0;

      const popupHtml = `
        <div style="font-family:'Montserrat',sans-serif; padding:4px;">
          <div style="font-size:13px; font-weight:700; color:#f5c518; text-transform:uppercase;">${zoneName}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Borough: <strong style="color:#f8fafc;">${borough}</strong></div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Location ID: <strong style="color:#f8fafc;">${locationId}</strong></div>
          <div style="font-size:12px; font-weight:700; color:#38bdf8; margin-top:6px;">${tripCount.toLocaleString()} Pickups</div>
        </div>
      `;

      layer.bindTooltip(`
        <div style="font-family:'Montserrat',sans-serif;">
          <div style="font-size:12px;font-weight:700;color:#f5c518;text-transform:uppercase;">${zoneName}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${borough}</div>
          <div style="font-size:12px;font-weight:700;color:#38bdf8;margin-top:4px;">${tripCount.toLocaleString()} Pickups</div>
        </div>
      `, { sticky: true, className: "zone-tooltip" });

      layer.on("mouseover", function () {
        this.setStyle({ weight: 2, color: "#f5c518", fillOpacity: 0.9 });
      });

      layer.on("mouseout", function () {
        _geoJsonLayerInstance.resetStyle(this);
      });
    },
  }).addTo(_leafletMapInstance);
}

function invalidateMapSize() {
  if (_leafletMapInstance) {
    setTimeout(() => _leafletMapInstance.invalidateSize(), 300);
  }
}

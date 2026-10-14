/**
 * NYC Urban Mobility Data Explorer — Leaflet Geospatial Map Engine
 * Sharp Cornered & Flat Solid Human Color Palette
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

  window._leafletMapInstance = _leafletMapInstance;
}

function renderGeospatialMap(geoJsonData, topZonesData = []) {
  initializeMapContainer();

  _pickupCountsByZoneId = {};
  topZonesData.forEach(zone => {
    _pickupCountsByZoneId[zone.zone_id] = zone.trip_count;
  });

  const maxTrips = Math.max(...Object.values(_pickupCountsByZoneId), 1);

  if (_geoJsonLayerInstance) {
    _leafletMapInstance.removeLayer(_geoJsonLayerInstance);
  }

  // force Leaflet to recalculate container size before drawing polygons
  _leafletMapInstance.invalidateSize();

  _geoJsonLayerInstance = L.geoJSON(geoJsonData, {
    style: feature => {
      const locationId = feature.properties.LocationID || feature.properties.location_id;
      const count      = _pickupCountsByZoneId[locationId] || 0;
      const ratio      = count / maxTrips;

      return {
        fillColor:   ratio > 0.5 ? "#f5c518" : ratio > 0.2 ? "#38bdf8" : "#34d399",
        fillOpacity: 0.2 + (ratio * 0.7),
        color:       "#272a34",
        weight:      1,
        opacity:     0.9,
      };
    },
    onEachFeature: (feature, layer) => {
      const locationId = feature.properties.LocationID || feature.properties.location_id;
      const zoneName   = feature.properties.zone || `Zone ${locationId}`;
      const borough    = feature.properties.borough || "NYC";
      const tripCount  = _pickupCountsByZoneId[locationId] || 0;

      const popupHtml = `
        <div style="font-family:'Montserrat',sans-serif; padding:4px;">
          <div style="font-family:'Montserrat',sans-serif; font-size:13px; font-weight:700; color:#f5c518; text-transform:uppercase;">${zoneName}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Borough: <strong style="color:#f8fafc;">${borough}</strong></div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Location ID: <strong style="color:#f8fafc;">${locationId}</strong></div>
          <div style="font-size:12px; font-weight:700; color:#38bdf8; margin-top:6px;">${tripCount.toLocaleString()} Pickups</div>
        </div>
      `;

      layer.bindPopup(popupHtml);

      layer.on("mouseover", function () {
        this.setStyle({ weight: 2, color: "#f5c518", fillOpacity: 0.9 });
        this.openPopup();
      });

      layer.on("mouseout", function () {
        _geoJsonLayerInstance.resetStyle(this);
        this.closePopup();
      });
    },
  }).addTo(_leafletMapInstance);
}

function invalidateMapSize() {
  if (_leafletMapInstance) {
    setTimeout(() => {
      _leafletMapInstance.invalidateSize();
    }, 300);
  }
}
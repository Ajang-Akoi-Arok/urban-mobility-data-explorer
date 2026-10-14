// charts.js — all six Chart.js visualisations

// one colour per day, consistent across all charts
const DayOfWeekColors = [
  "#1E88E5", // Mon
  "#2E7D32", // Tue
  "#FBC02D", // Wed
  "#E65100", // Thu
  "#C62828", // Fri
  "#6A1B9A", // Sat
  "#D81B60", // Sun
];

const ChartTheme = {
  yellow:  "#f5c518",
  blue:    "#1E88E5",
  green:   "#2E7D32",
  purple:  "#6A1B9A",
  orange:  "#E65100",
  red:     "#C62828",
  grid:    "transparent",
  text:    "#f8fafc",
  muted:   "#94a3b8",
  palette: DayOfWeekColors,
  font:    { family: "'Montserrat', sans-serif", size: 11 },
};

// track active instances so we can destroy before re-rendering
const _activeChartInstances = {};

function destroyExistingChart(chartId) {
  if (_activeChartInstances[chartId]) {
    _activeChartInstances[chartId].destroy();
    delete _activeChartInstances[chartId];
  }
}

// Chart 1: dual-axis bars (trip count) + line (avg fare) by hour
function renderHourlyChart(data) {
  destroyExistingChart("hourly");
  const canvas = document.getElementById("chart-hourly");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  _activeChartInstances["hourly"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => `${String(d.pickup_hour).padStart(2, "0")}:00`),
      datasets: [
        {
          label: "Trip Count",
          data: data.map(d => d.trip_count),
          backgroundColor: ChartTheme.yellow,
          borderColor: ChartTheme.yellow,
          borderWidth: 0,
          borderRadius: 0,
          yAxisID: "y",
        },
        {
          label: "Avg Fare ($)",
          data: data.map(d => d.avg_fare),
          type: "line",
          borderColor: ChartTheme.red,
          backgroundColor: ChartTheme.red,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: ChartTheme.muted, font: ChartTheme.font, usePointStyle: false } },
      },
      scales: {
        x: {
          ticks: { color: ChartTheme.muted, font: ChartTheme.font },
          grid:  { color: ChartTheme.grid },
        },
        y: {
          position: "left",
          ticks: { color: ChartTheme.muted, font: ChartTheme.font },
          grid:  { color: ChartTheme.grid },
          title: { display: true, text: "Trip Count", color: ChartTheme.muted, font: ChartTheme.font },
        },
        y1: {
          position: "right",
          ticks: { color: ChartTheme.red, font: ChartTheme.font },
          grid:  { drawOnChartArea: false },
          title: { display: true, text: "Avg Fare ($)", color: ChartTheme.red, font: ChartTheme.font },
        },
      },
    },
  });
}

// Chart 2: doughnut — trip share by day of week
function renderDowChart(data) {
  destroyExistingChart("dow");
  const canvas = document.getElementById("chart-dow");
  if (!canvas) return;
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const ctx = canvas.getContext("2d");
  const colors = data.map(d => DayOfWeekColors[d.pickup_dow] || DayOfWeekColors[0]);

  _activeChartInstances["dow"] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map(d => DAYS[d.pickup_dow]),
      datasets: [{
        data: data.map(d => d.trip_count),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { position: "right", labels: { color: ChartTheme.muted, font: ChartTheme.font, boxWidth: 10 } },
      },
    },
  });
}

// Chart 3: fare histogram in $5 buckets
function renderFareDistChart(data) {
  destroyExistingChart("fare-dist");
  const canvas = document.getElementById("chart-fare-dist");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  _activeChartInstances["fare-dist"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => `$${d.bucket_start}`),
      datasets: [{
        label: "Trips Count",
        data: data.map(d => d.count),
        backgroundColor: ChartTheme.blue,
        borderRadius: 0,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: ChartTheme.muted, font: ChartTheme.font },
          grid:  { color: ChartTheme.grid },
          title: { display: true, text: "Fare Bucket ($)", color: ChartTheme.muted, font: ChartTheme.font },
        },
        y: {
          ticks: { color: ChartTheme.muted, font: ChartTheme.font },
          grid:  { color: ChartTheme.grid },
          title: { display: true, text: "Frequency", color: ChartTheme.muted, font: ChartTheme.font },
        },
      },
    },
  });
}

// Chart 4: true 24×7 speed heatmap — Canvas 2D, no Chart.js instance
function renderSpeedHeatmapChart(data) {
  destroyExistingChart("speed-heatmap");
  const canvas = document.getElementById("chart-speed-heatmap");
  if (!canvas) return;

  const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = 24;
  const ROWS  = 7;

  // build 7×24 grid
  const grid = Array.from({ length: ROWS }, () => new Array(HOURS).fill(null));
  data.forEach(d => {
    const spd = parseFloat(d.avg_speed);
    if (d.pickup_dow >= 0 && d.pickup_dow < ROWS && d.pickup_hour >= 0 && d.pickup_hour < HOURS && !isNaN(spd)) {
      grid[d.pickup_dow][d.pickup_hour] = spd;
    }
  });

  const allVals = grid.flat().filter(v => v !== null);
  if (!allVals.length) return;
  const minSpd = Math.min(...allVals);
  const maxSpd = Math.max(...allVals);
  const overallAvg = +(allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(1);

  // color scale: deep blue → steel → yellow → orange → red
  function speedColor(val) {
    if (val === null) return "rgba(39,42,52,0.6)";
    const t = maxSpd === minSpd ? 0.5 : (val - minSpd) / (maxSpd - minSpd);
    // 5-stop gradient stops
    const stops = [
      [0.00, [30,  58, 138]],   // deep blue  (very slow)
      [0.25, [56, 189, 248]],   // sky blue
      [0.50, [245, 197, 24]],   // yellow     (average)
      [0.75, [251, 146, 60]],   // orange
      [1.00, [239,  68,  68]],  // red        (very fast)
    ];
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i][0] && t <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
    }
    const seg = hi[0] === lo[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0]);
    const r = Math.round(lo[1][0] + seg * (hi[1][0] - lo[1][0]));
    const g = Math.round(lo[1][1] + seg * (hi[1][1] - lo[1][1]));
    const b = Math.round(lo[1][2] + seg * (hi[1][2] - lo[1][2]));
    return `rgb(${r},${g},${b})`;
  }

  function draw() {
    const dpr    = window.devicePixelRatio || 1;
    const wrap   = canvas.parentElement;
    const W      = wrap.clientWidth  || 600;
    const H      = wrap.clientHeight || 240;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const LABEL_LEFT = 38;   // day labels
    const LABEL_BOT  = 22;   // hour labels
    const LEGEND_H   = 14;   // color bar height
    const LEGEND_TOP = 6;
    const LEGEND_BOT = LEGEND_TOP + LEGEND_H;
    const GRID_TOP   = LEGEND_BOT + 18;  // space for legend + gap
    const GRID_H     = H - GRID_TOP - LABEL_BOT;
    const GRID_W     = W - LABEL_LEFT;
    const cellW      = GRID_W / HOURS;
    const cellH      = GRID_H / ROWS;

    const FONT = `500 10px 'Montserrat', sans-serif`;
    const FONT_BOLD = `700 10px 'Montserrat', sans-serif`;

    // ── legend color bar ──────────────────────────────────────────────────
    const grad = ctx.createLinearGradient(LABEL_LEFT, 0, W, 0);
    grad.addColorStop(0.00, "rgb(30,58,138)");
    grad.addColorStop(0.25, "rgb(56,189,248)");
    grad.addColorStop(0.50, "rgb(245,197,24)");
    grad.addColorStop(0.75, "rgb(251,146,60)");
    grad.addColorStop(1.00, "rgb(239,68,68)");
    ctx.fillStyle = grad;
    ctx.fillRect(LABEL_LEFT, LEGEND_TOP, GRID_W, LEGEND_H);

    // legend tick labels
    ctx.font = FONT;
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText(`${minSpd.toFixed(1)} mph`, LABEL_LEFT, LEGEND_BOT + 11);
    ctx.textAlign = "center";
    ctx.fillText(`${overallAvg} mph avg`, LABEL_LEFT + GRID_W / 2, LEGEND_BOT + 11);
    ctx.textAlign = "right";
    ctx.fillText(`${maxSpd.toFixed(1)} mph`, W, LEGEND_BOT + 11);

    // ── heatmap cells ─────────────────────────────────────────────────────
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < HOURS; col++) {
        const val = grid[row][col];
        const x = LABEL_LEFT + col * cellW;
        const y = GRID_TOP   + row * cellH;
        ctx.fillStyle = speedColor(val);
        ctx.fillRect(x, y, cellW, cellH);
      }
    }

    // ── day labels (Y axis) ───────────────────────────────────────────────
    ctx.font = FONT_BOLD;
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "right";
    for (let row = 0; row < ROWS; row++) {
      const y = GRID_TOP + row * cellH + cellH / 2 + 3.5;
      ctx.fillText(DAYS[row], LABEL_LEFT - 6, y);
    }

    // ── hour labels (X axis) — every 3 hours ─────────────────────────────
    ctx.font = FONT;
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    for (let col = 0; col < HOURS; col += 3) {
      const x = LABEL_LEFT + col * cellW + cellW / 2;
      ctx.fillText(`${String(col).padStart(2, "0")}h`, x, GRID_TOP + GRID_H + 14);
    }

    // ── tooltip overlay ───────────────────────────────────────────────────
    canvas._heatmapMeta = { LABEL_LEFT, GRID_TOP, GRID_W, GRID_H, cellW, cellH, grid, DAYS, dpr };
  }

  draw();

  // redraw on resize
  if (canvas._resizeObserver) canvas._resizeObserver.disconnect();
  canvas._resizeObserver = new ResizeObserver(draw);
  canvas._resizeObserver.observe(canvas.parentElement);

  // ── tooltip ──────────────────────────────────────────────────────────────
  canvas.onmousemove = function(e) {
    const m = canvas._heatmapMeta;
    if (!m) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor((mx - m.LABEL_LEFT) / m.cellW);
    const row = Math.floor((my - m.GRID_TOP)   / m.cellH);
    let tip = document.getElementById("_heatmap_tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "_heatmap_tip";
      tip.style.cssText = `position:fixed;pointer-events:none;z-index:9999;padding:6px 10px;
        background:#17191e;border:1px solid #393e4d;font-family:'Montserrat',sans-serif;
        font-size:11px;color:#f8fafc;white-space:nowrap;`;
      document.body.appendChild(tip);
    }
    if (col >= 0 && col < 24 && row >= 0 && row < 7) {
      const val = m.grid[row][col];
      const label = val !== null
        ? `<strong>${m.DAYS[row]}</strong> · ${String(col).padStart(2,"0")}:00 — <span style="color:#f5c518">${val.toFixed(1)} mph</span>`
        : `<strong>${m.DAYS[row]}</strong> · ${String(col).padStart(2,"0")}:00 — <span style="color:#64748b">No data</span>`;
      tip.innerHTML = label;
      tip.style.display = "block";
      tip.style.left = (e.clientX + 14) + "px";
      tip.style.top  = (e.clientY - 28) + "px";
    } else {
      tip.style.display = "none";
    }
  };
  canvas.onmouseleave = function() {
    const tip = document.getElementById("_heatmap_tip");
    if (tip) tip.style.display = "none";
  };
}

// Chart 5: horizontal bar — top-k pickup zones by volume
function renderTopZonesChart(data) {
  destroyExistingChart("top-zones");
  const canvas = document.getElementById("chart-top-zones");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  _activeChartInstances["top-zones"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.zone_name || `Zone ${d.zone_id}`),
      datasets: [{
        label: "Trip Volume",
        data: data.map(d => d.trip_count),
        backgroundColor: ChartTheme.yellow,
        borderRadius: 0,
        borderWidth: 0,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: ChartTheme.muted, font: ChartTheme.font }, grid: { color: ChartTheme.grid } },
        y: { ticks: { color: ChartTheme.text, font: ChartTheme.font }, grid: { color: ChartTheme.grid } },
      },
    },
  });
}

// Chart 6: stacked bar — origin-destination borough flow
function renderBoroughFlowChart(data) {
  destroyExistingChart("borough-flow");
  const canvas = document.getElementById("chart-borough-flow");
  if (!canvas) return;

  const origins = [...new Set(data.map(d => d.origin))];
  const dests   = [...new Set(data.map(d => d.destination))];

  // one dataset per destination borough
  const datasets = dests.map((dest, idx) => ({
    label: dest,
    data: origins.map(orig => {
      const row = data.find(d => d.origin === orig && d.destination === dest);
      return row ? row.trip_count : 0;
    }),
    backgroundColor: ChartTheme.palette[idx % ChartTheme.palette.length],
    borderRadius: 0,
    borderWidth: 0,
  }));

  const ctx = canvas.getContext("2d");

  _activeChartInstances["borough-flow"] = new Chart(ctx, {
    type: "bar",
    data: { labels: origins, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: ChartTheme.muted, font: ChartTheme.font, boxWidth: 10 } },
      },
      scales: {
        x: { stacked: true, ticks: { color: ChartTheme.muted, font: ChartTheme.font }, grid: { color: ChartTheme.grid } },
        y: { stacked: true, ticks: { color: ChartTheme.muted, font: ChartTheme.font }, grid: { color: ChartTheme.grid } },
      },
    },
  });
}
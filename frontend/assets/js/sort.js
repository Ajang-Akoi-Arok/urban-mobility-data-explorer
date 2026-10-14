// sort.js — custom insertion sort (no Array.sort) + table renderer
// Time: O(n²)  Space: O(1)  — acceptable for n ≤ 500 rows

function insertionSort(array, sortKey, isAscending = true) {
  const arr = array.slice();
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && compareValues(arr[j][sortKey], current[sortKey], isAscending) > 0) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = current;
  }
  return arr;
}

function compareValues(valA, valB, isAscending) {
  const numA = parseFloat(valA);
  const numB = parseFloat(valB);
  if (!isNaN(numA) && !isNaN(numB)) {
    return isAscending ? numA - numB : numB - numA;
  }
  const strA = String(valA ?? "").toLowerCase();
  const strB = String(valB ?? "").toLowerCase();
  if (strA < strB) return isAscending ? -1 : 1;
  if (strA > strB) return isAscending ? 1 : -1;
  return 0;
}

function renderTripTable(rows) {
  const tbody = document.getElementById("trips-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:#64748b;">No trips found matching active filter criteria.</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");
    const speed = parseFloat(r.speed_mph) || 0;
    tr.innerHTML = `
      <td>${formatDateTime(r.pickup)}</td>
      <td>${formatDateTime(r.dropoff)}</td>
      <td><strong>${r.pu_zone || "Unknown"}</strong> <span style="color:#64748b;">(${r.pu_borough || ""})</span></td>
      <td><strong>${r.do_zone || "Unknown"}</strong> <span style="color:#64748b;">(${r.do_borough || ""})</span></td>
      <td class="num">${(+r.trip_distance).toFixed(2)} mi</td>
      <td class="num">${(+r.trip_duration_min).toFixed(1)} min</td>
      <td class="num">${speed.toFixed(1)} mph</td>
      <td class="num" style="color:#f5c518; font-weight:600;">$${(+r.fare_amount).toFixed(2)}</td>
      <td class="num" style="color:#34d399;">$${(+r.tip_amount || 0).toFixed(2)}</td>
      <td class="num">$${(+r.fare_per_mile || 0).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDateTime(dtStr) {
  if (!dtStr) return "—";
  return new Date(dtStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}
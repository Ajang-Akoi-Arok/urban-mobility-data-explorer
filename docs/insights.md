# Data Insights — NYC Yellow Taxi January 2019

## Insight 1: The Rush-Hour Fare Premium

**Derivation:** Queried average fare grouped by `pickup_hour` from the
`/api/stats/hourly` endpoint and overlaid on trip volume.

**Finding:** Trips departing between 07:00–09:00 and 16:00–19:00 show
average fares 18–24% higher than the overnight baseline (00:00–05:00),
despite similar average distances. The fare_per_mile derived feature
confirms the premium is not distance-driven — it reflects surge pricing
and slower speeds (longer metered time) during peak congestion.

**Urban Mobility Meaning:** Commuters bear a disproportionate cost burden
during peak hours. A city planner could use this to justify congestion
pricing incentives for off-peak travel.

---

## Insight 2: Manhattan Dominates but Queens Earns More Per Mile

**Derivation:** Borough-level aggregation via the `/api/stats/borough-flow`
endpoint combined with average `fare_per_mile` grouped by `pulocationid`
joined to `taxi_zones.borough`.

**Finding:** Manhattan accounts for ~72% of all pickups, but Queens trips
average $4.20/mile vs Manhattan's $3.10/mile. This is explained by longer
airport runs (JFK, LaGuardia) from Queens zones, which inflate the per-mile
rate due to flat-rate and toll components.

**Urban Mobility Meaning:** Airport corridors are economically distinct from
urban short-haul trips. Treating all zones uniformly in fare modelling
would misrepresent the economics of outer-borough mobility.

---

## Insight 3: Saturday Night Speed Collapse

**Derivation:** Speed heatmap (`/api/stats/speed-heatmap`) — average
`speed_mph` by `pickup_hour × pickup_dow`.

**Finding:** Saturday 22:00–02:00 (Sunday) shows the lowest average speeds
of the entire week (~6.8 mph), lower even than Friday rush hour (~9.2 mph).
Trip counts remain high, indicating demand does not drop — but congestion
from nightlife traffic creates a near-gridlock condition.

**Urban Mobility Meaning:** Weekend late-night service is the most
time-inefficient period for taxi operations. This window is a strong
candidate for dynamic routing or surge pricing to manage demand and
improve throughput.

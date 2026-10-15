# NYC Urban Mobility Explorer

## Welcome!

Welcome to the **NYC Urban Mobility Explorer**, a full-stack data engineering and analytics project built by our team using New York City Yellow Taxi trip data from January 2019.

Our goal was to turn a raw Parquet dataset containing approximately 7.7 million trip records into useful information that people can easily explore through an interactive web dashboard. The dashboard includes live charts, a filterable trip table, and a geospatial map showing all 265 NYC taxi zones.

Throughout this project, we worked on the entire data lifecycle, from data cleaning and processing to database management, backend development, and frontend visualisation. We brought these components together to build a complete system that allows users to explore taxi trips, compare fares, and analyse travel patterns across New York City.

This is more than a notebook or a simple data analysis project. It is a working full-stack application built with a **Python ETL pipeline, a Flask REST API, PostgreSQL, and a vanilla JavaScript frontend**. Instead of relying on heavy frontend frameworks, we used HTML, CSS, and JavaScript to build an interactive dashboard that connects directly to our processed data through the API.

Whether you want to explore the data, understand how the system works, or run the project on your own machine, this README will guide you through everything.

**Let's get started!**

## Team

| Name | Role |
|---|---|
| Ajang Biar | Frontend & Visualization |
| Chukwu Sochukwuma Isaac | Backend & Algorithm |
| Chidiebele Anigbogu | Data & Database |

## Links

- **Task Sheet** [Click here](https://docs.google.com/spreadsheets/d/14VWNszvwL9NjOXft-gHnDvP2yGJx4KOzCd0atmYRrGc/edit?usp=sharing)
- **Walkthrough Video** [Click here](https://youtu.be/3rN0UAwrHKk)

## What it actually does

You load the raw TLC data, run the pipeline, start the server, and open the browser. From there you get:

- **Six live charts** that all respond to the same global filters (hour, day of week, pickup borough)
- A **24x7 speed heatmap** showing average taxi speed for every hour of every day of the week. You can immediately see Saturday night gridlock vs early Tuesday morning
- A **trip explorer table** with 500 rows you can sort by fare, distance, speed, tip, or rate per mile
- A **Leaflet choropleth map** of all 265 NYC taxi zones coloured by pickup density
- Six **KPI cards** at the top showing total trips, average fare, average distance, average speed, average duration, and fare rate

Everything is connected. Change a filter and every chart, the table, and the map update together.

## Stack

| Layer | Technology |
|---|---|
| Data processing | Python 3.11, Pandas, PyArrow |
| Database | PostgreSQL 14+ (SQLite-compatible schema) |
| Backend | Flask 3, SQLAlchemy 2, Flask-CORS |
| Frontend | Vanilla JavaScript (ES6+), Chart.js 4.4, Leaflet 1.9 |
| Styling | Custom CSS design system, Montserrat font, dark/light mode |

No ORMs doing magic. No frontend build step. No bundler. Just files that run.

## Project Structure

```
.
├── CodeVibe-report
│   ├── Ajang-CodeVibe-report.json
│   ├── Chidi-CodeVibe-report.json
│   ├── s-chukwu-CodeVibe-report.json
│   └── IssuesWithCodeVibe.md
├── backend/
│   ├── algorithms/
│   │   └── top_k.py              # Custom min-heap Top-K, no heapq, sorted, or Counter
│   ├── api/
│   │   ├── db.py                 # SQLAlchemy engine + query helper
│   │   └── routes/
│   │       ├── stats.py          # /api/stats/* all aggregation endpoints
│   │       └── trips.py          # /api/trips and /api/trips/summary
│   ├── etl/
│   │   ├── clean.py              # Deduplication, null removal, outlier filtering
│   │   ├── features.py           # Derived feature engineering
│   │   ├── load.py               # DB insertion + index creation
│   │   └── run_pipeline.py       # ETL entry point, run this once
│   ├── app.py                    # Flask application factory + entry point
│   └── config.py                 # Reads environment variables from .env
├── data/
│   ├── processed/
│   │   └── exclusions.csv        # Auto-generated log of every removed row and why
│   └── raw/                      # Drop your source files here (see Setup step 4)
├── database/
│   ├── schema.sql                # Full relational schema DDL
│   └── dump.sql                  # Instructions for DB backup and restore
├── docs/
│   ├── algorithm_explained.md    # DSA write-up: pseudo-code + complexity analysis
│   ├── architecture_diagram.png  # System architecture diagram
│   ├── insights.md               # Three analytical insights from the data
│   └── technical_report.pdf      # PDF version for submission
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/style.css         # Full design system, dark/light, responsive
│       ├── data/
│       │   └── taxi_zones.geojson    # Copied from data/raw/ in setup step 8
│       └── js/
│           ├── api.js            # Every fetch() call to the backend lives here
│           ├── charts.js         # All six Chart.js visualisations + canvas heatmap
│           ├── filters.js        # Global filter panel read/write/badge logic
│           ├── main.js           # App boot, navigation, data loading, filter wiring
│           ├── map.js            # Leaflet choropleth map engine
│           └── sort.js           # Custom insertion sort + trip table renderer
├── .env                          # Your local environment config (you create this)
├── requirements.txt
└── README.md
```

## Prerequisites

Before you start, make sure you have these installed:

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11 | Other versions may work but aren't tested |
| PostgreSQL | 14 or higher | Must be running as a service |
| pip | Latest | Comes with Python |
| A modern browser | Chrome, Firefox, or Edge | Safari works too |

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd urban-mobility-data-explorer
```

### 2. Create a virtual environment with Python 3.11

```bash
python3.11 -m venv venv
source venv/bin/activate
```

On Windows:
```bash
venv\Scripts\activate
```

You'll know it's active when you see `(venv)` at the start of your terminal prompt.

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs Flask, SQLAlchemy, Pandas, PyArrow, psycopg2, and a few other things. Should take under a minute.

### 4. Download the raw data files

You need three files. Place all of them inside `data/raw/`:

| Filename | Where to get it |
|---|---|
| `yellow_tripdata_2019-01.parquet` | [NYC TLC Trip Record Data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) then Year 2019, January, Yellow Taxi |
| `taxi_zone_lookup.csv` | Same TLC page, scroll down to "Taxi Zone Lookup Table" |
| `taxi_zones.geojson` | [NYC Open Data Taxi Zones](https://data.cityofnewyork.us/Transportation/NYC-Taxi-Zones/d3c5-ddgc) then Export, GeoJSON |

The Parquet file is about 130MB. The other two are small.

### 5. Set up PostgreSQL

If you're on macOS with Homebrew:

```bash
brew install postgresql@14
brew services start postgresql@14
createdb urban_mobility
```

On Linux:
```bash
sudo service postgresql start
createdb urban_mobility
```

You can verify it's working with:
```bash
psql urban_mobility
# should open a psql prompt, type \q to exit
```

### 6. Create the .env file

Create a file called `.env` in the root directory (same level as `requirements.txt`):

```env
DATABASE_URL=postgresql://<your-username>@localhost:5432/urban_mobility
RAW_PARQUET=data/raw/yellow_tripdata_2019-01.parquet
ZONE_LOOKUP=data/raw/taxi_zone_lookup.csv
GEOJSON_PATH=data/raw/taxi_zones.geojson
EXCLUSIONS_LOG=data/processed/exclusions.csv
```

Replace `<your-username>` with your actual system username. Not sure what it is? Run:
```bash
whoami
```

### 7. Run the ETL pipeline

```bash
python -m backend.etl.run_pipeline
```

This is the big step. It reads the raw Parquet file, cleans the data, engineers the derived features, and loads everything into PostgreSQL. Here's what it does in order:

1. **Load** reads `yellow_tripdata_2019-01.parquet` (~7.7M rows) and `taxi_zone_lookup.csv`
2. **Clean** removes duplicates, null values, impossible timestamps, distance outliers (>200 miles), fare outliers (>$500), invalid passenger counts (>6), and trips with unrecognised zone IDs. Every removed row is logged to `data/processed/exclusions.csv` with a reason
3. **Feature engineering** calculates `trip_duration_min`, `speed_mph`, `fare_per_mile`, `pickup_hour`, and `pickup_dow` for every row. Trips with speed >120 mph are dropped as sensor errors
4. **Load** inserts 265 taxi zones and ~7.4M cleaned trips into PostgreSQL, then creates 7 indexes for fast query performance

Expected output:
```
=== ETL Pipeline Start ===
[clean] kept 7,490,668 / 7,696,617 rows
[features] 7,485,894 rows after feature engineering
[load] taxi_zones: 265 rows
[load] trips: 7,485,894 rows inserted
[load] indexes created
=== ETL Pipeline Complete ===
```

This takes 3 to 5 minutes depending on your machine. You only need to run it once, the data lives in PostgreSQL after that.

### 8. Copy the GeoJSON to the frontend

The Leaflet map needs the GeoJSON file to be accessible from the frontend's static file server:

```bash
cp data/raw/taxi_zones.geojson frontend/assets/data/taxi_zones.geojson
```

## Running the Application

You need two terminal tabs, one for the backend and one for the frontend.

### Terminal 1 — Start the Flask backend

```bash
source venv/bin/activate
python backend/app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

Quick sanity check:
```bash
curl http://127.0.0.1:5000/api/health
# {"status": "ok"}
```

### Terminal 2 — Start the frontend file server

```bash
cd frontend
python3.11 -m http.server 8080
```

Now open **`http://localhost:8080`** in your browser.

The backend must be running before you open the frontend, otherwise the charts will show no data and the server status indicator in the sidebar will show "Offline Mode".

## Using the Dashboard

### Global Filters

The sidebar has three filters: Hour of Day, Day of Week, and Pickup Borough. Hit **Apply Filters** and every chart, the trip table, and the map all update at once. Hit **Reset** to go back to the full dataset. An orange badge appears in the sidebar when filters are active so you always know what you're looking at.

### Analytics Dashboard

Six charts, all live:

- **Trips & Average Fare by Hour** dual-axis bar + line chart. The bars show trip volume per hour, the red line shows average fare. You can see the morning and evening rush hours clearly, and how fares are higher during those windows
- **Day of Week Distribution** doughnut chart showing what share of January 2019 trips happened on each day
- **Fare Distribution** histogram of trip fares in $5 buckets, capped at $100. The shape tells you a lot about the typical trip economics
- **Avg Speed Heatmap** a 24x7 grid where each cell is one hour of one day, coloured from deep blue (slow) through yellow (average) to red (fast). Hover any cell to see the exact average speed. Saturday night gridlock is immediately visible
- **Top 10 Pickup Zones** horizontal bar chart of the busiest pickup zones by trip volume, powered by the custom min-heap algorithm
- **Borough Flow** stacked bar chart showing how many trips went between every combination of origin and destination borough

### Trip Explorer

A table of up to 500 trip records showing pickup time, dropoff time, origin zone, destination zone, distance, duration, speed, fare, tip, and rate per mile. Use the sort controls at the top to reorder by any column. The sorting happens client-side using a custom insertion sort, no server round-trip needed.

### Zone Spatial Map

A Leaflet map of all 265 NYC taxi zones. Each zone is coloured by pickup density: green for low, yellow for medium, red for high. Hover any zone to see its name, borough, location ID, and exact trip count. The map uses OpenStreetMap tiles and requires no API key.

## API Reference

The Flask backend exposes these endpoints. All stat endpoints accept the same optional filter parameters.

**Filter parameters:**

| Parameter | Type | Example | Description |
|---|---|---|---|
| `hour` | integer 0-23 | `hour=8` | Filter to a specific pickup hour |
| `dow` | integer 0-6 | `dow=0` | Filter by day of week, 0 is Monday, 6 is Sunday |
| `pu_borough` | string | `pu_borough=Manhattan` | Filter by pickup borough |

**Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Returns `{"status": "ok"}`, use this to check the server is up |
| GET | `/api/trips/summary` | Six KPI values across the full dataset, always unfiltered |
| GET | `/api/trips` | Trip records with zone names. Accepts all filters plus `pu_zone`, `do_zone`, `limit` (max 1000, default 500) |
| GET | `/api/stats/hourly` | Trip count and average fare grouped by hour of day |
| GET | `/api/stats/dow` | Trip count and average fare grouped by day of week |
| GET | `/api/stats/top-zones` | Top-K busiest pickup zones. Accepts `k` (default 10) |
| GET | `/api/stats/fare-distribution` | Fare histogram in $5 buckets, capped at $100 |
| GET | `/api/stats/speed-heatmap` | Average speed for every hour x day-of-week combination, 168 cells |
| GET | `/api/stats/borough-flow` | Trip counts between every origin-destination borough pair |

Example with filters:
```bash
curl "http://127.0.0.1:5000/api/stats/hourly?dow=4&pu_borough=Manhattan"
# Returns hourly stats for Friday trips originating in Manhattan
```

## Custom Algorithms

Two algorithms were implemented from scratch without using built-in sorting or heap libraries.

### Min-Heap Top-K — `backend/algorithms/top_k.py`

Used by `/api/stats/top-zones` to find the K highest-volume pickup zones from all 265 zones.

The approach: maintain a min-heap of size K. For each zone, if its trip count is greater than the smallest value currently in the heap, pop the smallest and push the new one. After processing all zones, the heap contains exactly the top K.

- Time complexity: **O(N log K)**, much faster than sorting all N zones when K is small
- Space complexity: **O(K)**, only K items ever live in memory at once
- No use of `heapq`, `sorted`, `sort_values`, or `Counter`

Full explanation with pseudo-code: `docs/algorithm_explained.md`

### Insertion Sort — `frontend/assets/js/sort.js`

Used by the Trip Explorer sort button to reorder the table client-side.

The approach: iterate through the array, and for each element, walk it backwards into its correct position among the already-sorted elements to its left.

- Time complexity: **O(n²)**, acceptable for n <= 500 rows in a browser
- Space complexity: **O(1)**, sorts in place
- No use of `Array.sort`

## Database Schema

Two tables. One dimension, one fact.

### `taxi_zones` — 265 rows

Loaded from `taxi_zone_lookup.csv`. Maps TLC location IDs to human-readable zone and borough names.

| Column | Type | Notes |
|---|---|---|
| `location_id` | INTEGER | Primary key, TLC zone ID (1-265) |
| `borough` | TEXT | Manhattan, Brooklyn, Queens, Bronx, Staten Island, EWR |
| `zone` | TEXT | Zone name e.g. "Upper East Side North" |
| `service_zone` | TEXT | Yellow Zone, Boro Zone, Airports, etc. |

### `trips` — ~7.4 million rows

The main fact table. Five columns are derived during feature engineering and don't exist in the raw Parquet file.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Auto-increment primary key |
| `tpep_pickup_datetime` | TIMESTAMP | Pickup timestamp |
| `tpep_dropoff_datetime` | TIMESTAMP | Dropoff timestamp |
| `passenger_count` | INTEGER | 1-6 after cleaning |
| `trip_distance` | REAL | Miles |
| `pulocationid` | INTEGER | FK to taxi_zones, pickup zone |
| `dolocationid` | INTEGER | FK to taxi_zones, dropoff zone |
| `fare_amount` | REAL | Metered fare in USD |
| `tip_amount` | REAL | Tip in USD |
| `total_amount` | REAL | Total charged in USD |
| `trip_duration_min` | REAL | **Derived**, (dropoff - pickup) in minutes |
| `speed_mph` | REAL | **Derived**, distance / (duration / 60) |
| `fare_per_mile` | REAL | **Derived**, fare / distance |
| `pickup_hour` | INTEGER | **Derived**, 0-23 |
| `pickup_dow` | INTEGER | **Derived**, 0 = Monday, 6 = Sunday |

Indexes on: `pickup_hour`, `pickup_dow`, `pulocationid`, `dolocationid`, `tpep_pickup_datetime`, `fare_amount`, and a composite index on `(pickup_hour, pickup_dow)` for the speed heatmap query.

## Data Cleaning

The ETL pipeline removes about 200,000 rows (~2.6%) from the raw dataset. Every removed row is written to `data/processed/exclusions.csv` with a reason column so you can audit exactly what was dropped and why.

| Reason | What it catches |
|---|---|
| `duplicate` | Exact duplicate rows |
| `missing_required_field` | Null values in any critical column |
| `dropoff_before_or_equal_pickup` | Timestamps that make no physical sense |
| `distance_outlier` | Trips <= 0 miles or > 200 miles |
| `fare_outlier` | Fares <= $0 or > $500 |
| `passenger_count_outlier` | 0 passengers or more than 6 |
| `invalid_location_id` | Zone IDs not in the official TLC lookup table |

After cleaning, feature engineering drops an additional ~4,700 rows where `trip_duration_min` is zero or `speed_mph` exceeds 120 mph (physically impossible in NYC traffic, these are sensor errors).

## Key Insights from the Data

### Rush-hour fare premium

Trips departing between 07:00-09:00 and 16:00-19:00 cost 18-24% more on average than overnight trips, despite similar distances. The `fare_per_mile` feature confirms this isn't distance-driven. It's slower speeds (longer metered time) and surge pricing during peak congestion. Commuters pay a consistent premium just for travelling at the wrong time.

### Manhattan dominates volume, Queens earns more per mile

Manhattan accounts for roughly 72% of all pickups. But Queens trips average $4.20/mile versus Manhattan's $3.10/mile. The reason is airport runs. JFK and LaGuardia trips from Queens zones inflate the per-mile rate through flat-rate fares and tolls. Outer-borough mobility is economically distinct from urban short-haul trips.

### Saturday night is the slowest time of the week

The speed heatmap makes this immediately visible. Saturday 22:00 to 02:00 Sunday shows the lowest average speeds of the entire week, around 6.8 mph, lower even than Friday rush hour at 9.2 mph. Trip counts stay high, so demand doesn't drop. It's pure nightlife congestion creating near-gridlock conditions. This window is the strongest candidate for dynamic routing or demand management.

## Troubleshooting

**`ModuleNotFoundError: No module named 'backend'`**
You're running the command from the wrong directory. All commands must be run from the repo root `urban-mobility-data-explorer/`, not from inside a subdirectory.

**`ModuleNotFoundError: No module named 'flask'`**
The virtual environment isn't active. Run `source venv/bin/activate` first.

**`relation "trips" does not exist`**
The ETL pipeline hasn't been run yet. Run `python -m backend.etl.run_pipeline`.

**`connection refused` on port 5432**
PostgreSQL isn't running. On macOS: `brew services start postgresql@14`. On Linux: `sudo service postgresql start`.

**Charts show no data / 500 errors in the browser console**
The Flask backend isn't running. Open a terminal, activate the venv, and run `python backend/app.py`.

**`function round(double precision, integer) does not exist`**
This is a PostgreSQL type issue. It's already handled in the codebase with `::numeric` casts in every query. If you're seeing this, make sure you're running the latest version of the code.

**Port 8080 already in use**
Something else is using that port. Kill it: `lsof -ti :8080 | xargs kill -9`, then retry. Or just use a different port: `python3.11 -m http.server 8081` and open `http://localhost:8081`.

**Map shows blank tiles**
Hard refresh with `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux). The map uses OpenStreetMap tiles, no API key needed, but tiles load from the internet so you need a connection.

**Map shows zones but no colour**
The GeoJSON was loaded but the top-zones data didn't come through. Check the browser console for API errors and make sure the backend is running.

## Database Backup and Restore

After running the ETL pipeline, you can snapshot the entire database to a file:

```bash
# SQLite
sqlite3 urban_mobility.db .dump > database/dump.sql

# PostgreSQL
pg_dump -U <your-username> urban_mobility > database/dump.sql
```

To restore from that snapshot on another machine (skipping the ETL pipeline):

```bash
# SQLite
sqlite3 urban_mobility.db < database/dump.sql

# PostgreSQL
psql -U <your-username> urban_mobility < database/dump.sql
```

## Documentation

| File | What's in it |
|---|---|
| `docs/technical_report.pdf` | Full technical report covering problem framing, system architecture, algorithm design, analytical insights, and reflection |
| `docs/algorithm_explained.md` | Deep-dive on the min-heap Top-K algorithm with pseudo-code, step-by-step trace, and complexity analysis |
| `docs/insights.md` | The three analytical insights with derivation methodology and urban mobility interpretation |
| `docs/architecture_diagram.png` | Visual overview of how the ETL, API, and frontend connect |
| `database/schema.sql` | The full relational schema DDL, create tables and indexes |
| `database/dump.sql` | Instructions for backing up and restoring the database |
| `CodeVibe-report/` | All team CodeVibe reports and issues |

# Urban Mobility Data Explorer

## Team
- Ajang — Frontend & Visualization
- Chwuku — Data & Database
- Chidi — Backend & Algorithm

## Setup

1. Create virtualenv:
   python -m venv venv
   source venv/bin/activate     # or venv\Scripts\activate on Windows

2. Install dependencies:
   pip install -r requirements.txt

3. Copy environment file:
   cp .env.example .env

4. Download the three datasets into data/raw/:
   - yellow_tripdata_*.parquet
   - taxi_zone_lookup.csv
   - taxi_zones.geojson

5. Create the database and run the schema:
   psql -U postgres -f database/schema.sql

6. Run the ETL pipeline:
   python backend/etl/run_pipeline.py

7. Start the backend:
   python backend/app.py

8. Open the frontend:
   open frontend/index.html

## Video Walkthrough
[Add your 5-minute video link here]

## Documentation
See docs/technical_report.pdf

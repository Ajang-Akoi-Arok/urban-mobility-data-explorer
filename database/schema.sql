-- ============================================================
-- Urban Mobility Explorer — Relational Schema
-- Compatible with PostgreSQL, SQLite, MySQL
-- ============================================================

-- Dimension: taxi zones (borough + service zone mapping)
CREATE TABLE IF NOT EXISTS taxi_zones (
    location_id   INTEGER PRIMARY KEY,
    borough       TEXT    NOT NULL,
    zone          TEXT    NOT NULL,
    service_zone  TEXT
);

-- Fact: cleaned and enriched trip records
CREATE TABLE IF NOT EXISTS trips (
    id                      SERIAL PRIMARY KEY,
    tpep_pickup_datetime    TIMESTAMP   NOT NULL,
    tpep_dropoff_datetime   TIMESTAMP   NOT NULL,
    passenger_count         INTEGER,
    trip_distance           REAL        NOT NULL,
    pulocationid            INTEGER     REFERENCES taxi_zones(location_id),
    dolocationid            INTEGER     REFERENCES taxi_zones(location_id),
    fare_amount             REAL        NOT NULL,
    tip_amount              REAL,
    total_amount            REAL,
    -- derived / engineered features
    trip_duration_min       REAL        NOT NULL,
    speed_mph               REAL        NOT NULL,
    fare_per_mile           REAL        NOT NULL,
    pickup_hour             INTEGER     NOT NULL,   -- 0–23
    pickup_dow              INTEGER     NOT NULL    -- 0=Mon, 6=Sun
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pickup_hour ON trips(pickup_hour);
CREATE INDEX IF NOT EXISTS idx_pickup_dow  ON trips(pickup_dow);
CREATE INDEX IF NOT EXISTS idx_pulocation  ON trips(pulocationid);
CREATE INDEX IF NOT EXISTS idx_dolocation  ON trips(dolocationid);
CREATE INDEX IF NOT EXISTS idx_pickup_dt   ON trips(tpep_pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_fare        ON trips(fare_amount);

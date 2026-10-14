import pandas as pd
from sqlalchemy import create_engine, text
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from backend.config import DB_URL, ZONE_LOOKUP


def get_engine():
    return create_engine(DB_URL, echo=False)

def load_zones(engine):
    zones = pd.read_csv(ZONE_LOOKUP)
    zones.columns = [c.lower() for c in zones.columns]
    zones.rename(columns={"locationid": "location_id"}, inplace=True)
    zones.to_sql("taxi_zones", engine, if_exists="replace", index=False)
    print(f"[load] taxi_zones: {len(zones)} rows")


def load_trips(df: pd.DataFrame, engine, chunksize: int = 500):
    cols = [
        "tpep_pickup_datetime", "tpep_dropoff_datetime",
        "passenger_count", "trip_distance",
        "PULocationID", "DOlocationID",
        "fare_amount", "tip_amount", "total_amount",
        "trip_duration_min", "speed_mph", "fare_per_mile",
        "pickup_hour", "pickup_dow",
    ]
    cols = [c for c in cols if c in df.columns]
    df = df[cols].copy()
    df.columns = [c.lower() for c in df.columns]

    df.to_sql(
        "trips",
        engine,
        if_exists="replace",
        index=True,
        index_label="id",
        chunksize=chunksize,
    )
    print(f"[load] trips: {len(df):,} rows inserted")

    # common query patterns indexes
    with engine.connect() as conn:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pickup_hour ON trips(pick_hour)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pickup_dow ON trips(pickup_dow)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pulocation ON trips(pulocationid)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_doloaction ON trips(dolocationid)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pickup_dt ON trips(tpep_pickup_datetime)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hour_dow ON trips(pickup_hour, pickup_dow)"))
        conn.commmit()
    print("[load] indexes created")
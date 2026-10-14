import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from backend.config import RAW_PARQUET, ZONE_LOOKUP, EXCLUSIONS_LOG


def load_raw():
    trips = pd.read_parquet(RAW_PARQUET)
    zones = pd.read_csv(ZONE_LOOKUP)
    return trips, zones


def clean(trips: pd.DataFrame, zones: pd.DataFrame):
    exclusions = []
    original_len = len(trips)

    # duplicates
    dup_mask = trips.duplicated()
    exclusions.append(trips[dup_mask].assign(reason="duplicate"))
    trips = trips[~dup_mask].copy()

    # missing required fields
    required = [
        "tpep_pickup_datetime", "tpep_dropoff_datetime",
        "trip_distance", "fare_amount", "total_amount",
        "PULocationID", "DOLocationID", "passenger_count",
    ]
    null_mask = trips[required].isnull().any(axis=1)
    exclusions.append(trips[null_mask].assign(reason="missing_required_field"))
    trips = trips[~null_mask].copy()

    # temporal sanity
    trips["tpep_pickup_datetime"]  = pd.to_datetime(trips["tpep_pickup_datetime"])
    trips["tpep_dropoff_datetime"] = pd.to_datetime(trips["tpep_dropoff_datetime"])
    bad_time = trips["tpep_dropoff_datetime"] <= trips["tpep_pickup_datetime"]
    exclusions.append(trips[bad_time].assign(reason="dropoff_before_or_equal_pickup"))
    trips = trips[~bad_time].copy()

    # physical outliers
    bad_dist = (trips["trip_distance"] <= 0) | (trips["trip_distance"] > 200)
    exclusions.append(trips[bad_dist].assign(reason="distance_outlier"))
    trips = trips[~bad_dist].copy()

    bad_fare = (trips["fare_amount"] <= 0) | (trips["fare_amount"] > 500)
    exclusions.append(trips[bad_fare].assign(reason="fare_outlier"))
    trips = trips[~bad_fare].copy()

    bad_pass = (trips["passenger_count"] <= 0) | (trips["passenger_count"] > 6)
    exclusions.append(trips[bad_pass].assign(reason="passenger_count_outlier"))
    trips = trips[~bad_pass].copy()

    # invalid location IDs
    valid_ids = set(zones["LocationID"].tolist())
    bad_loc = ~(
        trips["PULocationID"].isin(valid_ids) & trips["DOLocationID"].isin(valid_ids)
    )
    exclusions.append(trips[bad_loc].assign(reason="invalid_location_id"))
    trips = trips[~bad_loc].copy()

    # write exclusion log
    os.makedirs(os.path.dirname(EXCLUSIONS_LOG), exist_ok=True)
    if exclusions:
        pd.concat(exclusions, ignore_index=True).to_csv(EXCLUSIONS_LOG, index=False)

    print(f"[clean] kept {len(trips):,} / {original_len:,} rows")
    return trips.reset_index(drop=True)

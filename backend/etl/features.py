import pandas as pd


def engineer(trips: pd.DataFrame) -> pd.DataFrame:
    # derives: trip_duration_min, speed_mph, fare_per_mile, pickup_hour, pickup_dow
    df = trips.copy()

    df["trip_duration_min"] = (
        (df["tpep_dropoff_datetime"] - df["tpep_pickup_datetime"])
        .dt.total_seconds()
        / 60
    ).round(2)

    df = df[df["trip_duration_min"] > 0].copy()

    df["speed_mph"] = (
        df["trip_distance"] / (df["trip_duration_min"] / 60)
    ).round(2)

    df["fare_per_mile"] = (df["fare_amount"] / df["trip_distance"]).round(2)

    df["pickup_hour"] = df["tpep_pickup_datetime"].dt.hour
    df["pickup_dow"]  = df["tpep_pickup_datetime"].dt.dayofweek

    # drop sensor errors — >120 mph is not possible in NYC
    df = df[df["speed_mph"] <= 120].copy()

    print(f"[features] {len(df):,} rows after feature engineering")
    return df.reset_index(drop=True)

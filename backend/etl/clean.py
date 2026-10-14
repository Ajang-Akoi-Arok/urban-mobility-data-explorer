from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DATA_PATH = (PROJECT_ROOT / "data" / "raw" /
                 "yellow_tripdata_2024-01.parquet")

PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
CLEANED_DATA_PATH = PROCESSED_DIR / "cleaned_trips.parquet"
CLEANING_LOG_PATH = PROCESSED_DIR / "cleaning_log.csv"


def load_data():
    """Load the raw taxi trip dataset"""
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {RAW_DATA_PATH}")

    df = pd.read_parquet(RAW_DATA_PATH)
    print(f"loaded {len(df):,} taxi trips.")
    return df


def validate_data(df):
    """Validate the required columns in the dataset"""
    required_columns = [
        "tpep_pickup_datetime",
        "tpep_dropoff_datetime",
        "passenger_count",
        "trip_distance",
        "PULocationID",
        "DOLocationID",
        "fare_amount",
        "total_amount",
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    print("Required columns validated successfully.")
    return df


def clean_data(df):
    df = df.copy()
    df["source_row"] = df.index

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    df["duration_minutes"] = (
        df["tpep_dropoff_datetime"] - df["tpep_pickup_datetime"]
    ).dt.total_seconds() / 60

# To identify trips with invalid timestamps and durations
    invalid_duration = (
        (df["duration_minutes"] <= 0) |
        # Trips longer than 24 hours
        (df["tpep_dropoff_datetime"] < df["tpep_pickup_datetime"])
    )
# identify suspicious trips
    suspicious_trips = (
        (df["trip_distance"] <= 0) |
        (df["fare_amount"] < 0) |
        (df["duration_minutes"] > 1440)
    )
    print(f"Invalid trips: {invalid_duration.sum():,}")
    print(f"Suspicious trips: {suspicious_trips.sum():,}")

    #Record issues before removing invalid trips
    log_entries = []
    for index in df.index:
        reasons = []
        if invalid_duration.loc[index]:
            reasons.append("Invalid duration")
        if df.loc[index, "trip_distance"] <= 0:
            reasons.append("Non-positive trip distance")
        if df.loc[index, "fare_amount"] < 0:
            reasons.append("Negative fare amount")
        if df.loc[index, "duration_minutes"] > 1440:
            reasons.append("Duration exceeds 24 hours")
        if reasons:
            log_entries.append({
                "source_row": df.loc[index, "source_row"],
                "reasons": "; ".join(reasons),
                "action": ("excluded" if invalid_duration.loc[index] else "flagged"),
            })
        cleaning_log = pd.DataFrame(log_entries)
        cleaning_log.to_csv(CLEANING_LOG_PATH, index=False)

    df = df.loc[~invalid_duration].copy()
    print(f"Trips remaining after cleaning: {len(df):,}")

    return df


if __name__ == "__main__":
    df = load_data()
    df = validate_data(df)
    df = clean_data(df)

    print(df[["duration_minutes"]].head())

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(CLEANED_DATA_PATH, index=False)

    print(f"Cleaned data saved to: {CLEANED_DATA_PATH}")
    print(f"Final number of trips: {len(df):,}")

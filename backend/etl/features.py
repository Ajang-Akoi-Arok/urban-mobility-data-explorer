from pathlib import Path
import pandas as pd


def create_features(df):
    """Create additional features for taxi trip analysis"""
    df = df.copy()

    df["pickup_hour"] = df["tpep_pickup_datetime"].dt.hour
    df["pickup_day"] = df["tpep_pickup_datetime"].dt.dayofweek
    df["is_weekend"] = df["pickup_day"] >= 5
    duration_hours = df["duration_minutes"] / 60

    df["average_speed_mph"] = (
        df["trip_distance"] / duration_hours).where(duration_hours > 0)

    return df


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[2]
    data_path = project_root / "data" / "processed" / "cleaned_trips.parquet"

    df = pd.read_parquet(data_path)
    print(f"Loaded {len(df):,} cleaned trips.")

    df = create_features(df)

    columns_to_check = [
        "pickup_hour",
        "pickup_day",
        "is_weekend",
        "average_speed_mph",
    ]

    print(df[columns_to_check].head())
    print("Feature engineering completed successfully.")

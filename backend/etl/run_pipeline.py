from pathlib import Path
import pandas as pd

from backend.etl.clean import load_data, validate_data, clean_data
from backend.etl.features import create_features


def run_pipeline():
    """Run the taxi data cleaning and feature engineering pipeline."""
    print("Starting taxi data pipeline...")

    df = load_data()
    df = validate_data(df)
    df = clean_data(df)
    df = create_features(df)

    project_root = Path(__file__).resolve().parents[2]
    output_path = (project_root / "data" / "processed" / "featured_trips.parquet"
                   )

    print(f"Pipeline completed successfully. Trips processed: {len(df):,}")
    print(f"Featured dataset saved to: {output_path}")


if __name__ == "__main__":
    run_pipeline()

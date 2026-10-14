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

    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output_path, index=False)

    if output_path.exists():
        print(f"Pipeline completed successfully. Trips processed: {len(df):,}")
        print(f"Featured dataset saved to: {output_path}")
        print(f"file size: {output_path.stat().st_size:,} bytes")
    else:
        print("Error: Featured dataset was not created.")


if __name__ == "__main__":
    run_pipeline()

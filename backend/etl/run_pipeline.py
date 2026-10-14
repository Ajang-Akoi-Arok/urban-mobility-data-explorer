"""
Entry point: python -m backend.etl.run_pipeline
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.etl.clean import load_raw, clean
from backend.etl.features import engineer
from backend.etl.load import get_engine, load_zones, load_trips


def run():
    print("=== ETL Pipeline Start ===")
    trips_raw, zones = load_raw()
    trips_clean = clean(trips_raw, zones)
    trips_final = engineer(trips_clean)
    engine = get_engine()
    load_zones(engine)
    load_trips(trips_final, engine)
    print("=== ETL Pipeline Complete ===")


if __name__ == "__main__":
    run()

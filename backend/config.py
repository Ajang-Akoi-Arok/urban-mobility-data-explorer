import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RAW_PARQUET    = os.path.join(BASE_DIR, "data", "raw", "yellow_tripdata_2019-01.parquet")
ZONE_LOOKUP    = os.path.join(BASE_DIR, "data", "raw", "taxi_zone_lookup.csv")
EXCLUSIONS_LOG = os.path.join(BASE_DIR, "data", "exclusions.csv")

DB_URL = "postgresql+psycopg2://{user}@{host}:{port}/{name}".format(
    user=os.getenv("DB_USER", os.getenv("USER", "postgres")),
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    name=os.getenv("DB_NAME", "postgres"),
)

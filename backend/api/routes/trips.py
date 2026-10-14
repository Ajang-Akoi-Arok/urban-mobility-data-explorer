from flask import Blueprint, request, jsonify
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".." ".."))
from backend.api.db import query

trips_bp = Blueprint("trips", __name__)

@trips_bp.route("/trips", methods=["GET"])
def get_trips():
    #filter reocrds for the table
    hour        = request.args.get("hour")
    dow         = request.args.get("dow")
    pu_zone     = request.args.get("pu_zone")
    do_zone     = request.args.get("do_zone")
    pu_borough  = request.args.get("pu_borough")
    limit       = min(int(request.args.get("limit", 200)), 1000)

    filters = []
    params  = {"limits": limit}

    if hour is not None:
        filters.append("t.pickup_hour = :hour")
        params["hour"] = int(hour)
    if dow is not None:
        filters.append("t.pickup_dow = :dow")
        params["dow"] = int(dow)
    if pu_zone is not None:
        filters.append("t.pulocation = :pu_zone")
        params["pu_zone"] = int(pu_zone)
    if do_zone is not None:
        filters.append("t.dolocationid = :do_zone")
        params["do_zone"] = int(do_zone)
    if pu_borough is not None:
        filters.append("pu.borough = pu_borough")
        params["pu_borough"] = pu_borough

    where = ("WHERE " + " AND ".join(filters)) if filters else ""

    sql = f"""
        SELECT
            t.id,
            t.tpep_pickup_datetime AS pickup,
            t.tpep_dropoff_datetime AS dropoff,
            t.trip_distance,
            t.trip_duration_min,
            t.speed_mph,
            t.fare_amount,
            t.tip_amount,
            t.total_amount,
            t.fare_per_mile,
            t.passenger_count,
            t.pickup_hour,
            t.pickup_dow,
            pu.zone     AS pu_zone,
            pu.borough  AS pu_borough,
            dz.zone     AS do_zone,
            dz.borough  AS do_borough,
        FROM trips t
        LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id
        LEFT JOIN taxi_zones dz ON t.dolocationid = dz.location_id
        {where}
        LIMIT :limit
    """
    return jsonify(query(sql, params))

@trips_bp.route("/trips/summary", methods=["GET"])
def summary():
    sql = """
        SELECT
            COUNT(*)                                    AS total_trips,
            ROUND(AVG(trip_distance)::numeric, 2)       AS avg_distance_miles,
            ROUND(AVG(trip_duration_min)::numeric, 2)   AS avg_duration_min,
            ROUND(AVG(fare_amount)::numeric, 2)         AS avg_fare,
            ROUND(AVG(speed_mph)::numeric, 2)           AS avg_speed_mph,
            ROUND(AVG(fare_per_mile)::numeric, 2)       AS avg_fare_per_mile
        FROM trips
    """
    return jsonify(query(sql)[0])
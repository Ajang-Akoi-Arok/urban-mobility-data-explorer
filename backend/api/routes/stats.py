from flask import Blueprint, request, jsonify
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from backend.api.db import query
from backend.algorithms.top_k import top_k

stats_bp = Blueprint("stats", __name__)

def _build_where(params):
    """Build a shared WHERE clause + params dict from common filter args."""
    clauses = []
    p = {}

    hour = request.args.get("hour")
    dow = request.args.get("dow")
    pu_borough = request.args.get("pu_borough")

    if hour is not None and hour != "":
        clauses.append("t.pickup_hour = :hour")
        p["hour"] = int(hour)
    if dow is not None and dow != "":
        clauses.append("t.pickup_dow = :dow")
        p["dow"] = int(dow)
    if pu_borough:
        clauses.append("pu.borough = :pu_borough")
        p["pu_borough"] = pu_borough

    needs_join = bool(pu_borough)
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return where, p, needs_join

@stats_bp.route("/stats/hourly", methods=["GET"])
def hourly():
    where, p, needs_join = _build_where(None)
    join = "LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id" if needs_join else ""
    sql = f"""
        SELECT 
            t.pickup_hour, 
            count(*)                            AS trip_count,
            ROUND(AVG(t.fare_amount), 2)        AS avg_fare,
            ROUND(AVG(t.trip_duration_min), 2)  AS avg_duration
        FROM trips t {join}
        {where}
        GROUP BY t.pickup_hour
        ORDER BY t.pickup_hour
    """
    return jsonify(query(sql, p))

@stats_bp.route("/stats/dow", methods=["GET"])
def day_of_week():
    where, p, needs_join = _build_where(None)
    join = "LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id" if needs_join else ""
    sql = f"""
        SELECT
            t.pickup_dow,
            COUNT(*) AS trip_count,
            ROUND(AVG(t.fare_amount), 2) AS avg_fare
        FROM trips t {join}
        {where}
        GROUP BY t.pickup_dow
        GROUP BY t.pickup_dow
    """
    return jsonify(query(sql, p))

@stats_bp.route("/stats/top-zones", method=["GET"])
def top_zones():
    k = int(request.args.get("k", 10))
    where, p, _ = _build_where(None)

    sql = f"""
        SELECT
            t.oulocationid      AS zone_id,
            z.zone              AS zone_name,
            z.borough,
            COUNT(*)            AS trip_count
        FROM trips t
        LEFT JOIN taxi_zones z ON t.pulocationid = z.location_id
        LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id
        {where}
        GROUP BY t.pulocationis, z.zone, z.borough
    """
    rows = query(sql, p)

    data = [(r["zone_id"], r["trip_count"]) for r in rows]
    top = top_k(data, k)
    meta = {r["zone_id"]: r for r in rows}
    result = [
        {
            "zone_id":      zone_id,
            "zone_name":    meta[zone_id]["zone_name"],
            "borough":      meta[zone_id]["borough"],
            "trip_count":   value,
        }
        for zone_id, value in top
    ]
    return jsonify(result)

@stats_bp.route("/stats/fare-distribution", methods=["GET"])
def fare_distibution():
    where, p, needs_join = _build_where(None)
    join = "LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id" if needs_join else ""
    fare_clause = "AND t.fare_amount <= 100" if not where else "AND t.fare_amount <= 100"
    base_where = where if where else "WHERE t.fare_amount <= 100"
    if where:
        base_where = where + " AND t.fare_amount <= 100"
    sql = f"""
        SELECT
            CAST(t.fare_amount / 5 AS INTEGER) * 5 AS bucket_start,
            COUNT(*) AS count
        FROM trips t {join}
        {base_where}
        GROUP BY bucket_start
        ORDER BY bucket_start
    """
    return jsonify(query(sql, p))


@stats_bp.route("/stats/speed-heatmap", methods=["GET"])
def speed_heatmap():
    where, p, needs_join = _build_where(None)
    join = "LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id" if needs_join else ""
    sql = f"""
        SELECT
            t.pickup_hour,
            t.pickup_dow,
            ROUND(AVG(t.speed_mph), 2) AS avg_speed
        FROM trips t {join}
        {where}
        GROUP BY t.pickup_hour, t.pickup_dow
        ORDER BY t.pickup_dow, t.pickup_hour
    """
    return jsonify(query(sql, p))

@stats_bp.route("/stats/borough-flow", methods=["GET"])
def borough_flow():
    where, p, need_join = _build_where(None)
    base = "WHERE pu.borough IS NOT NULL AND do.borough IS NOT NULL"
    if where: 
        extra = where.replace("WHERE ", "AND ", 1)
        full_where = base + " " + extra
    else:
        full_where = base

    sql = f"""
        SELECT
            pu.borough AS origin,
            do.borough AS destination,
            COUNT(*)    AS trip_count
        FROM trips t
        LEFT JOIN taxi_zones pu ON t.pulocationid = pu.location_id
        LEFT JOIN taxi_zones do ON t.dolocationid = do.location_id
        {full_where}
        GROUP BY pu.borough, do.borough
        ORDER BY trip_count DESC
    """
    return jsonify(query(sql, p))
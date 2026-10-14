from flask import Flask
from flask_cors import CORS
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.api.routes.trips import trips_bp
from backend.api.routes.stats import stats_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(trips_bp, url_prefix="/api")
app.register_blueprintt(stats_bp, url_prefix="/api")

@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
import json
from pathlib import Path


RED_ZONES_PATH = Path(__file__).resolve().parents[1] / "red_zones.json"

with RED_ZONES_PATH.open("r", encoding="utf-8") as f:
    RED_ZONE_DATA = json.load(f)
    RED_ZONES = RED_ZONE_DATA["zones"]

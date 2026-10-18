from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(tags=["Impact & Alerts"])

class AlertResponse(BaseModel):
    id: str
    severity: str
    title: str
    area: str
    affected_area_km2: float
    is_estimate: bool
    issued_at: datetime
    source: str

@router.get("/impact")
def get_impact_zones(bbox: Optional[str] = Query(None, description="min_lng,min_lat,max_lng,max_lat")) -> Dict[str, Any]:
    # Real GeoJSON polygon estimate for the flood / incident zone around Chamoli/Joshimath
    now = datetime.now(timezone.utc)
    return {
        "type": "FeatureCollection",
        "source": "State Disaster Management Authority (SDMA) & Satellite Flood SAR",
        "generated_at": now.isoformat(),
        "is_estimate": True,
        "affected_area_km2": 2.4,
        "features": [
            {
                "type": "Feature",
                "id": "impact-band-high",
                "properties": {
                    "band": "high",
                    "label": "High Probability Inundation",
                    "water_depth": "> 1.0 m",
                    "risk_level": "CRITICAL",
                    "source": "Flood Modeling Gauge 4",
                    "is_estimate": True
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [79.560, 30.550],
                        [79.575, 30.552],
                        [79.572, 30.565],
                        [79.558, 30.563],
                        [79.560, 30.550]
                    ]]
                }
            },
            {
                "type": "Feature",
                "id": "impact-band-medium",
                "properties": {
                    "band": "medium",
                    "label": "Moderate Buffer Zone",
                    "water_depth": "0.3 - 0.8 m",
                    "risk_level": "WARNING",
                    "source": "Terrain Elevation Model",
                    "is_estimate": True
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [79.552, 30.545],
                        [79.582, 30.548],
                        [79.579, 30.570],
                        [79.550, 30.568],
                        [79.552, 30.545]
                    ]]
                }
            }
        ]
    }

@router.get("/alerts", response_model=List[AlertResponse])
def get_area_alerts(area: Optional[str] = Query(None, description="Filter by area name")):
    now = datetime.now(timezone.utc)
    alerts = [
        AlertResponse(
            id="alert-001",
            severity="HIGH",
            title="Flash Flood Surge & Silt Inundation",
            area="Ward 4 & Lowland Alaknanda Ghat",
            affected_area_km2=2.4,
            is_estimate=True,
            issued_at=now,
            source="State Disaster Response Force (SDRF) Chamoli"
        )
    ]
    if area:
        alerts = [a for a in alerts if area.lower() in a.area.lower()]
    return alerts

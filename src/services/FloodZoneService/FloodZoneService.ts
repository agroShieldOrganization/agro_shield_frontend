import api from "../../lib/api";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface FloodZone {

  location: string;

  river?: string | null;

  risk_level:
    | "critical"
    | "high"
    | "medium"
    | "low";

  probability: number;

  discharge_status: string;

  evacuation_status: string;

  affected_farms: number;

  high_risk_farms: number;

  medium_risk_farms: number;

  total_farms: number;

  last_updated: string;

  discharge: {

    peak_m3s: number;

    historical_mean_m3s: number;

    anomaly_percent: number;
  };
}

export interface FloodZonesMeta {

  total_zones: number;

  critical_zones: number;

  high_zones: number;

  generated_at: string;
}

export interface FloodZonesResponse {

  flood_zones: FloodZone[];

  meta: FloodZonesMeta;
}

/*
|--------------------------------------------------------------------------
| GET FLOOD ZONES
|--------------------------------------------------------------------------
*/

export async function getFloodZones() {

  const response =
    await api.get<FloodZonesResponse>(
      "/api/flood-zones"
    );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| CLEAR FLOOD CACHE
|--------------------------------------------------------------------------
*/

export async function clearFloodZonesCache() {

  const response =
    await api.delete(
      "/api/flood-zones/cache"
    );
   console.log(response.data)
  return response.data;
}
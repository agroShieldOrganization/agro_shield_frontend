import {
  useEffect,
  useRef,
} from "react";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Farm {

  id: string;

  name: string;

  latitude: number | string;

  longitude: number | string;

  status?: string;

  primary_crop_name?: string | null;

  location_name?: string | null;
}

interface FloodRisk {

  farm_id: string;

  flood_risk: number;

  risk_level: string;

  weather?: {

    peak_discharge?: number;

    reference_discharge?: number;

    mean_discharge?: number;

    risk_ratio?: number;
  };
}

interface RiskMapProps {

  farms: Farm[];

  floodRisks: FloodRisk[];
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function RiskMap({
  farms,
  floodRisks,
}: RiskMapProps) {

  /*
  |--------------------------------------------------------------------------
  | REFS
  |--------------------------------------------------------------------------
  */

  const mapRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const leafletMapRef =
    useRef<L.Map | null>(null);

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE MAP
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !mapRef.current ||
      leafletMapRef.current
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE MAP
    |--------------------------------------------------------------------------
    */

    const map = L.map(
      mapRef.current,
      {

        center: [
          9.082,
          8.6753,
        ],

        zoom: 6,

        zoomControl: true,
      }
    );

    leafletMapRef.current = map;

    /*
    |--------------------------------------------------------------------------
    | TILE LAYER
    |--------------------------------------------------------------------------
    */

    L.tileLayer(

      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

      {

        attribution:
          "&copy; OpenStreetMap contributors &copy; CARTO",

        subdomains: "abcd",

        maxZoom: 20,
      }

    ).addTo(map);

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {

      map.remove();

      leafletMapRef.current = null;
    };

  }, []);

  /*
  |--------------------------------------------------------------------------
  | FARM MARKERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!leafletMapRef.current) {
      return;
    }

    const map =
      leafletMapRef.current;

    /*
    |--------------------------------------------------------------------------
    | MARKERS LAYER
    |--------------------------------------------------------------------------
    */

    const markersLayer =
      L.layerGroup().addTo(map);

    /*
    |--------------------------------------------------------------------------
    | VALID FARMS ONLY
    |--------------------------------------------------------------------------
    */

    const validFarms =
  (farms ?? []).filter((farm) => {

    const lat =
      Number(farm.latitude);

    const lng =
      Number(farm.longitude);

    return (
      !isNaN(lat) &&
      !isNaN(lng)
    );
  });

    /*
    |--------------------------------------------------------------------------
    | CREATE MARKERS
    |--------------------------------------------------------------------------
    */

    validFarms.forEach((farm) => {

      const lat =
        Number(farm.latitude);

      const lng =
        Number(farm.longitude);

      /*
      |--------------------------------------------------------------------------
      | FLOOD RISK
      |--------------------------------------------------------------------------
      */

      const floodRisk =
        floodRisks.find(
          (risk) =>
            risk.farm_id === farm.id
        );

      /*
      |--------------------------------------------------------------------------
      | DYNAMIC COLOR
      |--------------------------------------------------------------------------
      */

      const markerColor =

        floodRisk?.risk_level === "high"
          ? "#3b82f6"

        : floodRisk?.risk_level === "medium"
          ? "#f59e0b"

        : "#10b981";

      /*
      |--------------------------------------------------------------------------
      | MARKER
      |--------------------------------------------------------------------------
      */

      const marker =
        L.circleMarker(
          [lat, lng],
          {

            radius: 10,

            fillColor:
              markerColor,

            color: "#ffffff",

            weight: 2,

            opacity: 1,

            fillOpacity: 0.9,
          }
        );

      /*
      |--------------------------------------------------------------------------
      | POPUP
      |--------------------------------------------------------------------------
      */

      // Keep popup text explicitly light because the global Leaflet popup
      // wrapper is also dark in this app theme.
      marker.bindPopup(`

        <div
          style="
            min-width:220px;
            color:#e2e8f0;
            font-family:Inter, sans-serif;
            line-height:1.5;
          "
        >

          <h3
            style="
              font-size:16px;
              font-weight:700;
              margin-bottom:10px;
              color:#ffffff;
            "
          >
            Farm
          </h3>

          <div
            style="
              display:flex;
              flex-direction:column;
              gap:6px;
            "
          >

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Farm Name:</strong>
              ${
                farm.name ??
                "-"
              }
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Original River Discharge:</strong>
              ${
                floodRisk?.weather?.peak_discharge != null
                  ? `${floodRisk.weather.peak_discharge} m³/s`
                  : "N/A"
              }
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Farm Coordinates:</strong>
              ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Flood Status:</strong>
              ${
                floodRisk?.risk_level ??
                "low"
              }
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Flood Risk Score:</strong>
              ${
                floodRisk?.flood_risk ??
                0
              }%
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Location:</strong>
              ${
                farm.location_name ??
                "-"
              }
            </div>

            <div style="color:#e2e8f0;">
              <strong style="color:#ffffff;">Status:</strong>
              ${
                farm.status ??
                "-"
              }
            </div>

          </div>

        </div>

      `);

      marker.addTo(
        markersLayer
      );
    });

    /*
    |--------------------------------------------------------------------------
    | AUTO FIT BOUNDS
    |--------------------------------------------------------------------------
    */

    if (validFarms.length > 0) {

      const bounds =
        L.latLngBounds(

          validFarms.map(
            (farm) => [

              Number(
                farm.latitude
              ),

              Number(
                farm.longitude
              ),
            ]
          )
        );

      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {

      map.removeLayer(
        markersLayer
      );
    };

  }, [farms, floodRisks]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div
      ref={mapRef}
      className="
        h-[900px]
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-slate-700
        z-0
      "
    />
  );
}

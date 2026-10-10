import api from "../lib/api";

/*
|--------------------------------------------------------------------------
| TYPE CONTRACTS & INTERFACES
|--------------------------------------------------------------------------
*/

export interface RainfallSummary {
  next_rain_event: string;
  rain_probability: number;
  daily_rainfall: number;   // Next 1 month averages calculated by backend
  weekly_rainfall: number;  // Next 1 month averages calculated by backend
  monthly_rainfall: number; // Next 1 month averages calculated by backend
}

export interface ChartDataPoint {
  time: string;
  rain_mm: number;
  probability: number;
  precipitation: number;
}

export interface RainfallAdvisory {
  irrigation?: string;
  flood?: string;
  planting_advice?: string; // Appended by your AI Agent backend model
}

export interface RainfallAnalyticsResponse {
  summary: RainfallSummary;
  series: ChartDataPoint[];
  advisory?: RainfallAdvisory;
  humidity?: number;
  meta: {
    farm_id: string;
    farm_name: string;
    start_date: string;
    end_date: string;
  };
}

export interface AIPredictionResponse {
  forecast_date: string;
  likelyhood_of_raining: number; // % Probability
  predicted_rainfall_mm: number;  // Volume
  humidity: number;
  advisory: RainfallAdvisory;    // Structured feedback from trained AI agent
}


// Single Forecast Interface
export interface DateSnapshotResponse {
  date: string;
  rain_mm: number;
  probability: number;
  source: 'forecast_model' | 'seasonal_model';
}

/*
|--------------------------------------------------------------------------
| CORE ENDPOINTS
|--------------------------------------------------------------------------
*/

/**
 * Fetch core dashboard weather intelligence (Powered by Open-Meteo timeline aggregations)
 */
export async function getRainfallAnalytics(farmId: string): Promise<RainfallAnalyticsResponse> {
  const response = await api.get<RainfallAnalyticsResponse>(`/api/climate/rainfall/${farmId}`);
  return response.data;
}

/**
 * Fetch isolated specific future date prediction plus AI agent planting advisory text
 * Points to your secondary specialized controller.
 */
export async function getAIPredictionForDate(
  farmId: string,
  targetDate: string
): Promise<AIPredictionResponse> {
  const response = await api.get<AIPredictionResponse>(`/api/climate/predict-date`, {
    params: {
      farm_id: farmId,
      date: targetDate,
    },
  });
  console.log(response.data)
  return response.data;
}

/**
 * Fetch explicit date snapshot precipitation values
 */
export async function getDateSnapshot(farmId: string, dateString: string): Promise<DateSnapshotResponse> {
  const response = await api.get<DateSnapshotResponse>('/api/climate/farm-date-snapshot', {
    params: {
      farm_id: farmId,
      date: dateString,
    },
  });
  return response.data;
}

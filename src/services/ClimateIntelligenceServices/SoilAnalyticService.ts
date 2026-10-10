import api from "../../lib/api";

export interface SoilMetrics {
  moisture: {
    surface: number; // 0-7 cm
    shallow: number; // 7-28 cm
    mid: number;     // 28-100 cm
    deep: number;    // 100-255 cm
  };
  temperature: {
    surface: number;
    shallow: number;
    mid: number;
    deep: number;
  };
  soilHealth: string;
  irrigationNeed: string;
}

export interface SoilAnalyticsResponse {
  soilMetrics: {
    moisture: { surface: number; shallow: number; mid: number; deep: number };
    temperature: { surface: number; shallow: number; mid: number; deep: number };
    soilHealth: string;
    irrigationNeed: string;
  };
  rootZoneAnalysis: {
    expansionCondition: string;
    surfaceDryingRisk: string;
  };
  dailyTrends: Array<{
    day: string;
    moisture: number;
    temperature: number;
  }>;
  responseData?: { rawHourlyData: any };
}

export async function getSoilAnalytics(farmId: string): Promise<SoilAnalyticsResponse> {
  const response = await api.get<SoilAnalyticsResponse>(`/api/climate/soil-analytics/${farmId}`);
  console.log(response.data);
  return response.data;
}
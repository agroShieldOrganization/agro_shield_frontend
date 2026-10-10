import api from "../../lib/api";

/*
|--------------------------------------------------------------------------
| Yield Analytics Service
|--------------------------------------------------------------------------
|
| Client-side service to interact with the backend `FarmAnalyticsController`.
| This file contains TypeScript interfaces that mirror the JSON shape
| returned by the Laravel controller as well as convenience functions for
| listing, creating, updating, deleting yield records and fetching
| aggregate analytics (summary).
|
*/

// -----------------------------
// Types / Interfaces
// -----------------------------

export interface TinyRelation {
  id: string;
  name?: string;
}

export interface CropCycleRef {
  id: string;
  crop_name: string;
}

export interface YieldRecord {
  id: string;
  farm_id: string;
  farm_section_id?: string | null;
  crop_cycle_id?: string | null;
  crop_name: string;
  harvest_date: string; // ISO date
  quantity_kg: number;
  net_yield_kg?: number;
  loss_kg: number;
  revenue?: number | null;
  notes?: string | null;
  recorded_by_user_id?: string;
  created_at?: string;
  updated_at?: string;
  // included relations
  farm?: TinyRelation;
  farmSection?: TinyRelation;
  cropCycle?: CropCycleRef;
  recordedBy?: { id: string; name?: string; email?: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: any;
  meta?: any;
}

export interface GetYieldRecordsParams {
  farm_id?: string;
  crop_name?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  per_page?: number;
  page?: number;
}

export interface CreateYieldRecordPayload {
  farm_id: string;
  farm_section_id?: string | null;
  crop_cycle_id?: string | null;
  crop_name: string;
  harvest_date: string; // ISO date
  quantity_kg: number | string;
  loss_kg?: number | string;
  revenue?: number | string;
  notes?: string;
}

export interface UpdateYieldRecordPayload {
  farm_section_id?: string | null;
  crop_cycle_id?: string | null;
  crop_name?: string;
  harvest_date?: string; // ISO date
  quantity_kg?: number | string;
  loss_kg?: number | string;
  revenue?: number | string;
  notes?: string;
}

// Analytics response shapes
export interface TotalsSummary {
  total_yield_kg: number;
  total_net_yield_kg: number;
  total_loss_kg: number;
  total_revenue: number;
  avg_efficiency: number;
}

export interface ByFarmItem {
  farm_id: string;
  total_yield_kg: number;
  total_net_yield_kg: number;
  total_revenue: number;
  avg_efficiency: number;
  farm?: TinyRelation;
}

export interface ByCropItem {
  crop_name: string;
  total_yield_kg: number;
  total_revenue: number;
  avg_efficiency: number;
  record_count: number;
}

export interface AnalyticsSummaryResponse {
  data: {
    totals: TotalsSummary;
    by_farm: ByFarmItem[];
    by_crop: ByCropItem[];
  };
}

// -----------------------------
// Service functions
// -----------------------------

/**
 * Fetch paginated yield records belonging to the authenticated user's farms.
 * Mirrors `FarmAnalyticsController::index`.
 */
export async function getYieldRecords(params?: GetYieldRecordsParams): Promise<PaginatedResponse<YieldRecord>> {
  const response = await api.get<PaginatedResponse<YieldRecord>>('/api/yield-records', { params });
  return response.data;
}

/**
 * Create a new yield record. Mirrors `FarmAnalyticsController::store`.
 */
export async function createYieldRecord(payload: CreateYieldRecordPayload) {
  const response = await api.post('/api/yield-records', payload);
  return response.data;
}

/**
 * Fetch a single yield record by id. Mirrors `FarmAnalyticsController::show`.
 */
export async function getYieldRecord(id: string) {
  const response = await api.get(`/api/yield-records/${id}`);
  return response.data;
}

/**
 * Update an existing yield record. Mirrors `FarmAnalyticsController::update`.
 */
export async function updateYieldRecord(id: string, payload: UpdateYieldRecordPayload) {
  const response = await api.put(`/api/yield-records/${id}`, payload);
  return response.data;
}

/**
 * Delete a yield record. Mirrors `FarmAnalyticsController::destroy`.
 */
export async function deleteYieldRecord(id: string) {
  const response = await api.delete(`/api/yield-records/${id}`);
  return response.data;
}

/**
 * Fetch aggregated analytics summary. Mirrors `FarmAnalyticsController::summary`.
 */
export async function getYieldSummary(params?: { farm_id?: string; from_date?: string; to_date?: string; }) : Promise<AnalyticsSummaryResponse> {
  const response = await api.get<AnalyticsSummaryResponse>('/api/yield-records/summary', { params });
  return response.data;
}

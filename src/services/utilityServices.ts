/**
 * @file Crop Cycles API Service
 * @description Handles network requests and type definitions for managing crop cycles.
 * Use this module to fetch crop cycle data filtered by farms, sections, or crop names.
 */

import api from "../lib/api";

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

/**
 * Represents the core structure of a single Crop Cycle.
 * * FUTURE MODIFICATIONS:
 * - If the backend adds new fields (e.g., actual_harvest_date, status, yield_quantity),
 * add them here with their appropriate TypeScript types.
 */
export interface CropCycle {
  id: string;
  farm_id: string;
  crop_name: string;
  season?: string | null;                 // Optional: e.g., "Spring 2026", "Monsoon"
  planting_date?: string;                // Optional: Expected ISO string format (YYYY-MM-DD)
  expected_harvest_date?: string | null; // Optional: Can be explicitly null if unknown
  
  /** * Nested relation representing the farm this cycle belongs to.
   * Extracted during backend joins.
   */
  farm?: {
    id: string;
    name?: string;
  };
}

/**
 * URL Query parameters allowed when fetching crop cycles.
 * Passed to the `api.get` method as a configuration object.
 * * FUTURE MODIFICATIONS:
 * - To implement pagination, add `page?: number;` and `limit?: number;` here.
 * - To filter by date ranges, add `start_date?: string;` or `end_date?: string;`.
 */
export interface GetCropCyclesParams {
  farm_id?: string;          // Filter cycles belonging to a specific farm
  farm_section_id?: string;  // Filter by a specific zone/section within a farm
  crop_name?: string;        // Filter by specific crop type (e.g., "Tomato")
}

/**
 * API Response structure returned by the backend `/api/crop-cycles` endpoint.
 */
export interface GetCropCyclesResponse {
  crop_cycles: CropCycle[];
}

// ==========================================
// 2. API REQUEST FUNCTIONS
// ==========================================

/**
 * Fetches a list of crop cycles from the backend database.
 * * @param {GetCropCyclesParams} [params] - Optional filtering criteria (farm_id, crop_name, etc.)
 * @returns {Promise<GetCropCyclesResponse>} Strongly-typed promise resolving to the API payload.
 * * @example
 * // Fetching all crop cycles for a specific farm
 * const data = await getCropCycles({ farm_id: "farm-123" });
 * console.log(data.crop_cycles);
 * * FUTURE MODIFICATIONS:
 * - If the endpoint URL changes, update the string route `"/api/crop-cycles"`.
 * - If error handling needs to be globalized or custom-logged, wrap the Axios call in a try/catch block.
 */
export async function getCropCycles(params?: GetCropCyclesParams): Promise<GetCropCyclesResponse> {
  // Axios/Custom API client GET request with generic type-casting applied to the response payload.
  const response = await api.get<GetCropCyclesResponse>("/api/crop-cycles", {
    params, // Automatically serializes object keys into URL query parameters (e.g., ?farm_id=xyz)
  });
  
  // Return the unwrapped data payload expected by UI components or state managers
  return response.data;
}
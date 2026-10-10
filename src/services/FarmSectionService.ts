import api from "../lib/api";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface CreateFarmPayload {
  name: string;
  location_name: string;
  country?: string;
  state_region?: string;
  address_text?: string;
  latitude: number;
  longitude: number;
  size_hectares?: number | null;
  primary_crop_name?: string | null;
}

export interface UpdateFarmPayload {
  name?: string;
  location_name?: string;
  country?: string;
  state_region?: string;
  address_text?: string;
  latitude?: number;
  longitude?: number;
  size_hectares?: number | null;
  primary_crop_name?: string | null;
  status?: string;
}

/*
|--------------------------------------------------------------------------
| GET ALL FARMS
|--------------------------------------------------------------------------
*/

export async function getFarms() {

  const response = await api.get(
    "/api/farms"
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| CREATE FARM
|--------------------------------------------------------------------------
*/

export async function createFarm(
  payload: CreateFarmPayload
) {

  const response = await api.post(
    "/api/farms",
    payload
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| UPDATE FARM
|--------------------------------------------------------------------------
*/

export async function updateFarm(
  farmId: string,
  payload: UpdateFarmPayload
) {

  const response = await api.put(
    `/api/farms/${farmId}`,
    payload
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| DELETE FARM
|--------------------------------------------------------------------------
*/

export async function deleteFarm(
  farmId: string
) {

  const response = await api.delete(
    `/api/farms/${farmId}`
  );

  return response.data;
}
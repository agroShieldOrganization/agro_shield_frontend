import api from "../../lib/api";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface CreateCropCyclePayload {

  farm_id: string;

  farm_section_id?: string | null;

  crop_name: string;

  season?: string | null;

  planting_date: string;

  expected_harvest_date?: string | null;

  expected_yield_kg_per_hectare?: number | null;

  expected_area_hectares?: number | null;

  notes?: string | null;
}

/*
|--------------------------------------------------------------------------
| GET CROP CYCLES
|--------------------------------------------------------------------------
*/

export async function getCropCycles() {

  const response = await api.get(
    "/api/crop-cycles"
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| CREATE CROP CYCLE
|--------------------------------------------------------------------------
*/

export async function createCropCycle(
  payload: CreateCropCyclePayload
) {

  const response = await api.post(
    "/api/crop-cycles",
    payload
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| UPDATE CROP CYCLE
|--------------------------------------------------------------------------
*/

export async function updateCropCycle(
  cropCycleId: string,
  payload: Partial<CreateCropCyclePayload>
) {

  const response = await api.put(
    `/api/crop-cycles/${cropCycleId}`,
    payload
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| DELETE CROP CYCLE
|--------------------------------------------------------------------------
*/

export async function deleteCropCycle(
  cropCycleId: string
) {

  const response = await api.delete(
    `/api/crop-cycles/${cropCycleId}`
  );

  return response.data;
}
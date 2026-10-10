import api from "../../lib/api";

export async function getFarmMapData() {

  const response = await api.get(
    "/api/farms/map-data"
  );

  return response.data;
}
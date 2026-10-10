import api from "../../lib/api";

interface GetFloodRisksOptions {

  startDate?: string;

  endDate?: string;
}

export async function getFloodRisks(
  options: GetFloodRisksOptions = {}
) {

  // Forward the selected range so the backend can return the exact graph
  // window the user requested from the climate trends page.
  const response = await api.get(
    "/api/climate/flood-risk",
    {
      params: {
        start_date:
          options.startDate,
        end_date:
          options.endDate,
      },
    }
  );

  return response.data;
}

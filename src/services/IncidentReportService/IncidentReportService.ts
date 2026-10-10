import api from "../../lib/api";
import axios from "axios";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface CreateIncidentReportPayload {

  incident_type: string;

  severity: string;

  location_name: string;

  latitude?: number | null;

  longitude?: number | null;

  description: string;

  affected_area_hectares?: number | null;

  contact_phone?: string | null;

  public_visibility?: string;

  occurred_at?: string | null;
}

export interface GenerateUploadUrlPayload {

  file_name: string;

  mime_type: string;

  size_bytes: number;
}

/*
|--------------------------------------------------------------------------
| INCIDENT REPORT TYPES
|--------------------------------------------------------------------------
*/

export interface IncidentReportFile {

  id: string;

  original_name: string;

  mime_type: string;

  path: string;
}

export interface IncidentReporter {

  id: string;

  name: string;

  email: string;
}

export interface IncidentReport {

  id: string;

  incident_type: string;

  severity: string;

  title?: string | null;

  location_name: string;

  latitude?: number | null;

  longitude?: number | null;

  description: string;

  affected_area_hectares?: number | null;

  contact_phone?: string | null;

  verification_status: string;

  public_visibility: string;

  occurred_at?: string | null;

  submitted_at: string;

  created_at: string;

  reporter?: IncidentReporter | null;

  files?: IncidentReportFile[];
}

/*
|--------------------------------------------------------------------------
| GET INCIDENT REPORTS
|--------------------------------------------------------------------------
*/

export async function getIncidentReports() {

  const response =
    await api.get(
      "/api/incident-reports"
    );

  return response.data;
}
/*
|--------------------------------------------------------------------------
| CREATE INCIDENT REPORT
|--------------------------------------------------------------------------
*/

export async function createIncidentReport(

  payload: CreateIncidentReportPayload

) {

  const response =
    await api.post(

      "/api/incident-reports",

      payload
    );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| GENERATE PRESIGNED URL
|--------------------------------------------------------------------------
*/

export async function generateUploadUrl(

  payload: GenerateUploadUrlPayload

) {

  const response =
    await api.post(

      "/api/files/upload-url",

      payload
    );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| SAVE FILE METADATA
|--------------------------------------------------------------------------
*/

export async function saveFileMetadata(

  payload: {

    incident_report_id: string;

    original_name: string;

    stored_name: string;

    mime_type: string;

    size_bytes: number;

    path: string;
  }

) {

  try {

    const response =
      await api.post(

        "/api/files/store-metadata",

        payload
      );

    return response.data;

  } catch (error) {

    // Bubble up Laravel validation messages so a 422 points to the actual
    // failing field instead of stopping at Axios' generic status error.
    if (
      axios.isAxiosError(error)
    ) {

      const validationErrors =
        error.response?.data
          ?.errors as
            | Record<
                string,
                string[]
              >
            | undefined;

      const firstFieldError =
        validationErrors
          ? Object.values(
              validationErrors
            )[0]?.[0]
          : undefined;

      const apiMessage =
        error.response?.data
          ?.message;

      throw new Error(
        firstFieldError ||
        apiMessage ||
        "Failed to save incident file metadata"
      );
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| DIRECT S3 FILE UPLOAD
|--------------------------------------------------------------------------
*/

export async function uploadFileToS3(

  uploadUrl: string,

  file: File,

  headers: Record<string, string> = {}

) {

  // Normalize the browser request headers so they match the presigned
  // contract and still include a content type for S3 object metadata.
  const requestHeaders =
    new Headers(headers);

  if (
    !requestHeaders.has(
      "Content-Type"
    ) &&
    file.type
  ) {
    requestHeaders.set(
      "Content-Type",
      file.type
    );
  }

  const response =
    await fetch(

      uploadUrl,

      {

        method: "PUT",

        headers:
          requestHeaders,

        body: file,
      }
    );

  if (!response.ok) {

    // Bubble up the S3 XML/text payload so upload failures are diagnosable
    // from the browser instead of collapsing into a generic error.
    const errorBody =
      await response.text();

    throw new Error(
      `Failed to upload file to S3 (${response.status} ${response.statusText}): ${errorBody || "No response body"}`
    );
  }

  return true;
}

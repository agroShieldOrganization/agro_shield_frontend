import api from "../lib/api";

interface UpdateProfilePayload {
  organization_name?: string;
  phone?: string;
  name?: string;
  email?: string;
  role?: string | null;
  status?: string | null;
}

/*
|--------------------------------------------------------------------------
| UPDATE USER PROFILE
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  payload: UpdateProfilePayload
) {

  const response = await api.put(
    "/api/user/profile",
    payload
  );
  console.log(response.data)
  return response.data;
}

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL CHANGE OTP
|--------------------------------------------------------------------------
*/

export async function verifyEmailChange(data: {
  otp: string;
}) {

  const response = await api.post(
    "/api/user/verify-email-change",
    data
  );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| RESEND EMAIL VERIFICATION OTP
|--------------------------------------------------------------------------
*/

export async function resendEmailVerificationOtp() {

  const response = await api.post(
    "/api/user/resend-email-change-otp"
  );

  return response.data;
}
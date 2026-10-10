import api from "../lib/api";

export async function verifyOtp(data: {
  email: string;
  otp: string;
}) {
  const response = await api.post("/api/verify-otp", data);

  return response.data;
}

export async function resendOtp(email: string) {
  const response = await api.post("/api/resend-otp", {
    email,
  });

  return response.data;
}
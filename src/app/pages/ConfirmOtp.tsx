import { motion } from "motion/react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, RefreshCcw, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { toast } from "sonner";
import { verifyOtp, resendOtp } from "../../services/otpService";

export function ConfirmOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");

  const email = location.state?.email ?? "your email";
  const name = location.state?.name ?? "Farmer";

  const handleConfirm = async (e: React.FormEvent) => {
  e.preventDefault();

  if (otp.length !== 6) {
    toast.error("Enter the full 6-digit OTP code");
    return;
  }

  try {
    await verifyOtp({
      email,
      otp,
    });

    toast.success("Email confirmed successfully!");

    navigate("/dashboard");

  } catch (error: any) {

    toast.error(
      error.response?.data?.message ||
      "OTP verification failed"
    );
  }
};

  const handleResend = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  try {

    const response = await resendOtp(email);

    console.log("NEW OTP:", response.otp);

    toast.success(`A new OTP has been sent to ${email}`);

  } catch (error: any) {

    toast.error(
      error.response?.data?.message ||
      "Failed to resend OTP"
    );
  }
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 h-80 w-80 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-cyan-500 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-xl rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">AgroShield AI</p>
              <p className="text-sm text-emerald-300">Email confirmation</p>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <MailCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-white">Confirm OTP</h1>
            <p className="mt-2 text-sm text-slate-300">
              Hi {name}, we sent a 6-digit verification code to{" "}
              <span className="font-medium text-white">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-300">
                Enter verification code
              </label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2 md:gap-3">
                  <InputOTPSlot index={0} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                  <InputOTPSlot index={1} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                  <InputOTPSlot index={2} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                  <InputOTPSlot index={3} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                  <InputOTPSlot index={4} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                  <InputOTPSlot index={5} className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                <p className="text-sm text-slate-300">
                  This verification step helps protect your farm data and ensures alerts are sent to a trusted contact.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            >
              Verify Account
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 text-sm text-slate-400 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300"
            >
              <RefreshCcw className="h-4 w-4" />
              Resend code
            </button>

            <Link to="/signup" className="transition-colors hover:text-white">
              Back to sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { MailCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { BaseModal } from "./ui/BaseModal";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./ui/input-otp";

import { Button } from "./ui/button";

import {
  verifyEmailChange,
  resendEmailVerificationOtp,
} from "../../services/UserSettings";

interface VerifyEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function VerifyEmailDialog({
  isOpen,
  onClose,
  email,
}: VerifyEmailDialogProps) {

  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | VERIFY EMAIL OTP
  |--------------------------------------------------------------------------
  */

  const handleVerify = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (otp.length !== 6) {

      toast.error(
        "Enter the full 6-digit OTP code"
      );

      return;
    }

    try {

      setIsSubmitting(true);

      await verifyEmailChange({
        otp,
      });

      toast.success(
        "Email verified successfully"
      );

      onClose();

      window.location.reload();

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "OTP verification failed"
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESEND OTP
  |--------------------------------------------------------------------------
  */

  const handleResend = async () => {

    try {

      setIsResending(true);

      const response =
        await resendEmailVerificationOtp();

      console.log(
        "NEW EMAIL OTP:",
        response.otp
      );

      toast.success(
        `A new OTP has been sent to ${email}`
      );

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "Failed to resend OTP"
      );

    } finally {

      setIsResending(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify New Email"
      subtitle={email}
      icon={
        <MailCheck className="h-6 w-6 text-emerald-400" />
      }
      maxWidth="max-w-xl"
    >

      <form
        onSubmit={handleVerify}
        className="space-y-6"
      >

        {/* INFO CARD */}

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5">

          <h2 className="text-lg font-bold text-white">
            Confirm Email Change
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            We sent a 6-digit verification code to:
          </p>

          <p className="mt-2 font-medium text-white">
            {email}
          </p>
        </div>

        {/* OTP */}

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

              {[0, 1, 2, 3, 4, 5].map((index) => (

                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/60 text-base text-white first:rounded-xl first:border last:rounded-xl md:h-14 md:w-14"
                />
              ))}

            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* SECURITY INFO */}

        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">

          <div className="flex items-start gap-3">

            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />

            <p className="text-sm text-slate-300">
              Verifying your email helps secure
              your AgroShield account and ensures
              important alerts are delivered to
              the correct address.
            </p>

          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col gap-4">

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
          >

            {isSubmitting ? (

              <div className="flex items-center gap-2">

                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                Verifying...

              </div>

            ) : (

              "Verify Email"

            )}

          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-300 disabled:opacity-50"
          >

            <RefreshCcw className="h-4 w-4" />

            {isResending
              ? "Resending..."
              : "Resend code"}

          </button>
        </div>

      </form>

    </BaseModal>
  );
}
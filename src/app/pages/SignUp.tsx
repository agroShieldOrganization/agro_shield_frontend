import { motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck, Sprout, ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  getApiErrorMessage,
  getApiValidationErrors,
  useAuth,
} from "../../context/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    
    try {
      setIsSubmitting(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      toast.success("Account created. Confirm your email with the OTP code.");
      navigate("/confirm-otp", {
        state: { email: formData.email, name: formData.name },
      });
    } catch (error) {
      const validationErrors = getApiValidationErrors(error);
      const firstValidationMessage = Object.values(validationErrors)
        .flat()
        .find(Boolean);

      toast.error(firstValidationMessage ?? getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/5 h-96 w-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-500 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block"
          >
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Grovane Climate Atlas</p>
                  <p className="text-xs text-emerald-300">Secure access to climate inte</p>
                  <p className="text-xs text-emerald-300">Climate intelligence for resilient farming</p>
                </div>
              </div>

              <h1 className="mb-4 text-4xl font-bold text-white xl:text-5xl">
                Create your farming intelligence account
              </h1>
              <p className="mb-8 text-base text-slate-300 xl:text-lg">
                Join the platform to monitor farms, receive climate advisories, and respond faster to weather and field risks.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Risk Alerts",
                    text: "Stay ahead of flood, drought, and pest threats with timely signals.",
                  },
                  {
                    icon: Sprout,
                    title: "Farm Tracking",
                    text: "Organize multiple farms, crop cycles, and growing conditions in one place.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h2 className="mb-1 text-sm font-semibold text-white">{item.title}</h2>
                    <p className="text-sm text-slate-400">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
              <div className="mb-8 lg:hidden">
                <div className="mb-4 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Sprout className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Grovane Climate Atlas</p>
                  <p className="text-xs text-emerald-300">Secure access to climate intelligence</p>
                    <p className="text-xs text-emerald-300">Secure sign up</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Sign Up</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Create your account to start receiving personalized farm intelligence.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="mb-2 flex items-center gap-2 text-slate-300">
                    <User className="h-4 w-4 text-emerald-400" />
                    Full Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., John Doe"
                    className="border-slate-700 bg-slate-800/50 text-white"
                  />
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-blue-400" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g., farmer@grovaneclimateatlas.ai"
                    className="border-slate-700 bg-slate-800/50 text-white"
                  />
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-slate-300">
                    <Lock className="h-4 w-4 text-orange-400" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="At least 8 characters"
                      className="border-slate-700 bg-slate-800/50 pr-12 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-slate-300">
                    <Lock className="h-4 w-4 text-teal-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter your password"
                      className="border-slate-700 bg-slate-800/50 pr-12 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200">
                    After signing up, we’ll send a one-time password to your email for account confirmation.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                  Login here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

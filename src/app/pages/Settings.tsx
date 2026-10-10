import { motion } from "motion/react";
import {
  User,
  Bell,
  Lock,
  Globe,
  Database,
  AlertTriangle,
} from "lucide-react";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

import { useAuth } from "../../context/AuthContext";

import { updateProfile } from "../../services/UserSettings";

import { VerifyEmailDialog } from "../components/VerifyEmailDialog";

export function Settings() {

  const { user, refreshUser, setUser } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [isUpdating, setIsUpdating] = useState(false);

  const [isVerifyModalOpen, setIsVerifyModalOpen] =
    useState(false);

          const [formData, setFormData] = useState({
            organization_name:
              user?.profile?.organization_name ?? "",

            phone:
              user?.profile?.phone ?? "",

            name:
              user?.name ?? "",

            email:
              user?.email ?? "",
          });

          useEffect(() => {

          setFormData({
            organization_name:
              user?.profile?.organization_name ?? "",

            phone:
              user?.profile?.phone ?? "",

            name:
              user?.name ?? "",

            email:
              user?.email ?? "",
          });

        }, [user]);

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setIsUpdating(true);

      const response =
        await updateProfile(formData);
        setUser(response.user);

      toast.success(response.message);

      /*
      |--------------------------------------------------------------------------
      | OPEN VERIFY MODAL
      |--------------------------------------------------------------------------
      */

      if (
        response.requires_email_verification
      ) {

        setIsVerifyModalOpen(true);
      }

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "Failed to update profile"
      );

    } finally {

      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="space-y-6">

        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Settings
          </h1>

          <p className="text-sm md:text-base text-slate-400">
            Manage your account and application preferences
          </p>
        </motion.div>

        {/* EMAIL VERIFICATION ALERT */}
        {user?.pendingEmailChange?.requires_email_verification && (

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div className="mt-1">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>

                <div>

                  <h3 className="font-semibold text-orange-300">
                    Email Verification Required
                  </h3>

                  <p className="mt-1 text-sm text-orange-200/80">
                    Your new email address is pending verification.
                    Please verify it to continue receiving alerts
                    and security notifications.
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  setIsVerifyModalOpen(true)
                }
                className="bg-orange-500 hover:bg-orange-600"
              >
                Verify Email
              </Button>

            </div>

          </motion.div>
        )}

        {/* SETTINGS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PROFILE */}
          <form onSubmit={handleSubmit}>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex items-center gap-3 mb-6">

                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="text-lg font-bold text-white">
                  Profile
                </h3>

              </div>

              <div className="space-y-4">

                {/* NAME */}
                <div>

                  <Label className="text-slate-400 mb-2">
                    Full Name
                  </Label>

                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />

                </div>

                {/* EMAIL */}
                <div>

                  <Label className="text-slate-400 mb-2">
                    Email
                  </Label>

                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />

                </div>

                {/* PHONE */}
                <div>

                  <Label className="text-slate-400 mb-2">
                    Phone
                  </Label>

                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />

                </div>

                {/* ORGANIZATION */}
                <div>

                  <Label className="text-slate-400 mb-2">
                    Organization
                  </Label>

                  <Input
                    value={
                      formData.organization_name
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization_name:
                          e.target.value,
                      })
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />

                </div>

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                >

                  {isUpdating ? (

                    <div className="flex items-center gap-2">

                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Updating...

                    </div>

                  ) : (
                    "Update Profile"
                  )}

                </Button>

              </div>

            </motion.div>

          </form>

          {/* NOTIFICATIONS */}
          
        {/* Notifications */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: "Flood Alerts", enabled: true },
              { label: "Planting Recommendations", enabled: true },
              { label: "Pest Outbreak Warnings", enabled: true },
              { label: "Weather Updates", enabled: false },
              { label: "Community Reports", enabled: true },
              { label: "Email Notifications", enabled: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-300">{item.label}</span>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
        </motion.div>

          {/* Security */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2">Current Password</Label>
              <Input type="password" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-400 mb-2">New Password</Label>
              <Input type="password" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-400 mb-2">Confirm Password</Label>
              <Input type="password" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Change Password
            </Button>
          </div>
        </motion.div>
      </div>

       {/* Additional Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Regional Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-400 mb-2">Primary Location</Label>
              <Input defaultValue="Abuja, Nigeria" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-400 mb-2">Timezone</Label>
              <Input defaultValue="West Africa Time (WAT)" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-slate-400 mb-2">Units</Label>
              <Input defaultValue="Metric (Celsius, mm)" className="bg-slate-800/50 border-slate-700 text-white" />
            </div>
          </div>
        </motion.div>

          {/* Data & Privacy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Data & Privacy</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: "Share anonymized data for research", enabled: true },
              { label: "Allow location tracking", enabled: true },
              { label: "Share farm data with community", enabled: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-300">{item.label}</span>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}

            <div className="pt-4 space-y-3">
              <Button variant="outline" className="w-full border-slate-700 hover:border-cyan-500">
                Export My Data
              </Button>
              <Button variant="outline" className="w-full border-slate-700 hover:border-red-500 text-red-400">
                Delete Account
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
 

      {/* VERIFY EMAIL MODAL */}
     <VerifyEmailDialog
      isOpen={isVerifyModalOpen}
      onClose={() => setIsVerifyModalOpen(false)}
      email={
        user?.pendingEmailChange?.new_email ??
        user?.email ??
        ""
      }
    />
    </>
  );
}
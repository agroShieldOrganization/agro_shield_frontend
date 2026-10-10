import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import React from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "max-w-2xl",
}: BaseModalProps) {

  if (!isOpen) return null;

  return (
    <AnimatePresence>

      <>

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`w-full ${maxWidth} max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl`}
          >

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center gap-3">

                {icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    {icon}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {title}
                  </h2>

                  {subtitle && (
                    <p className="text-sm text-slate-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {children}
            </div>

          </motion.div>
        </div>
      </>

    </AnimatePresence>
  );
}
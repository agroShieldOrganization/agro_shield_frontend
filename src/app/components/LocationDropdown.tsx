import { motion, AnimatePresence } from "motion/react";
import { MapPin, Check } from "lucide-react";
import { useState } from "react";

const locations = [
  { name: "Abuja, Nigeria", active: true },
  { name: "Kaduna, Nigeria", active: false },
  { name: "Benue, Nigeria", active: false },
  { name: "Kano, Nigeria", active: false },
  { name: "Lagos, Nigeria", active: false },
];

export function LocationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(locations[0].name);

  return (
    <div className="relative z-50">
      {/* Location Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors"
      >
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-slate-300">{selected}</span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Select Location</h3>
              </div>

              {/* Locations List */}
              <div className="p-2">
                {locations.map((location, index) => (
                  <motion.button
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelected(location.name);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-slate-300">{location.name}</span>
                    </div>
                    {selected === location.name && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

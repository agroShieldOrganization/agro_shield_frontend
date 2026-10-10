import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
import { TestBadge } from "./components/TestBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./components/ui/sheet";
import { Dashboard } from "./pages/Dashboard";
import { MyFarms } from "./pages/MyFarms";
import { AddFarm } from "./pages/AddFarm";
import {ClimateIntelligence} from "./pages/ClimateIntelligence";
import FarmAnalytics from "./pages/CropYieldPages/FarmAnalytics";
import { PlantingAdvisor } from "./pages/PlantingAdvisor";
import { FloodRisk } from "./pages/FloodRisk";
import { SoilIntelligence } from "./pages/SoilIntelligence";
import { CommunityReports } from "./pages/CommunityReports";
import { SubmitReport } from "./pages/SubmitReport";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";
import { TestRoutes } from "./pages/TestRoutes";
import { SignUp } from "./pages/SignUp";
import { ConfirmOtp } from "./pages/ConfirmOtp";
import { Login } from "./pages/Login";
import ProtectedRoute from "../routes/ProtectedRoutes";
import PublicOnlyRoute from "../routes/PublicOnlyRoute";

function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="dark h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden relative">
        {/* Animated Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-500" />
        </div>

        {/* Sidebar - Hidden on mobile, visible on lg+ */}
        <div className="relative z-20 hidden lg:block">
          <Sidebar />
        </div>

        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent
            side="left"
            className="w-64 border-slate-800 bg-transparent p-0 sm:max-w-64 [&>button]:right-3 [&>button]:top-3"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Mobile navigation menu</SheetDescription>
            </SheetHeader>
            <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Top Navbar */}
          <TopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

          

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
          </div>
        </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route path="/confirm-otp" element={<ConfirmOtp />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-farms" element={<MyFarms />} />
            <Route path="/add-farm" element={<AddFarm />} />
            <Route path="climate-intelligence" element={<ClimateIntelligence />} />
            <Route path="/farm-analytics" element={<FarmAnalytics />} />
            <Route path="/planting-advisor" element={<PlantingAdvisor />} />
            <Route path="/flood-risk" element={<FloodRisk />} />
            <Route path="/soil-intelligence" element={<SoilIntelligence />} />
            <Route path="/community-reports" element={<CommunityReports />} />
            <Route path="/submit-report" element={<SubmitReport />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/test-routes" element={<TestRoutes />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

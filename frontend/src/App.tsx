import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./components/landing/Landing.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import DashboardOverview from "./pages/DashboardOverview.js";
import Invoices from "./pages/Invoices.js";
import Contracts from "./pages/Contracts.js";
import Negotiations from "./pages/Negotiations.js";
import Buyers from "./pages/Buyers.js";
import Analytics from "./pages/Analytics.js";
import AiInsights from "./pages/AiInsights.js";
import Settings from "./pages/Settings.js";
import { Toaster } from "sonner";

// Simple auth wrapper route guard
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = !!localStorage.getItem("paybridge_token");
  return isAuth ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/contracts"
          element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/negotiations"
          element={
            <ProtectedRoute>
              <Negotiations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/buyers"
          element={
            <ProtectedRoute>
              <Buyers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-insights"
          element={
            <ProtectedRoute>
              <AiInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

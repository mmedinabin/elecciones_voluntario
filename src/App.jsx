import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomTabs from "./components/BottomTabs";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import OnboardingGate from "./pages/OnboardingGate";
import RegistroVoluntario from "./pages/RegistroVoluntario";

import Dashboard from "./pages/Dashboard";
import DashboardPadron from "./pages/DashboardPadron";
import Distritos from "./pages/Distritos";
import MesaDetalle from "./pages/MesaDetalle";
import Upload from "./pages/Upload";
import Digitacion from "./pages/Digitacion";
import DigitacionDistrito from "./pages/DigitacionDistrito";
import DigitacionRecinto from "./pages/DigitacionRecinto";
import AuthCallback from "./pages/AuthCallback";

function PrivateLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1">
        <Header />

        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</div>

        <div className="md:hidden">
          <BottomTabs />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<OnboardingGate />} />
        <Route path="/registro" element={<RegistroVoluntario />} />

        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin", "digitador", "voluntario"]}>
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "digitador", "voluntario"]}>
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/padron"
          element={
            <ProtectedRoute allowedRoles={["admin", "digitador", "voluntario"]}>
              <PrivateLayout>
                <DashboardPadron />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRoles={["voluntario", "admin"]}>
              <PrivateLayout>
                <Upload />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/digitacion"
          element={
            <ProtectedRoute allowedRoles={["digitador", "admin"]}>
              <PrivateLayout>
                <Digitacion />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/digitacion/:id"
          element={
            <ProtectedRoute allowedRoles={["digitador", "admin"]}>
              <PrivateLayout>
                <DigitacionDistrito />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/digitacion/recinto/:id"
          element={
            <ProtectedRoute allowedRoles={["digitador", "admin"]}>
              <PrivateLayout>
                <DigitacionRecinto />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesa/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "digitador"]}>
              <PrivateLayout>
                <MesaDetalle />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomTabs from "./components/BottomTabs";

import Dashboard from "./pages/Dashboard";
import DashboardPadron from "./pages/DashboardPadron";
import Distritos from "./pages/Distritos";
import MesaDetalle from "./pages/MesaDetalle";
import Upload from "./pages/Upload";
import Digitacion from "./pages/Digitacion";
import DigitacionDistrito from "./pages/DigitacionDistrito";
import DigitacionRecinto from "./pages/DigitacionRecinto";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <Header />

          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/padron" element={<DashboardPadron />} />
              <Route path="/distritos" element={<Distritos />} />
              <Route path="/upload" element={<Upload />} />

              {/* Digitación */}
              <Route path="/digitacion" element={<Digitacion />} />
              <Route path="/digitacion/:id" element={<DigitacionDistrito />} />
              <Route
                path="/digitacion/recinto/:id"
                element={<DigitacionRecinto />}
              />

              {/* Mesa detalle */}
              <Route path="/mesa/:id" element={<MesaDetalle />} />
            </Routes>
          </div>

          {/* Bottom Tabs Mobile */}
          <div className="md:hidden">
            <BottomTabs />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import BottomTabs from "./components/BottomTabs"
import Dashboard from "./pages/Dashboard"
import Distritos from "./pages/Distritos"
import Upload from "./pages/Upload"

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
              <Route path="/distritos" element={<Distritos />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
          </div>

          {/* Bottom Tabs Mobile */}
          <div className="md:hidden">
            <BottomTabs />
          </div>

        </div>
      </div>
    </BrowserRouter>
  )
}
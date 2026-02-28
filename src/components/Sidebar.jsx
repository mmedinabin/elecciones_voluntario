import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#111827] border-r border-[#1f2937] p-6 space-y-8">
      
      <h2 className="text-lg font-bold text-[#facc15] tracking-wide uppercase">
        Elecciones SCZ
      </h2>

      <nav className="flex flex-col space-y-3 text-sm font-medium">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all duration-200
             ${isActive
               ? "bg-[#facc15] text-black shadow-md"
               : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
          }
        >
          📊 Resultados
        </NavLink>
        
        <NavLink
          to="/padron"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all duration-200
             ${isActive
               ? "bg-[#facc15] text-black shadow-md"
               : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
          }
        >
          🏠 Dashboard Padron
        </NavLink>

        <NavLink
          to="/distritos"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all duration-200
             ${isActive
               ? "bg-[#facc15] text-black shadow-md"
               : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
          }
        >
          📊 Distritos
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all duration-200
             ${isActive
               ? "bg-[#facc15] text-black shadow-md"
               : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
          }
        >
          📷 Subir Acta
        </NavLink>

        <NavLink
          to="/digitacion"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-all duration-200
             ${isActive
               ? "bg-[#facc15] text-black shadow-md"
               : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
          }
        >
          ✍️ Digitación
        </NavLink>

      </nav>
    </div>
  );
}
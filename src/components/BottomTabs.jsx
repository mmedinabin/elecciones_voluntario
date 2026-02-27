import { NavLink } from "react-router-dom"

export default function BottomTabs() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#1f2937] shadow-2xl">

      <div className="relative flex justify-around items-center h-16">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs font-medium transition
             ${isActive ? "text-[#facc15]" : "text-gray-400"}`
          }
        >
          <span className="text-xl">🏠</span>
          Inicio
        </NavLink>

        {/* Botón central destacado */}
        <NavLink
          to="/upload"
          className="absolute -top-5 bg-[#facc15] text-black 
                     w-16 h-16 rounded-full 
                     flex items-center justify-center 
                     shadow-xl text-2xl
                     transition active:scale-95"
        >
          📷
        </NavLink>

        <NavLink
          to="/distritos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs font-medium transition
             ${isActive ? "text-[#facc15]" : "text-gray-400"}`
          }
        >
          <span className="text-xl">📊</span>
          Distritos
        </NavLink>

      </div>
    </div>
  )
}
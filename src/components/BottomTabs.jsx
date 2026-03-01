import { NavLink } from "react-router-dom";
import { CloudUpload } from "lucide-react";


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
          <span className="text-xl">📊</span>
          Resultados
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `absolute -top-7 flex flex-col items-center transition ${
              isActive ? "text-[#facc15]" : "text-gray-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition active:scale-95 ${
                  isActive
                    ? "bg-[#facc15] text-black"
                    : "bg-[#1f2937] text-gray-400"
                }`}
              >
                <CloudUpload size={28} strokeWidth={2.5} />
              </div>

              <span
                className={`text-xs mt-1 font-medium transition ${
                  isActive ? "text-[#facc15]" : "text-gray-400"
                }`}
              >
                Acta
              </span>
            </>
          )}
        </NavLink>

        {/* <NavLink
          to="/upload"
          className="absolute -top-5 bg-[#facc15] text-black 
                     w-16 h-16 rounded-full 
                     flex items-center justify-center 
                     shadow-xl text-2xl
                     transition active:scale-95"
        >
          📷
        </NavLink> */}

        <NavLink
          to="/padron"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs font-medium transition
             ${isActive ? "text-[#facc15]" : "text-gray-400"}`
          }
        >
          <span className="text-xl">📊</span>
          Padron
        </NavLink>
      </div>
    </div>
  );
}

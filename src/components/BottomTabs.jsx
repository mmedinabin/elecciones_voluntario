import { NavLink } from "react-router-dom"
import { CloudUpload, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

export default function BottomTabs() {
  const [rol, setRol] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setRol(session?.user?.app_metadata?.role || null)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setRol(session?.user?.app_metadata?.role || null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!rol) return null

  const isVoluntario = rol === "voluntario"
  const isAdmin = rol === "admin"
  const isDigitador = rol === "digitador"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#1f2937] shadow-2xl">
      <div className="relative flex justify-around items-center h-16">

        {/* RESULTADOS */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-medium transition
             ${isActive ? "text-[#facc15]" : "text-gray-400"}`
          }
        >
          <span className="text-xl">📊</span>
          Resultados
        </NavLink>

        {/* BOTÓN CENTRAL SOLO VOLUNTARIO */}
        {isVoluntario && (
          <NavLink
            to="/upload"
            className="absolute -top-7 flex flex-col items-center"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition ${
                    isActive
                      ? "bg-[#facc15] text-black"
                      : "bg-[#1f2937] text-gray-400"
                  }`}
                >
                  <CloudUpload size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-1 text-gray-400">
                  Acta
                </span>
              </>
            )}
          </NavLink>
        )}

        {/* PADRÓN */}
        <NavLink
          to="/padron"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs font-medium transition
             ${isActive ? "text-[#facc15]" : "text-gray-400"}`
          }
        >
          <span className="text-xl">📋</span>
          Padrón
        </NavLink>

        {/* MÁS (digitador + admin) */}
        {(isDigitador || isAdmin) && (
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col items-center text-xs font-medium text-gray-400 hover:text-white transition"
          >
            <Menu size={22} />
            Más
          </button>
        )}
      </div>

      {/* PANEL MÁS */}
      {open && (
        <div className="absolute bottom-16 right-4 w-52 bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl p-3 space-y-2 text-sm">

          {(isDigitador || isAdmin) && (
            <NavLink
              to="/digitacion"
              onClick={() => setOpen(false)}
              className="block p-2 rounded-lg text-gray-200 hover:bg-[#1f2937] hover:text-[#facc15] transition"
            >
              ✍️ Digitación
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/upload"
              onClick={() => setOpen(false)}
              className="block p-2 rounded-lg text-gray-200 hover:bg-[#1f2937] hover:text-[#facc15] transition"
            >
              📷 Subir Acta
            </NavLink>
          )}

        </div>
      )}
    </div>
  )
}
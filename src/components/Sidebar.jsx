import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

export default function Sidebar() {
  const [rol, setRol] = useState(null)

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

  return (
    <div className="w-64 h-screen bg-[#111827] border-r border-[#1f2937] p-6 space-y-8">
      <h2 className="text-lg font-bold text-[#facc15] tracking-wide uppercase">
        Elecciones SCZ
      </h2>

      <nav className="flex flex-col space-y-3 text-sm font-medium">

        {/* RESULTADOS → todos */}
        <NavLink to="/" className={navClass}>
          📊 Resultados
        </NavLink>

        {/* PADRÓN → todos */}
        <NavLink to="/padron" className={navClass}>
          📋 Padrón
        </NavLink>

        {/* SUBIR ACTA → voluntario + admin */}
        {(rol === "voluntario" || rol === "admin") && (
          <NavLink to="/upload" className={navClass}>
            📷 Subir Acta
          </NavLink>
        )}

        {/* DIGITACIÓN → digitador + admin */}
        {(rol === "digitador" || rol === "admin") && (
          <NavLink to="/digitacion" className={navClass}>
            ✍️ Digitación
          </NavLink>
        )}

      </nav>
    </div>
  )
}

const navClass = ({ isActive }) =>
  `p-3 rounded-xl transition-all duration-200
   ${isActive
     ? "bg-[#facc15] text-black shadow-md"
     : "text-gray-400 hover:bg-[#1f2937] hover:text-white"}`
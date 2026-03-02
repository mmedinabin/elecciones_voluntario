import { LogOut, User } from "lucide-react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Header() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) return

      const rol = user.app_metadata?.role

      if (rol === "digitador" || rol === "admin") {
        setUserInfo({
          email: user.email,
          rol
        })
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="bg-[#0f0f0f] text-white px-6 py-4 shadow-xl border-b border-[#1f2937] flex items-center justify-between relative">
      
      <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase">
        <span className="text-[#facc15]">Elecciones</span> Municipales 2026
      </h1>

      <div className="flex items-center gap-4">

        {/* Perfil solo para digitador/admin */}
        {userInfo && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <User size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl p-4 text-sm space-y-2 z-50">
                <div>
                  <p className="text-gray-400">Correo</p>
                  <p className="font-medium text-white break-all">
                    {userInfo.email}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Rol</p>
                  <p className="font-medium text-[#facc15] capitalize">
                    {userInfo.rol}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-500 transition"
                >
                  <LogOut size={16} />
                  Salir
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botón salir directo para voluntarios */}
        {!userInfo && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Salir</span>
          </button>
        )}

      </div>
    </div>
  )
}
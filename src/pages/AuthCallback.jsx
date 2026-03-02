// pages/AuthCallback.jsx
import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      // Esperar a que Supabase procese el hash del callback
      const { data: { session } } = await supabase.auth.getSession()

      const user = session?.user

      if (!user) {
        navigate("/login", { replace: true })
        return
      }

      const rol = user.app_metadata?.role

      if (rol === "voluntario") {
        navigate("/upload", { replace: true })
      } else if (rol === "digitador") {
        navigate("/digitacion", { replace: true })
      } else if (rol === "admin") {
        navigate("/", { replace: true })
      } else {
        navigate("/login", { replace: true })
      }
    }

    handleAuth()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      Procesando autenticación...
    </div>
  )
}
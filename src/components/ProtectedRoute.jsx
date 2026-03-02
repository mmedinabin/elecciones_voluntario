import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    checkSession()

    // Escuchar cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="p-10">Cargando...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const rol = session.user.app_metadata?.role

  if (!rol || !allowedRoles.includes(rol)) {
    // Redirigir inteligentemente según rol real
    if (rol === "voluntario") return <Navigate to="/upload" replace />
    if (rol === "digitador") return <Navigate to="/digitacion" replace />
    if (rol === "admin") return <Navigate to="/" replace />

    return <Navigate to="/login" replace />
  }

  return children
}
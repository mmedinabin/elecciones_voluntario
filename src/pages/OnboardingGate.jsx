// pages/OnboardingGate.jsx
import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function OnboardingGate() {
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) {
        navigate("/login", { replace: true })
        return
      }

      const rol = user.app_metadata?.role

      // Solo voluntarios pasan por onboarding
      if (rol !== "voluntario") {
        navigate("/", { replace: true })
        return
      }

      // Verificar si ya existe en tabla voluntarios
      const { data: voluntario } = await supabase
        .from("voluntarios")
        .select("*")
        .eq("usuario_id", user.id)
        .single()

      // Si no existe → crearlo
      if (!voluntario) {
        await supabase.from("voluntarios").insert({
          usuario_id: user.id,
          estado_validacion: "pendiente",
          numero_documento_raw: "",
          numero_documento_norm: "",
        })

        navigate("/registro", { replace: true })
        return
      }

      // Redirigir según estado
      if (
        voluntario.estado_validacion === "manual" ||
        voluntario.estado_validacion === "validado"
      ) {
        navigate("/upload", { replace: true })
      } else {
        navigate("/registro", { replace: true })
      }
    }

    init()
  }, [navigate])

  return (
    <div className="p-10 text-center">
      Verificando registro...
    </div>
  )
}
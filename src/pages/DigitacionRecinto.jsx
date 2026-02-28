import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

export default function DigitacionRecinto() {
  const { id } = useParams()
  const [mesas, setMesas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    const { data } = await supabase
      .from("mesas")
      .select("id, numero_mesa, es_prioridad")
      .eq("recinto_id", id)
      .order("es_prioridad", { ascending: false })
      .order("numero_mesa")

    setMesas(data)
  }

  return (
    <div className="p-6 space-y-6">

      <button
        onClick={() => navigate(-1)}
        className="text-yellow-400"
      >
        ← Volver
      </button>

      <h2 className="text-xl font-bold text-white">
        Mesas
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            onClick={() => navigate(`/mesa/${mesa.id}`)}
            className={`p-4 rounded-2xl cursor-pointer shadow-md
              ${mesa.es_prioridad
                ? "bg-[#facc15] text-black"
                : "bg-[#1f2937] text-white"}
            `}
          >
            <div className="text-2xl font-bold">
              Mesa {mesa.numero_mesa}
            </div>

            {mesa.es_prioridad && (
              <div className="text-xs font-semibold mt-1">
                PRIORIDAD
              </div>
            )}
          </div>
        ))}

      </div>

    </div>
  )
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useMemo } from "react";

export default function DigitacionDistrito() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mesas, setMesas] = useState([]);
  const [search, setSearch] = useState("");
  const [distritoNombre, setDistritoNombre] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data, error } = await supabase
      .from("distritos")
      .select(
        `
      id,
      nombre,
      recintos (
        id,
        nombre,
        mesas (
          id,
          numero_mesa,
          es_prioridad,
          estado
        )
      )
    `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const todasMesas = [];

    data.recintos?.forEach((recinto) => {
      recinto.mesas?.forEach((mesa) => {
        todasMesas.push({
          ...mesa,
          recinto_nombre: recinto.nombre,
        });
      });
    });

    todasMesas.sort((a, b) => {
      if (a.es_prioridad === b.es_prioridad) {
        return a.numero_mesa - b.numero_mesa;
      }
      return a.es_prioridad ? -1 : 1;
    });

    setMesas(todasMesas);
    setDistritoNombre(data.nombre);
  }

  function normalize(text) {
    return (
      text
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || ""
    );
  }

  const filtered = useMemo(() => {
    const term = normalize(search.trim());

    if (!term) return mesas;

    return mesas.filter((mesa) => {
      const recinto = normalize(mesa.recinto_nombre);
      const numero = mesa.numero_mesa?.toString() || "";

      return recinto.includes(term) || numero.includes(term);
    });
  }, [search, mesas]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray">
        Digitación {distritoNombre}
      </h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar recinto o número de mesa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 rounded-2xl bg-[#1f2937] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#facc15]"
      />

      {/* Grid Mesas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((mesa) => {
          const registrada = mesa.estado === "registrado";

          return (
            <div
              key={mesa.id}
              onClick={() => {
                if (!registrada) {
                  navigate(`/mesa/${mesa.id}`);
                }
              }}
              className={`p-4 rounded-2xl shadow-md transition relative
                ${
                  mesa.es_prioridad
                    ? "bg-[#facc15] text-black"
                    : "bg-[#1f2937] text-white"
                }
                ${registrada ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
              `}
            >
              <div className="text-xs opacity-70">{mesa.recinto_nombre}</div>

              <div className="text-xl font-bold">Mesa {mesa.numero_mesa}</div>

              {mesa.es_prioridad && (
                <div className="text-xs font-semibold mt-1">PRIORIDAD</div>
              )}

              {registrada && (
                <div className="absolute top-2 right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded">
                  REGISTRADA
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Digitacion() {
  const [distritos, setDistritos] = useState([]);

  const [search, setSearch] = useState("");
  const [mesasFlat, setMesasFlat] = useState([]);
  const [resultados, setResultados] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

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
            resultados_mesa_totales ( mesa_id ),
            fotos_mesa ( id )
          )
        )
      `,
      )
      .order("nombre");

    if (error) {
      console.error(error);
      return;
    }

    const enriched = data.map((d) => {
      let totalMesas = 0;
      let digitadas = 0;
      let conFoto = 0;

      d.recintos?.forEach((r) => {
        r.mesas?.forEach((m) => {
          totalMesas++;

          if (m.resultados_mesa_totales?.length > 0) {
            digitadas++;
          }

          if (m.fotos_mesa?.length > 0) {
            conFoto++;
          }
        });
      });

      const pendientes = totalMesas - digitadas;

      return {
        id: d.id,
        nombre: d.nombre,
        total_mesas: totalMesas || 0,
        digitadas: digitadas || 0,
        con_foto: conFoto || 0,
        pendientes: pendientes || 0,
      };
    });

    const ordenados = [...enriched].sort((a, b) => {
      const numA = a.nombre.match(/\d+/);
      const numB = b.nombre.match(/\d+/);

      const valA = numA ? parseInt(numA[0]) : 0;
      const valB = numB ? parseInt(numB[0]) : 0;

      return valA - valB;
    });

    // Crear listado plano de todas las mesas para búsqueda rápida
    const flat = [];

    data.forEach((d) => {
      d.recintos?.forEach((r) => {
        r.mesas?.forEach((m) => {
          flat.push({
            id: m.id,
            numero_mesa: m.numero_mesa,
            recinto_nombre: r.nombre,
            distrito_nombre: d.nombre,
          });
        });
      });
    });

    setMesasFlat(flat);

    setDistritos(ordenados);
  }

  useEffect(() => {
    if (!search.trim()) {
      setResultados([]);
      return;
    }

    const term = search.toLowerCase();

    const filtrados = mesasFlat.filter(
      (m) =>
        m.numero_mesa?.toString().includes(term) ||
        m.recinto_nombre.toLowerCase().includes(term),
    );

    //setResultados(filtrados.slice(0, 30)); // limitar resultados
    setResultados(filtrados);
  }, [search, mesasFlat]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray">Centro de Digitación</h1>
      <div>
        <input
          type="text"
          placeholder="Buscar mesa o recinto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#1f2937] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#facc15]"
        />
      </div>

      {search ? (
        resultados.length > 0 ? (
          <div className="space-y-4">
            {/* Agrupar por recinto */}
            {[...new Set(resultados.map((r) => r.recinto_nombre))].map(
              (recinto) => {
                const mesasRecinto = resultados.filter(
                  (r) => r.recinto_nombre === recinto,
                );

                return (
                  <div
                    key={recinto}
                    className="bg-[#1f2937] p-6 rounded-2xl shadow-lg"
                  >
                    <div className="text-sm text-gray-400 mb-4">
                      {recinto} — {mesasRecinto[0].distrito_nombre}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {mesasRecinto.map((mesa) => (
                        <button
                          key={mesa.id}
                          onClick={() => navigate(`/mesa/${mesa.id}`)}
                          className="bg-[#111827] hover:bg-[#2a3646]
                             text-[#facc15] font-bold py-2 px-4
                             rounded-xl transition"
                        >
                          Mesa {mesa.numero_mesa}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="text-gray-400 p-4">No se encontraron resultados</div>
        )
      ) : (
        <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
          {distritos.map((d) => {
            const porcentaje =
              d.total_mesas > 0
                ? Math.round((d.digitadas / d.total_mesas) * 100)
                : 0;

            return (
              <div
                key={d.id}
                onClick={() => navigate(`/digitacion/${d.id}`)}
                className="bg-[#1f2937] p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition relative"
              >
                <h2 className="text-lg font-bold text-[#facc15] uppercase mb-4">
                  {d.nombre}
                </h2>

                <div className="space-y-1 text-sm text-gray-300">
                  <div>Total Mesas: {d.total_mesas}</div>
                  <div>Digitadas: {d.digitadas}</div>
                  <div>Pendientes: {d.pendientes}</div>
                  <div>Con Foto: {d.con_foto}</div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-[#facc15] rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <div className="text-xs text-right mt-1 text-gray-400">
                    {porcentaje}% avance
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

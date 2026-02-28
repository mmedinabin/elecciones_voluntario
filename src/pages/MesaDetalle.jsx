import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useRef } from "react";
import { getPartidosActivos } from "../services/partidosService";

export default function MesaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [partidos, setPartidos] = useState([]);
  const [votos, setVotos] = useState({});
  const [nulos, setNulos] = useState(0);
  const [blancos, setBlancos] = useState(0);
  const [mesaInfo, setMesaInfo] = useState(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const partidosData = await getPartidosActivos();
      setPartidos(partidosData);

      const { data } = await supabase
        .from("mesas")
        .select(
          `
    id,
    numero_mesa,
    habilitados,
    recintos (
      nombre,
      distrito_id
    )
  `,
        )
        .eq("id", id)
        .maybeSingle();

      setMesaInfo(data);
    } catch (error) {
      console.error(error);
    }
  }

  // Totales automáticos
  const totalValidos = Object.values(votos).reduce(
    (acc, val) => acc + (parseInt(val) || 0),
    0,
  );

  const totalGeneral =
    totalValidos + (parseInt(nulos) || 0) + (parseInt(blancos) || 0);

  const excedeHabilitados =
    mesaInfo?.habilitados && totalGeneral > mesaInfo.habilitados;

  //   async function handleGuardar() {
  //     setGuardado(true);
  //     alert("Aquí irá la lógica de guardado");
  //   }

  async function handleGuardar() {
    try {
      if (excedeHabilitados) return;
      //const user = await supabase.auth.getUser();
      //const userId = user.data.user?.id;
      const userId = "11111111-1111-1111-1111-111111111111";

      if (!userId) {
        alert("Usuario no autenticado");
        return;
      }

      // 🔹 1. Preparar resultados por partido
      const resultados = partidos.map((p) => ({
        mesa_id: Number(id),
        partido_id: p.id,
        votos: parseInt(votos[p.id] || 0),
      }));

      // 🔹 2. Insertar resultados por partido
      const { error: errorResultados } = await supabase
        .from("resultados_mesa")
        .insert(resultados);

      if (errorResultados) throw errorResultados;

      // 🔹 3. Insertar totales
      const { error: errorTotales } = await supabase
        .from("resultados_mesa_totales")
        .insert({
          mesa_id: Number(id),
          votos_validos: totalValidos,
          votos_nulos: parseInt(nulos) || 0,
          votos_blancos: parseInt(blancos) || 0,
          registrado_por: userId,
        });

      if (errorTotales) throw errorTotales;

      // 🔹 4. Cambiar estado de mesa
      await supabase
        .from("mesas")
        .update({ estado: "registrado" })
        .eq("id", id);

      setGuardado(true);
    } catch (error) {
      console.error(error);
      alert("Error al guardar resultados");
    }
  }

  if (!mesaInfo) {
    return <div className="p-8 text-white">Cargando...</div>;
  }

  const partidosOrdenados = [...partidos].sort((a, b) => a.orden - b.orden);

  const izquierda = partidosOrdenados.slice(0, 7);
  const derecha = partidosOrdenados.slice(7);

  // ORDEN VISUAL REAL (primero izquierda completa, luego derecha completa)
  const ordenVisual = [...izquierda, ...derecha];

  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray">
          Registro de Resultados — Mesa {mesaInfo.numero_mesa}
        </h1>

        <div className="text-gray-400 text-sm mt-1">
          {mesaInfo.recintos?.nombre}
        </div>

        {mesaInfo.habilitados && (
          <div className="text-xs text-gray-500 mt-1">
            Habilitados: {mesaInfo.habilitados}
          </div>
        )}
      </div>

      {/* Grid Partidos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-4">
            {izquierda.map((partido, i) => {
              const globalIndex = i; // 0–6

              return (
                <div
                  key={partido.id}
                  className="flex items-center justify-between bg-[#1f2937] px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6">
                      {partido.orden}
                    </span>
                    <span className="text-white font-bold text-lg">
                      {partido.codigo}
                    </span>
                  </div>

                  <input
                    ref={(el) => (inputRefs.current[globalIndex] = el)}
                    type="number"
                    min="0"
                    value={votos[partido.id] || ""}
                    onChange={(e) =>
                      setVotos({
                        ...votos,
                        [partido.id]: e.target.value,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const next = inputRefs.current[globalIndex + 1];
                        if (next) next.focus();
                      }
                    }}
                    className="w-20 text-center p-2 rounded-lg bg-black text-white border border-gray-600 focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>
              );
            })}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-4">
            {derecha.map((partido, i) => {
              const globalIndex = i + izquierda.length; // continúa después de 7

              return (
                <div
                  key={partido.id}
                  className="flex items-center justify-between bg-[#1f2937] px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6">
                      {partido.orden}
                    </span>
                    <span className="text-white font-bold text-lg">
                      {partido.codigo}
                    </span>
                  </div>

                  <input
                    ref={(el) => (inputRefs.current[globalIndex] = el)}
                    type="number"
                    min="0"
                    value={votos[partido.id] || ""}
                    onChange={(e) =>
                      setVotos({
                        ...votos,
                        [partido.id]: e.target.value,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const next = inputRefs.current[globalIndex + 1];
                        if (next) next.focus();
                      }
                    }}
                    className="w-20 text-center p-2 rounded-lg bg-black text-white border border-gray-600 focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= PANEL DERECHO ================= */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-700 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* NULOS */}
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-semibold">Votos Nulos</span>
              <input
                type="number"
                min="0"
                value={nulos}
                onChange={(e) => setNulos(e.target.value)}
                className="w-20 text-center p-2 rounded-lg bg-black text-white border border-gray-600"
              />
            </div>

            {/* BLANCOS */}
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-semibold">
                Votos Blancos
              </span>
              <input
                type="number"
                min="0"
                value={blancos}
                onChange={(e) => setBlancos(e.target.value)}
                className="w-20 text-center p-2 rounded-lg bg-black text-white border border-gray-600"
              />
            </div>

            <hr className="border-gray-600" />

            {/* RESUMEN */}
            <div className="flex justify-between text-gray-300">
              <span>Total Válidos</span>
              <span className="font-semibold">{totalValidos}</span>
            </div>

            <div className="flex justify-between text-white text-lg">
              <span>Total General</span>
              <span
                className={`font-bold ${
                  excedeHabilitados ? "text-red-500" : "text-[#facc15]"
                }`}
              >
                {totalGeneral}
              </span>
            </div>
            {excedeHabilitados && (
              <div className="text-red-500 text-sm font-semibold">
                ⚠ El total supera la cantidad de habilitados
              </div>
            )}

            {mesaInfo.habilitados && (
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Habilitados</span>
                <span>{mesaInfo.habilitados}</span>
              </div>
            )}
          </div>

          {/* BOTÓN ABAJO */}
          {guardado ? (
            <button
              onClick={() =>
                navigate(`/digitacion/${mesaInfo.recintos.distrito_id}`)
              }
              className="w-full py-4 rounded-2xl font-bold text-lg
               bg-green-500 text-white
               shadow-[0_15px_35px_rgba(0,0,0,0.6)]
               hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)]
               hover:-translate-y-1
               active:translate-y-0 active:scale-95
               transition-all duration-200"
            >
              Registrar Nueva Mesa
            </button>
          ) : (
            <button
              onClick={handleGuardar}
              disabled={excedeHabilitados}
              className={`w-full py-4 rounded-2xl font-bold text-lg
      shadow-[0_15px_35px_rgba(0,0,0,0.6)]
      hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)]
      hover:-translate-y-1
      active:translate-y-0 active:scale-95
      transition-all duration-200
      ${
        excedeHabilitados
          ? "bg-gray-600 cursor-not-allowed text-gray-300"
          : "bg-[#facc15] text-black"
      }`}
            >
              Guardar Resultados
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

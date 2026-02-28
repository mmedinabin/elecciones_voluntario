import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [showSelector, setShowSelector] = useState(false);
  const [avance, setAvance] = useState(null);

  useEffect(() => {
    loadDistricts();
  }, []);

  async function loadAvance(distritoId = null) {
    const { data, error } = await supabase.rpc("avance_computo", {
      distrito_id_param: distritoId,
      recinto_id_param: null,
    });

    if (!error && data?.length > 0) {
      setAvance(data[0]);
    }
  }

  async function loadDistricts() {
    const { data, error } = await supabase.from("distritos").select("*");
    if (!error) {
      setDistricts(data);
      loadResultadosTotal(); // 🔥 carga total al iniciar
    }
  }

  async function loadResultadosTotal() {
    const { data, error } = await supabase.rpc("estadistica_partidos_total");

    if (!error) {
      setData(data);
      setSelectedDistrict(null);
      loadAvance(null); // 🔥 GENERAL
    }
  }

  async function loadResultadosDistrito(districtId) {
    const { data, error } = await supabase.rpc(
      "estadistica_partidos_distrito",
      { distrito_id_param: parseInt(districtId) },
    );
    console.log(data);
    if (!error) {
      setData(data);
      setSelectedDistrict(districtId);
      loadAvance(parseInt(districtId));
    } else {
      console.error(error);
    }
  }

  // async function loadRecintos(districtId) {
  //   const { data, error } = await supabase.rpc("estadistica_recintos", {
  //     distrito_id: parseInt(districtId),
  //   });
  //   if (!error) {
  //     setData(data);
  //     setSelectedDistrict(districtId);
  //   }
  // }

  const formattedData = data.map((item) => ({
    partido_id: item.partido_id,
    codigo: item.codigo,
    porcentaje: Number(item.porcentaje),
    total_votos: Number(item.total_votos),
  }));

  const totalGeneral = formattedData.reduce(
    (acc, item) => acc + item.total_votos,
    0,
  );

  const distritoActual = districts.find(
    (d) => d.id === Number(selectedDistrict),
  );

  const totalDistrito = formattedData.reduce(
    (acc, item) => acc + item.total_votos,
    0,
  );

  const adjustedLengths = formattedData.map((item) => {
    if (item.codigo === "PATRIA-UNIDOS") {
      return 7; // longitud máxima real de cada línea
    }
    return item.codigo.length;
  });

  const maxLabelLength = Math.max(...adjustedLengths);

  const yAxisWidth = Math.min(160, Math.max(60, maxLabelLength * 8));

  return (
    <div className="p-4 space-y-6">
      <div className="bg-[#252525] p-6 rounded-3xl shadow-2xl border border-[#1f2937]">
        <div className="mb-4 space-y-2 relative">
          {/* FILA 1 */}

          {/* FILA 1 */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl text-white tracking-wide uppercase">
              {selectedDistrict
                ? `Resultados ${distritoActual?.nombre || ""}`
                : "TOTAL CONTEO RAPIDO"}
            </h2>
          </div>

          {/* <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl text-white tracking-wide uppercase">
              {selectedDistrict
                ? `Resultados ${distritoActual?.nombre || ""}`
                : "TOTAL CONTEO RAPIDO"}
            </h2>

            <div className="text-sm text-gray-300">Por distrito</div>
          </div> */}

          {/* FILA 2 */}
          <div className="flex justify-between items-center">
            {/* ACTAS */}
            {avance && (
              <div className="text-left">
                <div className="text-xs uppercase tracking-widest text-gray-400">
                  Actas Computadas
                </div>
                <div className="text-sm font-semibold text-white">
                  {avance.mesas_computadas.toLocaleString()} /{" "}
                  {avance.total_mesas.toLocaleString()} (
                  {Number(avance.porcentaje).toFixed(2)}%)
                </div>
              </div>
            )}

            {/* BOTÓN SELECTOR */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Por distrito</div>

              <button
                onClick={() => setShowSelector(!showSelector)}
                className="text-[#facc15] text-xl transition-transform duration-300 hover:scale-110"
              >
                <span
                  className={`${showSelector ? "rotate-180" : ""} inline-block transition-transform duration-300`}
                >
                  ▼
                </span>
              </button>
            </div>

            {/* Dropdown */}
            {showSelector && (
              <div className="absolute top-full -mt-2 right-0 w-72 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                {!selectedDistrict ? (
                  <select
                    onChange={(e) => {
                      loadResultadosDistrito(e.target.value);
                      setShowSelector(false);
                    }}
                    className="w-full p-3 rounded-xl bg-black text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                  >
                    <option value="">Seleccionar Distrito...</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => {
                      loadDistricts();
                      setShowSelector(false);
                    }}
                    className="w-full p-3 bg-[#facc15] text-black font-semibold rounded-xl hover:opacity-90 transition"
                  >
                    ← Volver a Distritos
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FILA 3 */}
          <div className="text-sm text-gray-300">
            <span className="uppercase tracking-widest text-gray-400">
              {selectedDistrict
                ? "Votos Emitidos Distrito"
                : "Total Votos Emitidos"}
            </span>
            <span className="ml-2 font-bold text-[#facc15] text-lg">
              {selectedDistrict
                ? totalDistrito.toLocaleString()
                : totalGeneral.toLocaleString()}
            </span>
          </div>
        </div>

        <ResponsiveContainer
          width="100%"
          height={Math.max(400, data.length * 45)}
        >
          <BarChart
            layout="vertical"
            data={formattedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <XAxis
              type="number"
              hide
              domain={[
                0,
                (dataMax) => {
                  return dataMax + dataMax * 0.15; // 15% espacio extra
                },
              ]}
            />
            {!selectedDistrict ? (
              // 🔹 Vista Distritos
              <YAxis
                dataKey="codigo"
                type="category"
                width={yAxisWidth}
                tickLine={false}
                axisLine={false}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const text = payload.value;

                  const isPatriaUnidos = text === "PATRIA-UNIDOS";

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-5}
                        y={0}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill="#94a3b8"
                        fontSize={isPatriaUnidos ? 10 : 12}
                        fontWeight="500"
                      >
                        {isPatriaUnidos ? (
                          <>
                            <tspan x={-5} dy="-6">
                              PATRIA
                            </tspan>
                            <tspan x={-5} dy="12">
                              UNIDOS
                            </tspan>
                          </>
                        ) : (
                          text
                        )}
                      </text>
                    </g>
                  );
                }}
              />
            ) : (
              // <YAxis dataKey="codigo" type="category" width={60} />
              // 🔹 Vista Recintos
              <YAxis
                dataKey="codigo"
                type="category"
                width={140}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const text = payload.value;

                  const truncated =
                    text.length > 18 ? text.substring(0, 18) + "…" : text;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <title>{text}</title>
                      <text
                        x={-5}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        fill="#eab308"
                        fontSize="12"
                      >
                        {truncated}
                      </text>
                    </g>
                  );
                }}
              />
            )}

            {/* <Tooltip /> */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #facc15",
                borderRadius: "12px",
                color: "#fff",
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "#facc15", fontWeight: 600 }}
            />

            <Bar
              dataKey="porcentaje"
              fill="#eab308"
              radius={[0, 8, 8, 0]}
              barSize={30}
              label={(props) => {
                const { x, y, width, height, value, index } = props;

                const row = formattedData[index];
                if (!row) return null;

                const text = `${value.toFixed(2)}% (${row.total_votos.toLocaleString()})`;

                // estimación aproximada: 7px por caracter
                const estimatedTextWidth = text.length * 7;

                const fitsInside = width > estimatedTextWidth + 20;

                return (
                  <text
                    x={fitsInside ? x + width - 10 : x + width + 8}
                    y={y + height / 2}
                    textAnchor={fitsInside ? "end" : "start"}
                    dominantBaseline="middle"
                    fill={fitsInside ? "#0f0f0f" : "#facc15"}
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                  >
                    {text}
                  </text>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../services/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Cell } from "recharts";
import { DISTRITOS } from "../constants/distritos";

export default function Dashboard() {
  const [data, setData] = useState([]);
  //const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [showSelector, setShowSelector] = useState(false);
  const [avance, setAvance] = useState(null);
  const [districts] = useState(DISTRITOS);

  useEffect(() => {
    loadInitialData();
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

  async function loadInitialData() {
    const [ totalRes, avanceRes] = await Promise.all([
      supabase.rpc("estadistica_partidos_total"),
      supabase.rpc("avance_computo", {
        distrito_id_param: null,
        recinto_id_param: null,
      }),
    ]);
    if (!totalRes.error) setData(totalRes.data);
    if (!avanceRes.error && avanceRes.data?.length > 0)
      setAvance(avanceRes.data[0]);
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

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      partido_id: item.partido_id,
      codigo: item.codigo,
      porcentaje: Number(item.porcentaje),
      total_votos: Number(item.total_votos),
    }));
  }, [data]);

  const totalEmitido = useMemo(() => {
    return formattedData.reduce((acc, item) => acc + item.total_votos, 0);
  }, [formattedData]);

  const distritoActual = districts.find(
    (d) => d.id === Number(selectedDistrict),
  );

  const adjustedLengths = formattedData.map((item) => {
    if (item.codigo === "PATRIA-UNIDOS") {
      return 7; // longitud máxima real de cada línea
    }
    return item.codigo.length;
  });

  const maxLabelLength = Math.max(...adjustedLengths);

  const yAxisWidth = Math.min(160, Math.max(60, maxLabelLength * 8));

  const coloresPartidos = {
    ASIP: "#29d1c3",
    NGP: "#4c7eeb",
    SPT: "#4bce51",
    FE: "#19a743",
    UN: "#fce410",
    "PATRIA-UNIDOS": "#fc7c13",
    TODOS: "#61e226",
    VOS: "#f5327d",
    SOL: "#c5510d",
    UNIDOS: "#2496f3",
    PSC: "#b6cac9",
    MTS: "#306938",
    "A-UPP": "#cfa242",
    PDC: "#ac2a21",
  };

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

          <div className="flex justify-between items-center">
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

          <div className="text-sm text-gray-300">
            <span className="uppercase tracking-widest text-gray-400">
              {selectedDistrict
                ? "Votos Emitidos Distrito"
                : "Total Votos Emitidos"}
            </span>
            <span className="ml-2 font-bold text-[#facc15] text-lg">
              {totalEmitido.toLocaleString()}
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
              radius={[0, 8, 8, 0]}
              barSize={30}
              label={(props) => {
                const { x, y, width, height, value, index } = props;

                const row = formattedData[index];
                if (!row) return null;

                const text = `${value.toFixed(2)}% (${row.total_votos.toLocaleString()})`;

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
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={coloresPartidos[entry.codigo] || "#eab308"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

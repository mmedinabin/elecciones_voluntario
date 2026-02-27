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

  useEffect(() => {
    loadDistricts();
  }, []);

  async function loadDistricts() {
    const { data, error } = await supabase.rpc("estadistica_distritos");
    if (!error) {
      setData(data);
      setDistricts(data);
      setSelectedDistrict(null);
    }
  }

  async function loadRecintos(districtId) {
    const { data, error } = await supabase.rpc("estadistica_recintos", {
      distrito_id: parseInt(districtId),
    });
    if (!error) {
      setData(data);
      setSelectedDistrict(districtId);
    }
  }

  const formattedData = data.map((item) => ({
    ...item,
    porcentaje: Number(item.porcentaje),
    total_habilitados: Number(item.total_habilitados),
    nombre_corto: String(item.nombre).replace("DISTRITO ", "D"),
  }));

  const totalGeneral = formattedData.reduce(
    (acc, item) => acc + Number(item.total_habilitados || 0),
    0,
  );

  const distritoActual = districts.find(
    (d) => d.id === Number(selectedDistrict),
  );

  const totalDistrito = distritoActual?.total_habilitados || 0;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-[#252525] p-6 rounded-3xl shadow-2xl border border-[#1f2937]">
        <div className="relative flex items-center justify-between">
          <h2 className="font-bold text-xl text-white tracking-wide uppercase">
            {selectedDistrict
              ? `Distribución ${distritoActual?.nombre || ""}`
              : "Distribución por Distrito"}
          </h2>

          {/* Botón flecha */}
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

          {/* Dropdown */}
          {showSelector && (
            <div className="absolute top-12 right-0 w-72 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
              {!selectedDistrict ? (
                <select
                  onChange={(e) => {
                    loadRecintos(e.target.value);
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

        {/* <h2 className="font-bold text-xl text-white tracking-wide uppercase">
          {selectedDistrict
            ? `DISTRIBUCION  ${distritoActual?.nombre || ""}`
            : "DISTRIBUCION POR DISTRITO"}
        </h2> */}

        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-gray-400">
            {selectedDistrict ? "Total Distrito" : "Total General"}
          </span>
          <div className="text-4xl font-extrabold text-[#facc15] mt-1">
            {selectedDistrict
              ? totalDistrito.toLocaleString()
              : totalGeneral.toLocaleString()}
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
              <YAxis dataKey="nombre_corto" type="category" width={60} />
            ) : (
              // 🔹 Vista Recintos
              <YAxis
                dataKey="nombre_corto"
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
                        //fill="#444"
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
              //fill="#2563eb"
              //fill="#facc15"
              fill="#eab308"
              radius={[0, 8, 8, 0]}
              barSize={30}
              label={(props) => {
                const { x, y, width, height, value, index } = props;

                const row = formattedData[index];
                if (!row) return null;

                const text = `${value.toFixed(2)}% (${row.total_habilitados.toLocaleString()})`;

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

      {/* <div className="space-y-3">
        {!selectedDistrict ? (
          <select
            onChange={(e) => loadRecintos(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#facc15]"
          >
            <option value="">Ver recintos por distrito...</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={loadDistricts}
            className="w-full p-3 bg-[#facc15] text-black font-semibold rounded-2xl hover:opacity-90 transition"
          >
            ← Volver a distritos
          </button>
        )}
      </div> */}
    </div>
  );
}

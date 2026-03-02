// pages/RegistroVoluntario.jsx
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function RegistroVoluntario() {
  const navigate = useNavigate();

  const [modo, setModo] = useState("manual");

  const [recintos, setRecintos] = useState([]);
  const [mesas, setMesas] = useState([]);

  const [selectedRecinto, setSelectedRecinto] = useState("");
  const [selectedMesa, setSelectedMesa] = useState("");

  const [ci, setCi] = useState("");
  const [error, setError] = useState("");

  const [recintoQuery, setRecintoQuery] = useState("");
  const [filteredRecintos, setFilteredRecintos] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadConfig();
    loadRecintos();
  }, []);

  useEffect(() => {
    if (!recintoQuery) {
      setFilteredRecintos(recintos);
      return;
    }

    const filtered = recintos.filter((r) =>
      r.nombre.toLowerCase().includes(recintoQuery.toLowerCase()),
    );

    setFilteredRecintos(filtered);
  }, [recintoQuery, recintos]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".recinto-container")) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function loadConfig() {
    const { data } = await supabase
      .from("configuracion")
      .select("valor")
      .eq("clave", "modo_validacion")
      .single();

    if (data) setModo(data.valor);
  }

  async function loadRecintos() {
    const { data } = await supabase
      .from("recintos")
      .select("id, nombre")
      .order("nombre");

    setRecintos(data || []);
  }

  async function loadMesas(recintoId) {
    const { data } = await supabase
      .from("mesas")
      .select("id, numero_mesa")
      .eq("recinto_id", recintoId)
      .order("numero_mesa");

    setMesas(data || []);
  }

  const normalizar = (doc) => doc.replace(/\s+/g, "").toUpperCase();

  async function handleSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ciNorm = normalizar(ci);

    // 🔵 MODO PADRON
    if (modo === "padron") {
      const { data: registro } = await supabase
        .from("padron")
        .select("mesa_id")
        .eq("numero_documento_norm", ciNorm)
        .single();

      if (!registro) {
        setError("No encontrado en padrón.");
        return;
      }

      await supabase
        .from("voluntarios")
        .update({
          numero_documento_raw: ci,
          numero_documento_norm: ciNorm,
          mesa_id: registro.mesa_id,
          estado_validacion: "validado",
        })
        .eq("usuario_id", user.id);

      return navigate("/upload");
    }

    // 🟡 MODO MANUAL
    if (!selectedRecinto || !selectedMesa) {
      setError("Debe seleccionar recinto y mesa.");
      return;
    }

    await supabase
      .from("voluntarios")
      .update({
        numero_documento_raw: ci,
        numero_documento_norm: ciNorm,
        mesa_id: selectedMesa, // ← ID REAL
        estado_validacion: "manual",
      })
      .eq("usuario_id", user.id);

    navigate("/upload");
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-lg font-bold">Registro Voluntario</h2>

      <input
        placeholder="Número de Documento"
        value={ci}
        onChange={(e) => setCi(e.target.value)}
        className="w-full p-3 rounded-xl bg-white border border-gray-600"
      />

      {modo === "manual" && (
        <button
          type="button"
          onClick={() => {
            window.open(
              "https://yoparticipo.oep.org.bo/",
              "consulta_padron",
              "width=900,height=700,scrollbars=yes,resizable=yes",
            );
          }}
          className="w-full p-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          Consultar recinto y mesa en padrón oficial
        </button>
      )}

      {modo === "manual" && (
        <>
          {/* RECINTO */}

          <div className="relative recinto-container">
            <input
              type="text"
              placeholder="Buscar recinto..."
              value={recintoQuery}
              onChange={(e) => {
                setRecintoQuery(e.target.value);
                setShowDropdown(true);
                setSelectedRecinto("");
                setSelectedMesa("");
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-3 rounded-xl bg-white border border-gray-600"
            />

            {showDropdown && filteredRecintos.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-[#111827] border border-gray-700 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
                {filteredRecintos.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRecinto(r.id);
                      setRecintoQuery(r.nombre);
                      setShowDropdown(false);
                      loadMesas(r.id);
                    }}
                    className="p-3 text-sm text-gray-300 hover:bg-[#1f2937] cursor-pointer"
                  >
                    {r.nombre}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MESA */}
          <select
            disabled={!selectedRecinto}
            value={selectedMesa}
            onChange={(e) => setSelectedMesa(parseInt(e.target.value))}
            className="w-full p-3 rounded-xl bg-white border border-gray-600"
          >
            <option value="">Seleccionar mesa...</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>
                Mesa {m.numero_mesa}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        onClick={handleSubmit}
        className="w-full p-3 bg-[#facc15] rounded-xl font-bold"
      >
        Continuar
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

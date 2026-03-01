import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { DISTRITOS } from "../constants/distritos";
import { useRef } from "react";

export default function Upload() {
  const [user, setUser] = useState(null);

  const [recintos, setRecintos] = useState([]);
  const [mesas, setMesas] = useState([]);

  const [recintoQuery, setRecintoQuery] = useState("");
  const [filteredRecintos, setFilteredRecintos] = useState([]);
  const [showRecintoDropdown, setShowRecintoDropdown] = useState(false);

  const [selectedRecinto, setSelectedRecinto] = useState("");
  const [selectedMesa, setSelectedMesa] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [actas, setActas] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    loadInitial();
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
        setShowRecintoDropdown(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function loadInitial() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      loadActas(data.user.id);
    }

    const { data: recintosData } = await supabase
      .from("recintos")
      .select("id,nombre, distrito_id")
      .order("nombre");

    setRecintos(recintosData || []);
  }

  async function loadMesas(recintoId) {
    setSelectedMesa("");
    const { data } = await supabase
      .from("mesas")
      .select("id,numero_mesa")
      .eq("recinto_id", recintoId)
      .order("numero_mesa");

    setMesas(data || []);
  }

  async function loadActas(userId) {
    const { data } = await supabase
      .from("fotos_mesa")
      .select("id, mesa_id, url, created_at")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });

    setActas(data || []);
  }

  async function handleUpload() {
    if (!selectedMesa || !file) {
      setMessage("Debe seleccionar mesa e imagen.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (file.size > 5 * 1024 * 1024) {
        setMessage("La imagen no puede superar 5MB.");
        setLoading(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedMesa}-${Date.now()}.${fileExt}`;
      const filePath = `mesa-${selectedMesa}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("actas")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("actas")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from("fotos_mesa").insert({
        mesa_id: parseInt(selectedMesa),
        usuario_id: user.id,
        origen: "voluntario",
        url: publicUrl,
      });

      if (dbError) throw dbError;

      setMessage("Acta subida correctamente.");
      setFile(null);
      setSelectedMesa("");
      loadActas(user.id);
    } catch (err) {
      console.error(err);
      setMessage("Error al subir acta.");
    } finally {
      setLoading(false);
    }
  }

  function getDistritoNombre(distritoId) {
    const distrito = DISTRITOS.find((d) => d.id === distritoId);
    return distrito ? distrito.nombre : "";
  }

  return (
    <div className="p-4 pb-28 space-y-6">
      <h2 className="text-xl font-bold text-gray">Subir Acta</h2>

      {/* 🔎 Recinto con buscador */}
      <div className="relative recinto-container">
        <label className="text-sm text-gray-400">Recinto</label>

        <div className="relative mt-1">
          <input
            type="text"
            placeholder="Buscar recinto..."
            value={recintoQuery}
            onChange={(e) => {
              setRecintoQuery(e.target.value);
              setShowRecintoDropdown(true);
              setSelectedRecinto("");
              setSelectedMesa("");
            }}
            onFocus={() => setShowRecintoDropdown(true)}
            className="w-full p-3 pr-10 rounded-xl bg-black text-white border border-gray-600 focus:border-[#facc15] outline-none"
          />

          {/* Botón limpiar */}
          {selectedRecinto && (
            <button
              onClick={() => {
                setSelectedRecinto("");
                setRecintoQuery("");
                setFilteredRecintos(recintos);
                setShowRecintoDropdown(true);
                setMesas([]);
                setSelectedMesa("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showRecintoDropdown && filteredRecintos.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-[#111827] border border-gray-700 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
            {filteredRecintos.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  const distritoNombre = getDistritoNombre(r.distrito_id);

                  setSelectedRecinto(r.id);
                  setRecintoQuery(`${r.nombre} — ${distritoNombre}`);
                  setShowRecintoDropdown(false);
                  loadMesas(r.id);
                }}
                className="p-3 text-sm text-gray-300 hover:bg-[#1f2937] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.nombre}</span>
                  <span className="text-xs text-gray-500">
                    ({getDistritoNombre(r.distrito_id)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🗳 Mesa */}
      {selectedRecinto && (
        <div>
          <label className="text-sm text-gray-400">Mesa</label>
          <select
            value={selectedMesa}
            onChange={(e) => setSelectedMesa(e.target.value)}
            className="appearance-none w-full mt-1 p-3 rounded-xl bg-black text-white border border-gray-600"
          >
            <option value="">Seleccionar mesa...</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>
                Mesa {m.numero_mesa}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 📷 Imagen */}
      <div>
        <label className="text-sm text-gray-400">Imagen del Acta</label>

        <label className="cursor-pointer block mt-1 p-3 rounded-xl bg-black text-gray-400 border border-gray-600 hover:border-[#facc15] transition text-center">
          {file ? "Imagen seleccionada" : "Seleccionar o tomar foto"}
          {/* <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          /> */}

          {/* Input Cámara */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          {/* Input Galería */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current.click()}
              className="flex-1 p-3 bg-[#1f2937] text-white rounded-xl active:scale-95 transition"
            >
              📷 Cámara
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current.click()}
              className="flex-1 p-3 bg-[#1f2937] text-white rounded-xl active:scale-95 transition"
            >
              🖼 Galería
            </button>
          </div>
        </label>
      </div>

      {/* Preview controlado */}
      {file && (
        <div className="space-y-2">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded-xl border border-gray-700"
          />

          <div className="text-center text-sm text-gray-400">{file.name}</div>

          <button
            onClick={() => setFile(null)}
            className="text-sm text-red-400 block mx-auto"
          >
            Cambiar imagen
          </button>
        </div>
      )}

      {/* Botón subir */}
      <button
        onClick={handleUpload}
        disabled={!selectedMesa || !file || loading}
        className="w-full p-4 bg-[#facc15] text-black font-bold rounded-2xl active:scale-95 transition disabled:opacity-50"
      >
        {loading ? "Subiendo..." : "Subir Acta"}
      </button>

      {loading && (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {message && (
        <p className="text-sm text-center text-gray-300">{message}</p>
      )}

      {/* 📂 Actas Subidas */}
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Actas Subidas</h3>

        {actas.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Aún no subiste ninguna acta.
          </div>
        ) : (
          actas.map((acta) => (
            <div
              key={acta.id}
              className="bg-[#1f1f1f] p-3 rounded-xl mb-3 border border-[#2c2c2c]"
            >
              <div className="flex justify-between text-sm text-gray-300">
                <span>Mesa {acta.mesa_id}</span>
                <span>{new Date(acta.created_at).toLocaleString()}</span>
              </div>
              <img
                src={acta.url}
                alt="Acta"
                className="w-full mt-2 max-h-48 object-contain rounded-lg"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { DISTRITOS } from "../constants/distritos";
import { useRef } from "react";
import imageCompression from "browser-image-compression";

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
  //const [actas, setActas] = useState([]);
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

  //LOGIN
  useEffect(() => {
    async function devLogin() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) return;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@dev.com",
        password: "12345678",
      });

      console.log(data, error);
    }

    devLogin();
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

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("Usuario no autenticado.");
        return;
      }

      // 🔹 Comprimir a WebP
      const optimizedFile = await compressToWebP(file);

      // 🔹 Nombre único
      const fileName = `mesa-${selectedMesa}-${Date.now()}.webp`;
      const filePath = `${user.id}/${fileName}`;

      // 🔹 Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from("actas")
        .upload(filePath, optimizedFile, {
          contentType: "image/webp",
        });

      if (uploadError) throw uploadError;

      // 🔹 Insertar solo el path
      const { error: insertError } = await supabase.from("fotos_mesa").insert({
        mesa_id: parseInt(selectedMesa),
        usuario_id: user.id,
        origen: "voluntario",
        url: filePath,
      });

      if (insertError) throw insertError;

      setMessage("Acta subida correctamente.");
      setFile(null);
      setSelectedMesa("");
    } catch (error) {
      console.error("Error upload:", error);
      setMessage("Error al subir acta.");
    } finally {
      setLoading(false);
    }
  }
  function getDistritoNombre(distritoId) {
    const distrito = DISTRITOS.find((d) => d.id === distritoId);
    return distrito ? distrito.nombre : "";
  }

  async function compressToWebP(file) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.7,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error comprimiendo:", error);
      return file;
    }
  }

  async function loadActas() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const { data, error } = await supabase
      .from("fotos_mesa")
      .select("id, mesa_id, url, created_at")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setActas(data);
  }

  async function handleDownload(filePath) {
    const { data, error } = await supabase.storage
      .from("actas")
      .createSignedUrl(filePath, 60);

    if (error) {
      console.error(error);
      return;
    }

    const response = await fetch(data.signedUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filePath.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 pb-40 space-y-6">
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

      <div className="bg-black border border-[#facc15] rounded-2xl p-4">
        <div className="text-sm text-gray-400 mb-4 text-center">
          Seleccionar imagen
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
              e.target.value = null;
            }
          }}
          className="hidden"
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
              e.target.value = null;
            }
          }}
          className="hidden"
        />

        <div className="flex justify-center gap-8">
          {/* Cámara */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => cameraInputRef.current.click()}
              className="w-16 h-16 rounded-full bg-[#1f2937] 
                   flex items-center justify-center 
                   text-2xl text-white
                   active:scale-95 transition"
            >
              📷
            </button>
            {/* <span className="text-xs text-gray-400 mt-2">Cámara</span> */}
          </div>

          {/* Galería */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => galleryInputRef.current.click()}
              className="w-16 h-16 rounded-full bg-[#1f2937] 
                   flex items-center justify-center 
                   text-2xl text-white
                   active:scale-95 transition"
            >
              🖼
            </button>
            {/* <span className="text-xs text-gray-400 mt-2">Galería</span> */}
          </div>
        </div>
      </div>

      {/* Preview controlado */}
      {file && (
        <div className="space-y-2">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full max-h-52 object-contain rounded-xl border border-gray-700"
            // className="w-full max-h-64 object-contain rounded-xl border border-gray-700"
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
      <div
        className={`fixed bottom-20 left-0 right-0 px-4 transition-all duration-300
  ${
    file && selectedMesa
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-10 pointer-events-none"
  }`}
      >
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full p-4 bg-[#facc15] text-black font-bold 
               rounded-2xl shadow-xl
               active:scale-95 transition
               disabled:opacity-50"
        >
          {loading ? "Subiendo..." : "Subir Acta"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {message && (
        <p className="text-sm text-center text-gray-300">{message}</p>
      )}

      {/* 📂 Actas Subidas Solo mesa propia*/}
      {/* <div className="pt-6">
        {actas.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Aún no subiste ninguna acta.
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray mb-3">
              Actas Subidas (Mesa {actas[0].mesa_id})
            </h3>

            {actas.map((acta, index) => (
              <div
                key={acta.id}
                className="flex justify-between items-center 
                     bg-[#1f1f1f] p-3 rounded-xl mb-3 
                     border border-[#2c2c2c]"
              >
                <div className="text-sm text-gray-300">
                  #{index + 1} - Foto {index + 1}
                </div>

                <button
                  onClick={() => handleDownload(acta.url)}
                  className="text-[#facc15] text-sm font-medium"
                >
                  Descargar
                </button>
              </div>
            ))}
          </>
        )}
      </div> */}

      {/* 📂 Actas Subidas prueba Dev*/}
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Actas Subidas</h3>

        {actas.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Aún no subiste ninguna acta.
          </div>
        ) : (
          actas.map((acta, index) => (
            <div
              key={acta.id}
              className="flex justify-between items-center 
                   bg-[#1f1f1f] p-3 rounded-xl mb-3 
                   border border-[#2c2c2c]"
            >
              <div className="text-sm text-gray-300">
                #{index + 1} — Mesa {acta.mesa_id}
              </div>

              <button
                onClick={() => handleDownload(acta.url)}
                className="text-[#facc15] text-sm font-medium"
              >
                Descargar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { supabase } from "../services/supabase";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const loginManual = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const rol = data.user.app_metadata?.role;

    if (rol === "digitador") navigate("/digitacion");
    else if (rol === "admin") navigate("/dashboard");
    else if (rol === "voluntario") navigate("/upload");
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-2xl p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          <span className="text-[#facc15]">Ingreso</span> Plataforma Electoral
        </h1>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
        >
          <Chrome size={20} />
          Ingresar con Google
        </button>

        <div className="text-center text-gray-500 text-sm">o</div>

        {/* Manual */}
        <input
          placeholder="Correo institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-white border"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-white border"
        />

        <button
          onClick={loginManual}
          className="w-full bg-[#facc15] py-3 rounded-xl font-bold"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
}

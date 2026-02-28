import { supabase } from "./supabase"

export async function getPartidosActivos() {
  const { data, error } = await supabase
    .from("partidos")
    .select("id, nombre, codigo, logo_path, orden")
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) throw error
  return data
}
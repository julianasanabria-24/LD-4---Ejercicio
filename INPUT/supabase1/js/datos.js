// 3° Capa de datos: todas las consultas a Supabase pasan por aquí.
// Cambia TABLA por el nombre de tu tabla en Supabase.
const TABLA = 'registros';

const Datos = {
  async listar() {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async obtener(id) {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async crear(registro) {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .insert(registro)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async actualizar(id, cambios) {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .update(cambios)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async eliminar(id) {
    const { error } = await supabaseClient
      .from(TABLA)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

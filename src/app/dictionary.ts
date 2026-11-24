/** Small offline fallback; the complete dictionary lives in a lazy-loaded chunk. */
export const palabrasRespaldo = [
  'casa', 'cañón', 'árbol', 'puerta', 'jardín', 'lápiz', 'montaña', 'pingüino',
  'mariposa', 'biblioteca', 'elefante', 'ventana', 'computadora', 'programación',
  'murciélago', 'extraordinario', 'electricidad', 'conocimiento', 'rompecabezas'
] as const;

export async function cargarDiccionario(): Promise<readonly string[]> {
  const modulo = await import('an-array-of-spanish-words');
  if (!Array.isArray(modulo.default) || modulo.default.length === 0) {
    throw new Error('Diccionario no disponible');
  }
  return modulo.default;
}

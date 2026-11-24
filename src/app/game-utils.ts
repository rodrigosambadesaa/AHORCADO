/** Spanish vowels ignore accents; ñ is a distinct letter. */
export function normalizarLetra(valor: string): string {
  return valor.trim().normalize('NFC').toLowerCase()
    .replace(/[áéíóúü]/g, letra => (('aeiouu')['áéíóúü'.indexOf(letra)] ?? letra));
}

export function esPalabraJugable(valor: string): boolean {
  return /^[a-záéíóúüñ]{4,14}$/i.test(valor.normalize('NFC'));
}

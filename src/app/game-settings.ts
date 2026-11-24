import { esPalabraJugable } from './game-utils';

export const dificultades = {
  clasico: { min: 4, max: 14, respaldo: 'ahorcado', etiqueta: 'Clásico (4–14 letras)' },
  corto: { min: 4, max: 6, respaldo: 'casa', etiqueta: 'Palabras cortas (4–6)' },
  medio: { min: 7, max: 10, respaldo: 'ahorcado', etiqueta: 'Palabras medias (7–10)' },
  largo: { min: 11, max: 14, respaldo: 'programación', etiqueta: 'Palabras largas (11–14)' },
} as const;
export type Dificultad = keyof typeof dificultades;
export const opcionesDificultad = Object.keys(dificultades) as Dificultad[];

export function elegirPalabra(diccionario: readonly string[], dificultad: Dificultad, aleatorio = Math.random): string {
  const { min, max, respaldo } = dificultades[dificultad];
  for (let i = 0; i < 8000 && diccionario.length > 0; i++) {
    const palabra = (diccionario[Math.floor(aleatorio() * diccionario.length)] ?? '').trim().normalize('NFC').toLowerCase();
    if (palabra.length >= min && palabra.length <= max && esPalabraJugable(palabra)) return palabra;
  }
  return respaldo;
}

export interface Estadisticas {
  ganadas: number;
  perdidas: number;
  racha: number;
  mejorRacha: number;
}
export const claveEstadisticas = 'ahorcado.estadisticas.v1';
export function estadisticasVacias(): Estadisticas {
  return { ganadas: 0, perdidas: 0, racha: 0, mejorRacha: 0 };
}

export function leerEstadisticas(raw: string | null): Estadisticas {
  try {
    const valor: unknown = JSON.parse(raw ?? 'null');
    if (typeof valor !== 'object' || valor === null) return estadisticasVacias();
    const v = valor as Record<keyof Estadisticas, unknown>;
    const numero = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n < 1_000_000_000;
    const { ganadas, perdidas, racha, mejorRacha } = v;
    if (numero(ganadas) && numero(perdidas) && numero(racha) && numero(mejorRacha) &&
        racha <= mejorRacha && mejorRacha <= ganadas) {
      return { ganadas, perdidas, racha, mejorRacha };
    }
  } catch { /* corrupted or unavailable data */ }
  return estadisticasVacias();
}

export function registrarResultado(actual: Estadisticas, victoria: boolean): Estadisticas {
  const incrementar = (n: number) => Math.min(n + 1, 999_999_999);
  const racha = victoria ? incrementar(actual.racha) : 0;
  return {
    ganadas: victoria ? incrementar(actual.ganadas) : actual.ganadas,
    perdidas: victoria ? actual.perdidas : incrementar(actual.perdidas),
    racha,
    mejorRacha: Math.max(actual.mejorRacha, racha)
  };
}

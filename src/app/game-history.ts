import { Dificultad, dificultades } from './game-settings';
import { esPalabraJugable } from './game-utils';

export const claveHistorial = 'ahorcado.historial.v1';
export const limiteHistorial = 50;
export interface Partida {
  palabra: string;
  victoria: boolean;
  fallos: number;
  dificultad: Dificultad;
  fecha: number;
}
export function leerHistorial(raw: string | null): Partida[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(data)) return [];
    const validas: Partida[] = [];
    for (const p of data.slice(0, limiteHistorial)) {
      if (!p || typeof p !== 'object' || typeof p.palabra !== 'string' ||
          !esPalabraJugable(p.palabra) || typeof p.victoria !== 'boolean' ||
          !Number.isInteger(p.fallos) || p.fallos < 0 || p.fallos > 7 ||
          (p.victoria ? p.fallos === 7 : p.fallos !== 7) ||
          typeof p.dificultad !== 'string' ||
          !Object.prototype.hasOwnProperty.call(dificultades, p.dificultad) ||
          !Number.isSafeInteger(p.fecha) || p.fecha < 0 || p.fecha > 8640000000000000) continue;
      validas.push({palabra: p.palabra, victoria: p.victoria, fallos: p.fallos, dificultad: p.dificultad, fecha: p.fecha});
    }
    return validas;
  } catch { return []; }
}
export function registrarPartida(historial: readonly Partida[], partida: Partida): Partida[] {
  return [partida, ...historial].slice(0, limiteHistorial);
}

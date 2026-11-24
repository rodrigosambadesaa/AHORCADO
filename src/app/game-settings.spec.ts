import { dificultades, elegirPalabra, estadisticasVacias, leerEstadisticas, opcionesDificultad, registrarResultado } from './game-settings';

describe('Configuración del juego', () => {
  it('selecciona una palabra de longitud válida', () => {
    expect(elegirPalabra(['sol', 'casa', 'programación'], 'corto', () => .5)).toBe('casa');
    expect(elegirPalabra(['programación'], 'largo', () => 0)).toBe('programación');
  });

  it('tiene un respaldo válido para cada dificultad', () => {
    for (const modo of opcionesDificultad) {
      const palabra = elegirPalabra([], modo);
      expect(palabra.length).toBeGreaterThanOrEqual(dificultades[modo].min);
      expect(palabra.length).toBeLessThanOrEqual(dificultades[modo].max);
    }
  });

  it('rechaza datos locales inválidos o incoherentes', () => {
    for (const dato of [null, 'null', '{', '[]', '{"ganadas":-1}', '{"ganadas":1,"perdidas":0,"racha":2,"mejorRacha":2}']) {
      expect(leerEstadisticas(dato)).toEqual(estadisticasVacias());
    }
  });

  it('mantiene rachas y conserva la mejor después de perder', () => {
    let stats = estadisticasVacias();
    stats = registrarResultado(stats, true);
    stats = registrarResultado(stats, true);
    stats = registrarResultado(stats, false);
    expect(stats).toEqual({ganadas: 2, perdidas: 1, racha: 0, mejorRacha: 2});
    expect(leerEstadisticas(JSON.stringify(stats))).toEqual(stats);
    expect(registrarResultado(stats, true).racha).toBe(1);
  });
});

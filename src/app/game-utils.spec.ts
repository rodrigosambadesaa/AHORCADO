import { esPalabraJugable, normalizarLetra } from './game-utils';

describe('Reglas del diccionario', () => {
  it('normaliza vocales, mayúsculas y Unicode descompuesto', () => {
    expect(['Á', 'é', 'I\u0301', 'Ó', 'Ú', 'Ü'].map(normalizarLetra)).toEqual(['a','e','i','o','u','u']);
    expect(normalizarLetra(' N\u0303 ')).toBe('ñ');
  });

  it('distingue n y ñ', () => {
    expect(normalizarLetra('N')).toBe('n');
    expect(normalizarLetra('Ñ')).toBe('ñ');
  });

  it('acepta solo palabras españolas de 4 a 14 letras', () => {
    for (const palabra of ['cañón', 'pingüino', 'nin\u0303era', 'a'.repeat(14)]) {
      expect(esPalabraJugable(palabra)).toBeTrue();
    }
    for (const palabra of ['', 'sol', 'a'.repeat(15), 'hola mundo', '1234', 'a-b-c', '🙂hola']) {
      expect(esPalabraJugable(palabra)).toBeFalse();
    }
  });
});

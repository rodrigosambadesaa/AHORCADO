import { leerHistorial, registrarPartida, Partida } from './game-history';
describe('Historial de partidas', () => {
  const partida: Partida = {palabra: 'cañón', victoria: true, fallos: 2, dificultad: 'clasico', fecha: 12345};
  it('recupera una partida válida', () => expect(leerHistorial(JSON.stringify([partida]))).toEqual([partida]));
  it('rechaza datos corruptos y entradas inconsistentes', () => {
    for (const raw of [null, '{', '{}', 'null']) expect(leerHistorial(raw)).toEqual([]);
    expect(leerHistorial(JSON.stringify([null, {...partida, palabra: '<script>'}, {...partida, dificultad: '__proto__'}, {...partida, fallos: 7}, {...partida, victoria: false}, {...partida, fecha: -1}]))).toEqual([]);
  });
  it('limita a 50 resultados y conserva el más reciente primero', () => {
    let h: Partida[] = [];
    for (let i=0; i<60; i++) h = registrarPartida(h, {...partida, fecha: i});
    expect(h.length).toBe(50);
    expect(h[0].fecha).toBe(59);
    expect(h[49].fecha).toBe(10);
  });
});

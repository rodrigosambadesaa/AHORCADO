import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { claveEstadisticas } from './game-settings';

describe('Ahorcado', () => {
  let juego: AppComponent;
  beforeEach(() => {
    localStorage.removeItem(claveEstadisticas);
    juego = new AppComponent();
    spyOn<any>(juego, 'obtenerPalabraValida').and.returnValue('cañón');
    juego.nuevaPartida();
  });

  afterEach(() => localStorage.removeItem(claveEstadisticas));

  it('inicia con la palabra oculta y sin fallos', () => {
    expect(juego.palabraOculta).toEqual(['_', '_', '_', '_', '_']);
    expect(juego.progreso).toBe(0);
    expect(juego.juegoTerminado).toBeFalse();
  });

  it('distingue N y Ñ, incluso descompuesta', () => {
    juego.probarDesdeTeclado('N');
    expect(juego.palabraOculta).toEqual(['_', '_', '_', '_', 'N']);
    expect(juego.letraUsada('Ñ')).toBeFalse();
    juego.probarDesdeTeclado('N\u0303');
    expect(juego.palabraOculta).toEqual(['_', '_', 'Ñ', '_', 'N']);
    expect(juego.fallos).toBe(0);
  });

  it('revela tildes y completa la victoria', () => {
    for (const letra of ['c','a','ñ','o','n']) juego.probarDesdeTeclado(letra);
    expect(juego.palabraOculta.join('')).toBe('CAÑÓN');
    expect(juego.progreso).toBe(100);
    expect(juego.juegoGanado).toBeTrue();
    juego.probarDesdeTeclado('z');
    expect(juego.fallos).toBe(0);
  });

  it('ignora repeticiones e intentos inválidos', () => {
    for (const letra of ['z','Z','12','ab','!', '', '😀']) juego.probarDesdeTeclado(letra);
    expect(juego.fallos).toBe(1);
    juego.probarDesdeTeclado('Ó');
    juego.probarDesdeTeclado('o');
    expect(juego.letrasAdivinadas.size).toBe(1);
  });

  it('pierde al séptimo fallo, revela la solución y bloquea más intentos', () => {
    for (const letra of ['b','d','e','f','g','h','i']) juego.probarDesdeTeclado(letra);
    expect(juego.juegoPerdido).toBeTrue();
    expect(juego.parteVisible(6)).toBeTrue();
    expect(juego.palabraOculta.join('')).toBe('CAÑÓN');
    juego.probarDesdeTeclado('c');
    expect(juego.letrasAdivinadas.size).toBe(0);
    juego.nuevaPartida();
    expect(juego.fallos).toBe(0);
    expect(juego.juegoTerminado).toBeFalse();
    expect(juego.letraUsada('B')).toBeFalse();
  });

  it('calcula progreso por posiciones, incluyendo letras repetidas', () => {
    (juego as any).obtenerPalabraValida.and.returnValue('casa');
    juego.nuevaPartida();
    juego.probarDesdeTeclado('a');
    expect(juego.progreso).toBe(50);
    expect(juego.palabraOculta).toEqual(['_', 'A', '_', 'A']);
  });

  it('registra la victoria una sola vez, persiste y permite reiniciar estadísticas', () => {
    for (const letra of ['c','a','ñ','o','n','z']) juego.probarDesdeTeclado(letra);
    expect(juego.estadisticas.ganadas).toBe(1);
    expect(new AppComponent().estadisticas.ganadas).toBe(1);
    juego.nuevaPartida();
    expect(juego.estadisticas.ganadas).toBe(1);
    for (const letra of ['b','d','e','f','g','h','i']) juego.probarDesdeTeclado(letra);
    expect(juego.estadisticas.perdidas).toBe(1);
    expect(juego.estadisticas.racha).toBe(0);
    expect(juego.estadisticas.mejorRacha).toBe(1);
    expect(juego.porcentajeVictorias).toBe(50);
    juego.reiniciarEstadisticas();
    expect(new AppComponent().estadisticas.ganadas).toBe(0);
  });

  it('aplica la dificultad únicamente a una nueva partida', () => {
    juego.dificultad = 'largo';
    expect(juego.dificultadActual).toBe('clasico');
    juego.nuevaPartida();
    expect(juego.dificultadActual).toBe('largo');
  });

  it('usa una palabra de respaldo si no encuentra una válida', () => {
    const otro = new AppComponent();
    spyOn(Math, 'random').and.returnValue(1);
    otro.nuevaPartida();
    expect(otro.palabraOriginal).toBe('ahorcado');
  });
});

describe('Interfaz Angular', () => {
  it('renderiza y conecta el teclado, el estado y el reinicio', async () => {
    await TestBed.configureTestingModule({imports: [AppComponent]}).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    spyOn<any>(fixture.componentInstance, 'obtenerPalabraValida').and.returnValue('cañón');
    fixture.componentInstance.nuevaPartida();
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const tecla = root.querySelector<HTMLButtonElement>('.teclado button[aria-label="Ñ"]')!;
    tecla.click();
    fixture.detectChanges();
    expect(tecla.disabled).toBeTrue();
    expect(root.querySelector('.palabra')?.textContent).toContain('Ñ');
    root.querySelector<HTMLButtonElement>('.secundario')!.click();
    fixture.detectChanges();
    expect(tecla.disabled).toBeFalse();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Juego iniciado');
  });
});

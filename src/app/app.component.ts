import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cargarDiccionario, palabrasRespaldo } from './dictionary';
import { Partida, claveHistorial, leerHistorial, registrarPartida } from './game-history';
import { normalizarLetra } from './game-utils';
import { Dificultad, Estadisticas, claveEstadisticas, dificultades, opcionesDificultad, elegirPalabra, estadisticasVacias, leerEstadisticas, registrarResultado } from './game-settings';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly maxFallos = 7;
  readonly letrasTeclado = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  readonly dificultades = dificultades;
  readonly opcionesDificultad = opcionesDificultad;
  dificultad: Dificultad = 'clasico';
  dificultadActual: Dificultad = 'clasico';
  estadisticas: Estadisticas = this.cargarEstadisticas();
  historial: Partida[] = this.cargarHistorial();
  cargando = false;
  diccionarioReducido = false;
  private diccionario?: readonly string[];
  intento = '';
  mensaje = 'Pulsa nueva partida para empezar.';
  palabraOriginal = '';
  palabraNormalizada: string[] = [];
  letrasAdivinadas = new Set<string>();
  letrasFalladas = new Set<string>();

  ngOnInit(): void {
    void this.nuevaPartida();
  }

  get palabraOculta(): string[] {
    return this.palabraNormalizada.map((letra, indice) => {
      return this.letrasAdivinadas.has(letra) || this.juegoPerdido ? this.palabraOriginal[indice].toUpperCase() : '_';
    });
  }

  get letrasFalladasListado(): string {
    return [...this.letrasFalladas].sort().join(', ').toUpperCase();
  }

  get fallos(): number {
    return this.letrasFalladas.size;
  }

  get progreso(): number {
    const total = this.palabraNormalizada.length;
    return total === 0 ? 0 : Math.round(100 * this.palabraNormalizada.filter(l => this.letrasAdivinadas.has(l)).length / total);
  }

  get juegoGanado(): boolean {
    return this.palabraNormalizada.length > 0 && this.palabraNormalizada.every((l) => this.letrasAdivinadas.has(l));
  }

  get juegoPerdido(): boolean {
    return this.fallos >= this.maxFallos;
  }

  get juegoTerminado(): boolean {
    return this.juegoGanado || this.juegoPerdido;
  }

  async nuevaPartida(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;
    this.mensaje = 'Preparando la palabra…';
    this.dificultadActual = this.dificultad;
    try {
      this.palabraOriginal = await this.obtenerPalabraValida();
    } finally {
      this.cargando = false;
    }
    this.palabraNormalizada = [...this.palabraOriginal].map((letra) => normalizarLetra(letra));
    this.letrasAdivinadas.clear();
    this.letrasFalladas.clear();
    this.intento = '';
    this.mensaje = 'Juego iniciado. Escribe una letra y pulsa probar.';
  }

  probarIntento(): void {
    const letra = normalizarLetra(this.intento);
    this.intento = '';

    if (this.cargando || !this.palabraOriginal || this.juegoTerminado) {
      return;
    }

    if (!/^[a-zñ]$/i.test(letra)) {
      this.mensaje = 'Introduce solo una letra válida.';
      return;
    }

    if (this.letrasAdivinadas.has(letra) || this.letrasFalladas.has(letra)) {
      this.mensaje = `La letra ${letra.toUpperCase()} ya fue usada.`;
      return;
    }

    if (this.palabraNormalizada.includes(letra)) {
      this.letrasAdivinadas.add(letra);
      this.mensaje = `Bien: ${letra.toUpperCase()} está en la palabra.`;
    } else {
      this.letrasFalladas.add(letra);
      this.mensaje = `No aparece ${letra.toUpperCase()}.`;
    }

    if (this.juegoGanado) {
      this.mensaje = `Ganaste. La palabra era ${this.palabraOriginal.toUpperCase()}.`;
    }

    if (this.juegoPerdido) {
      this.mensaje = `Perdiste. La palabra era ${this.palabraOriginal.toUpperCase()}.`;
    }
    if (this.juegoTerminado) {
      this.estadisticas = registrarResultado(this.estadisticas, this.juegoGanado);
      this.guardarEstadisticas();
      this.historial = registrarPartida(this.historial, {palabra: this.palabraOriginal, victoria: this.juegoGanado, fallos: this.fallos, dificultad: this.dificultadActual, fecha: Date.now()});
      this.guardarHistorial();
    }
  }

  probarDesdeTeclado(letra: string): void {
    this.intento = letra;
    this.probarIntento();
  }

  letraUsada(letra: string): boolean {
    const normalizada = normalizarLetra(letra);
    return this.letrasAdivinadas.has(normalizada) || this.letrasFalladas.has(normalizada);
  }

  parteVisible(indice: number): boolean {
    return this.fallos > indice;
  }

  get porcentajeVictorias(): number {
    const total = this.estadisticas.ganadas + this.estadisticas.perdidas;
    return total ? Math.round(100 * this.estadisticas.ganadas / total) : 0;
  }

  reiniciarEstadisticas(): void {
    this.estadisticas = estadisticasVacias();
    this.guardarEstadisticas();
    this.historial = [];
    this.guardarHistorial();
  }

  private cargarHistorial(): Partida[] {
    try { return leerHistorial(localStorage.getItem(claveHistorial)); }
    catch { return []; }
  }

  private guardarHistorial(): void {
    try { localStorage.setItem(claveHistorial, JSON.stringify(this.historial)); }
    catch { /* Storage may be unavailable. */ }
  }

  private cargarEstadisticas(): Estadisticas {
    try {
      return leerEstadisticas(localStorage.getItem(claveEstadisticas));
    } catch {
      return estadisticasVacias();
    }
  }

  private guardarEstadisticas(): void {
    try {
      localStorage.setItem(claveEstadisticas, JSON.stringify(this.estadisticas));
    } catch { /* The game remains playable without browser storage. */ }
  }

  private cargarDiccionario(): Promise<readonly string[]> {
    return cargarDiccionario();
  }

  private async obtenerPalabraValida(): Promise<string> {
    if (!this.diccionario) {
      try {
        this.diccionario = await this.cargarDiccionario();
      } catch {
        // A failed download must not make the game unusable.
      }
    }
    this.diccionarioReducido = !this.diccionario;
    return elegirPalabra(this.diccionario ?? palabrasRespaldo, this.dificultadActual);
  }
}

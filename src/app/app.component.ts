import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import spanishWords from 'an-array-of-spanish-words';
import { esPalabraJugable, normalizarLetra } from './game-utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly maxFallos = 7;
  readonly letrasTeclado = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  intento = '';
  mensaje = 'Pulsa nueva partida para empezar.';
  palabraOriginal = '';
  palabraNormalizada: string[] = [];
  letrasAdivinadas = new Set<string>();
  letrasFalladas = new Set<string>();

  constructor() {
    this.nuevaPartida();
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

  nuevaPartida(): void {
    this.palabraOriginal = this.obtenerPalabraValida();
    this.palabraNormalizada = [...this.palabraOriginal].map((letra) => normalizarLetra(letra));
    this.letrasAdivinadas.clear();
    this.letrasFalladas.clear();
    this.intento = '';
    this.mensaje = 'Juego iniciado. Escribe una letra y pulsa probar.';
  }

  probarIntento(): void {
    const letra = normalizarLetra(this.intento);
    this.intento = '';

    if (this.juegoTerminado) {
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

  private obtenerPalabraValida(): string {
    let candidata = '';
    let intentos = 0;

    while (intentos < 8000) {
      intentos += 1;
      candidata = spanishWords[Math.floor(Math.random() * spanishWords.length)] ?? '';
      candidata = candidata.trim().normalize('NFC').toLowerCase();

      if (esPalabraJugable(candidata)) {
        return candidata;
      }
    }

    return 'ahorcado';
  }

}

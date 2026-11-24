# Ahorcado en español

Juego web Angular, derivado del proyecto [webferrol/AHORCADO](https://github.com/webferrol/AHORCADO).
Incluye diccionario español, teclado virtual, siete fallos máximos y reinicio de partida.
Las vocales acentuadas equivalen a su vocal base; N y Ñ se distinguen. Al perder se muestra la solución.

## Sin Docker

Requisitos: Node.js 20 y npm (compatibilidad del Angular 17 existente; Node 20 y Angular 17 están fuera de soporte y requieren una migración posterior para producción mantenida).

```sh
npm ci
npm start
```

Abrir http://localhost:4200. Para compilar y servir la versión estática:

```sh
npm run build
python -m http.server 8080 --directory dist/angular-ahorcado/browser
```

Abrir http://localhost:8080. Python solo se necesita para este servidor de ejemplo; cualquier alojamiento estático es válido.

## Con Docker

Requisitos: Docker Engine/Desktop con Compose v2.

```sh
docker compose up --build -d --wait
docker compose ps
docker compose down
```

Abrir http://localhost:18081. Para elegir otro puerto, definir AHORCADO_PORT en el entorno o en un archivo .env local.
La imagen final usa Nginx no privilegiado, sistema de archivos de solo lectura, comprobación de salud y cabeceras de seguridad.
Para usar Docker sin Compose:

```sh
docker build -t ahorcado .
docker run --rm -p 18081:8080 ahorcado
```

## Pruebas

```sh
npm test
npm run test:ci
```

Las pruebas unitarias usan Jasmine/Karma y Chrome. Para las pruebas de navegador y HTTP (con Docker en ejecución):

```sh
python -m pip install playwright==1.51.0
python -m playwright install chromium
python tests/browser_smoke.py
python tests/http_smoke.py
```

BASE_URL permite cambiar la URL de las pruebas (por defecto http://127.0.0.1:18081).
Las pruebas HTTP verifican específicamente la configuración de Nginx; las de navegador también funcionan contra la compilación estática sin Docker.

GitHub Actions ejecuta compilación y pruebas unitarias en Linux, Windows y macOS, pruebas de navegador en Linux para ambos modos, y comprobaciones de contenedor, cabeceras y rutas. En un fork puede ser necesario activar Actions en la pestaña correspondiente.

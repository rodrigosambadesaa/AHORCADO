# Ahorcado en español

Juego web Angular, derivado del proyecto [webferrol/AHORCADO](https://github.com/webferrol/AHORCADO).
Incluye diccionario español, teclado virtual, siete fallos máximos y reinicio de partida.
Las vocales acentuadas equivalen a su vocal base; N y Ñ se distinguen. Al perder se muestra la solución.

Puedes elegir palabras cortas (4–6), medias (7–10), largas (11–14) o el modo clásico. La elección se aplica al comenzar una nueva partida. La longitud no garantiza una dificultad lingüística concreta.
Se conservan victorias, derrotas y rachas en localStorage, sin servidores ni cuentas; puedes borrar las estadísticas desde el juego. Las partidas abandonadas no cuentan. El tema sigue automáticamente la preferencia clara u oscura del sistema.

## Rendimiento y disponibilidad

La interfaz se carga independientemente del diccionario completo: Angular lo descarga en un chunk diferido al iniciar la primera partida. Si falla la descarga, se utiliza una lista local reducida y se informa en pantalla. Las nuevas partidas reintentan la carga. Nginx comprime JavaScript, CSS y JSON con gzip; la compilación de producción limita el tamaño del bundle inicial a 750 kB para evitar regresiones. El diccionario completo sigue estando disponible sin recortar el repertorio original.

## Sin Docker

Requisitos: Node.js 24 LTS y npm, con Angular 20 LTS.

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

## Mantenimiento y seguridad

Las pruebas de navegador de CI cubren Chromium, Firefox y WebKit, tanto en el alojamiento estático nativo como en Docker. Para ejecutarlas localmente, instala los tres navegadores con `python -m playwright install chromium firefox webkit` y configura la variable de entorno BROWSERS=chromium,firefox,webkit antes de ejecutar el script.

Dependabot propone actualizaciones semanales de npm, Docker y Actions. El workflow Dependency audit conserva los informes JSON de npm audit y muestra las vulnerabilidades por severidad. Es informativo: una auditoría ejecutada correctamente no significa que no existan vulnerabilidades. Consulta [SECURITY.md](SECURITY.md) antes de desplegar en producción.

# Ahorcado

Ejercicio original de WebFerrol, de Xurxo González Tenreiro, en TypeScript y JavaScript. Se mantiene sin cambios en la raíz del repositorio.

## Versión original

Desde la raíz, servir los archivos por HTTP (por ejemplo, `python -m http.server 8000`) y abrir http://localhost:8000. No es necesario instalar Angular ni Docker.

## Versión alternativa Angular

El directorio [angular/](angular/) contiene una implementación independiente derivada del fork, con diccionario español, tratamiento de tildes y ñ, estadísticas locales, selección de longitud, tema oscuro, carga diferida del diccionario y pruebas automatizadas.

```sh
cd angular
npm ci
npm start
```

Abrir http://localhost:4200. Alternativamente, desde `angular/`:

```sh
docker compose up --build -d --wait
```

Abrir http://localhost:18081. Ver [documentación de la alternativa](angular/README.md). La versión Angular 17 / Node 20 es la revisión validada en el fork, pero está fuera de soporte; la migración a versiones soportadas se realiza por separado y no se recomienda exponer esta versión a producción pública sin actualizarla.

No se requiere ninguna automatización, publicación de imágenes ni modificación de la versión original para utilizar la alternativa.

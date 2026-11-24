# Seguridad

Este fork es una aplicación estática: no recibe datos de usuarios en un servidor. Las estadísticas se guardan en el navegador.

## Notificación de problemas

Utiliza la opción privada de reporte de vulnerabilidades de GitHub si está habilitada. Si no lo está, contacta con el propietario del fork por un canal privado. No publiques credenciales, datos personales ni detalles explotables en issues públicos.

## Mantenimiento

- Dependabot propone actualizaciones de npm, Docker y GitHub Actions.
- El workflow Dependency audit genera informes JSON para el lockfile completo y las dependencias de producción, semanalmente y en cambios de dependencias.
- Los avisos de vulnerabilidades no se confunden con un fallo del registro: las vulnerabilidades conocidas se muestran en el resumen, los errores de auditoría interrumpen el job.
- La auditoría es informativa durante la migración de Angular 17; una ejecución verde no implica ausencia de vulnerabilidades. Revisar el informe antes de publicar.
- Node 20 y Angular 17 están fuera de soporte. Priorizar su migración antes de desplegar en producción.
- Revisar las actualizaciones y los checks de CI antes de fusionar; no ejecutar código no confiable con secretos o permisos de escritura.

- CodeQL analiza JS/TS y Python; Grype analiza ambas arquitecturas y conserva informes. La publicación por etiqueta exige superar las puertas de seguridad y CI, sin publicar desde PR.

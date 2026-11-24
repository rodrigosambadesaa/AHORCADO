# Seguridad

Este fork es una aplicación estática: no recibe datos de usuarios en un servidor. Las estadísticas se guardan en el navegador.

## Notificación de problemas

Utiliza la opción privada de reporte de vulnerabilidades de GitHub si está habilitada. Si no lo está, contacta con el propietario del fork por un canal privado. No publiques credenciales, datos personales ni detalles explotables en issues públicos.

## Mantenimiento

- Dependabot propone actualizaciones de npm, Docker y GitHub Actions.
- El workflow Dependency audit genera informes JSON para el lockfile completo y las dependencias de producción, semanalmente y en cambios de dependencias.
- Los avisos de vulnerabilidades no se confunden con un fallo del registro: las vulnerabilidades conocidas se muestran en el resumen, los errores de auditoría interrumpen el job.
- La auditoría es informativa hasta que se resuelvan los avisos de dependencias; una ejecución verde no implica ausencia de vulnerabilidades. Revisar el informe antes de publicar.
- Angular 20 y Node 24 son las versiones objetivo. Revisar periódicamente su ciclo de soporte y los informes de auditoría.
- Revisar las actualizaciones y los checks de CI antes de fusionar; no ejecutar código no confiable con secretos o permisos de escritura.

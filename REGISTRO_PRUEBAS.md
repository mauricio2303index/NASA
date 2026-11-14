# Registro vigente — versión 3.0 — 14/11/2026

Windows, Node 24.16.0 y Python 3.14 de biblioteca estándar.

| Comprobación | Evidencia y resultado |
|---|---|
| Suite base | Las 17 pruebas iniciales aprobadas; evidence/baselineTests.txt |
| Suite final JS | 41 aprobadas; evidence/finalSuiteFormatted.txt y registro de cierre |
| Cierre final JS/Python | 41 y 3 aprobadas; evidence/releaseTests.txt y releasePythonTests.txt |
| Compilación repetida | Hash idéntico; evidence/releaseBuildFirst.json y releaseBuildSecond.json |
| Tres regiones reales | POWER live en las tres consultas del paquete final; evidence/releaseConnections.json |
| Procedencia Python | 3 aprobadas; evidence/finalPythonTests.txt |
| Estadística | Estadístico analítico, empates, Sen, ceros, años completos, ponderación y Holm |
| Arranque parcial | events.json ausente no bloquea otras fuentes ni su consulta en vivo |
| Persistencia de resultado | Se conserva tras cambio de mes y refresco de estado |
| Unidades y GeoJSON | Se rechazan mm/hour inesperado, parámetros ausentes, Point mal anidado y anillos abiertos |
| Procedencia | Dos capturas no comparten fechas; hash alterado rechazado; legado no hereda retrieval.json |
| Idempotencia | Preparar dos veces conserva hashes y processedAt; acumulación y escenarios previos repetibles |
| Contrato 2.0 | Serie histórica, unidad/fecha/versiones coherentes, token solo al upstream de prueba |
| Navegador | Variable, región, periodo corto e invertido, mapa, gráfico y estado sin ML |
| Responsive | Estilos de una columna a 390 px; sin desbordamiento horizontal observado |
| Exportación | JSON descargado en navegador y leído: 25 años, Arequipa, sin predicción |

## Fallos reales conservados

- Una prueba previa esperaba «cerrados» y el validador ahora informa «cerrado»:
  se ajustó la comprobación al significado del error y la suite completa pasó.
- Las primeras pruebas Python fallaron por permisos del directorio temporal del
  sandbox. Se trasladaron a carpetas temporales del espacio de trabajo, retenidas.
- npm ci falló inicialmente con EPERM; npm install --ignore-scripts completó la
  instalación. Se conserva package-lock para la entrega reproducible.
- El helper de publicación por PTY no completó la entrada; el intento con stdin
  seguro devolvió getaddrinfo() thread failed to start. No hubo publicación.
- La recuperación posterior del navegador se interrumpió al desprenderse la
  conexión. No se afirma que se verificó de nuevo una sesión o dispositivo físico.
- El observador de descarga del navegador expiró, pero el JSON sí se descargó y
  se verificó mediante lectura del archivo; ver evidence/downloadedReportCheck.json.
- No se verificó la descarga CSV en navegador durante esta revisión.
- La prueba autenticada del Site desde el runtime auxiliar devolvió TypeError;
  no se afirma verificación de producción. Los intentos previos sin sesión daban 401.

Las pruebas no acreditan exactitud del clima, causalidad, peligro, daño, emergencia
ni precisión de un modelo. Los gránulos IMERG/NASADEM reales siguen sin procesarse.

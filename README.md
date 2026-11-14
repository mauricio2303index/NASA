# NEXO EARTH

## Versión 3.0 — análisis histórico, sin entrenamiento ML

Consulta [estado](ESTADO_IMPLEMENTACION.md), [auditoría](docs/audit.md),
[procesamiento numérico y escenarios](docs/scientificPipeline.md) y
[guía final](docs/finalGuide.md) y [contrato de series ML 2.0](docs/modelContractV2.md).
Se confirmó el enunciado «Be An Earth System Trend Detective!» de NASA Space Apps 2026.
La página permite seleccionar seis variables, tres puntos regionales y periodos
de 2001–2025; incluye gráfico anual, pendiente de Sen, Mann–Kendall, ajuste de Holm,
tablas accesibles y exportación. Es estadística exploratoria, no ML ni pronóstico.
Se corrigieron los cinco fallos del informe adjunto. Pasan 41 pruebas JavaScript
y 3 de procedencia en Python. Se conserva la identidad verde/lima y Arequipa piloto.
La versión se entrega localmente; la publicación encontró un fallo del transporte Git.
El sitio anterior conserva su acceso privado. Ver el registro de límites reales.

Plataforma modular para explorar el territorio de **Arequipa**, consultar fuentes NASA e investigar impactos sobre infraestructura. HTML, CSS y JavaScript, con servidor compatible con Node.js y Cloudflare Workers.

```bash
npm ci
npm run dev
```

En Windows también puedes abrir `startWindows.bat`; en Linux/macOS, ejecutar `./startLocal.sh`.

Abre **http://localhost:4173**. Se necesita Node.js 22 LTS o posterior. No abras `web/index.html` directamente: usa el servidor para los módulos ES y las rutas `/api`.

- [Guía del equipo](docs/teamGuide.md): uso, datos, límites y ampliaciones.
- [Arquitectura](docs/architecture.md): módulos y puntos de extensión.
- [Integración de ML](docs/mlIntegration.md): contrato para el integrante encargado del modelo.
- [Verificación](docs/verification.md): pruebas y observaciones de la entrega.

**ML:** no se incluye entrenamiento ni un modelo activo; se incluye el adaptador para el equipo.
**Datos recientes:** muestran la última observación publicada y su demora; no son datos instantáneos.
**Simulador:** cierres hipotéticos definidos por el usuario sobre una copia de la red OSM; no es una ruta de emergencia validada.

```bash
npm test
npm run build
```

Las credenciales opcionales de un modelo externo se configuran en `.env`, a partir de `.env.example`, y nunca se envían al navegador. No se necesita una clave para las conexiones públicas NASA incluidas.

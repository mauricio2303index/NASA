# Pendientes después de la versión 3.0

## Para publicar y conectar al compañero

1. Publicar la fuente 3.0 en el mismo Site privado. El cliente Git falló con
   getaddrinfo() thread failed to start; no se declaró despliegue exitoso.
2. Configurar MODEL_SERVICE_URL y MODEL_API_TOKEN solo en el servidor.
   El compañero debe implementar el contrato de series 2.0 y acordar objetivo,
   horizonte y unidades. Probar su endpoint real: ahora solo hay pruebas controladas.
3. Revisar científicamente el análisis exploratorio y los supuestos con el equipo.
   No confundir pruebas de software con validación de fenómenos o predicciones.

## Ampliaciones científicas y operativas

- Descargar y procesar IMERG, SMAP, MODIS y NASADEM auténticos con permisos del equipo.
  Los GET anteriores devolvieron 401. Se conserva el procesador GeoTIFF de prueba;
  no se declara completada la lectura NetCDF4/HGT, calidad o alineación de productos.
- Límites oficiales, análisis espacial por grillas/cuencas y contraste local.
- Integrar geometrías de amenaza validadas a la interfaz. El simulador circular
  funciona; el módulo poligonal se conserva por CLI, sin demostrar daño.
- Almacenamiento duradero, trabajos científicos asíncronos, monitoreo y cuotas.
- Separar archivos pesados del bundle antes de ampliar a muchas ciudades.
- Dispositivos físicos, auditoría de accesibilidad completa y robustez de la red OSM.

El alcance funcional actual del reto usa variables de modelos NASA, admisibles
según el enunciado. No se hace depender la navegación de la existencia de un ML.

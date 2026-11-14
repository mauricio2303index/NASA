# Decisiones técnicas — versión 3.0

- El enunciado oficial orienta el producto a cambios históricos; se conserva
  infraestructura como contexto secundario y no se inventan predicciones.
- Estadística convencional, sin ML: Sen para magnitud y Mann–Kendall para evidencia
  exploratoria. Ajuste Holm de las seis variables del mismo punto y periodo.
  La dependencia temporal o años faltantes provocan un aviso de revisión.
- Medias anuales ponderadas por días; lluvia acumulada anual. Años incompletos
  excluidos, sin imputación. Periodos inválidos limpian resultados y exportaciones.
- Separación entre proveedores, cálculos puros, contratos, servicios de datos,
  mapa, gráfico, presentación y exportación. Módulos propios con nombres camelCase.
- Tres puntos de contexto separados en el departamento; no se replica una celda
  como si cada distrito fuera un sensor. GIBS conserva su papel visual.
- Las fuentes iniciales se resuelven independientemente; las consultas en vivo
  empiezan sin esperar a que todas las copias existan. Los fallos se muestran por fuente.
- Cada descarga tiene fecha y hash propios. Procesar no renueva retrievedAt;
  processedAt y periodo observado se registran aparte. El legado sin prueba se marca.
- Capturas y preparaciones en directorios nuevos, sin sustituir originales.
  Repetición de igual contenido conserva resultados; los cambios exigen otra versión.
- Validación de unidades diarias y estructura específica de cada geometría GeoJSON.
- El resultado externo se guarda en el estado y no se borra al cambiar el mes.
  Contrato de series 2.0 para el nuevo flujo; los diarios 1.0/1.1 se conservan como antecedentes.
- Credenciales únicamente en servidor/sesión de publicación; no se guardan en fuentes ni logs.
- El bundle con datos embebidos sirve al piloto actual. Antes de ampliar volumen,
  mover recursos a un almacén de objetos y procesamiento asíncrono; no se provisionó infraestructura.
- Se conserva la audiencia privada del Site. Los intentos fallidos de publicación
  no modificaron su versión activa. Se entrega un ZIP verificable independiente.

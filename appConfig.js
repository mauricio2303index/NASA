export const regionConfig = {
  cityName: 'Arequipa',
  latitude: -16.399,
  longitude: -71.537,
  boundingBox: [-71.61, -16.49, -71.46, -16.35],
  baselineStartYear: 2001,
  baselineEndYear: 2020,
};

export const districtConfig = {
  paucarpata: { name: 'Paucarpata', latitude: -16.432, longitude: -71.506 },
  cercado: { name: 'Arequipa · Cercado', latitude: -16.399, longitude: -71.537 },
  cerro: { name: 'Cerro Colorado', latitude: -16.376, longitude: -71.56 },
  sabandia: { name: 'Sabandía', latitude: -16.466, longitude: -71.494 },
};

export const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const variableConfig = {
  rainfall: {
    parameter: 'PRECTOTCORR',
    label: 'Lluvia acumulada',
    unit: 'mm',
    description: 'Agua acumulada en el mes; tasa diaria media × días del mes.',
    aggregation: 'sum',
    digits: 1,
  },
  temperature: {
    parameter: 'T2M',
    label: 'Temperatura del aire',
    unit: '°C',
    description: 'Temperatura media del aire a dos metros; no es temperatura del suelo.',
    aggregation: 'mean',
    digits: 1,
  },
  humidity: {
    parameter: 'RH2M',
    label: 'Humedad del aire',
    unit: '%',
    description: 'Humedad relativa media a dos metros.',
    aggregation: 'mean',
    digits: 1,
  },
  soilWetness: {
    parameter: 'GWETROOT',
    label: 'Humedad de la zona radicular',
    unit: 'índice 0–1',
    description: 'Fracción de humedad modelada por MERRA-2; no es una medición SMAP.',
    aggregation: 'mean',
    digits: 3,
  },
  windSpeed: {
    parameter: 'WS2M',
    label: 'Velocidad del viento',
    unit: 'm/s',
    description: 'Velocidad media del viento a dos metros.',
    aggregation: 'mean',
    digits: 2,
  },
  solarRadiation: {
    parameter: 'ALLSKY_SFC_SW_DWN',
    label: 'Radiación solar',
    unit: 'MJ/m²/día',
    description: 'Energía solar diaria media en superficie, con nubes incluidas.',
    aggregation: 'mean',
    digits: 2,
  },
};

export const satelliteConfig = {
  terrain: {
    layerId: 'ASTER_GDEM_Color_Shaded_Relief',
    label: 'Relieve · ASTER GDEM',
    note: 'Relieve estático. Esta imagen no calcula pendientes ni susceptibilidad.',
  },
  trueColor: {
    layerId: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    label: 'Territorio · MODIS',
    note: 'Reflectancia en color real. Puede haber nubes o zonas sin adquisición.',
  },
  vegetation: {
    layerId: 'MODIS_Terra_L3_NDVI_Monthly',
    label: 'Vegetación · NDVI mensual',
    note: 'Índice de vegetación mensual; el color no demuestra por sí solo deterioro.',
  },
  surfaceTemperature: {
    layerId: 'MODIS_Terra_Land_Surface_Temp_Day',
    label: 'Suelo · Temperatura MODIS',
    note: 'Temperatura superficial diurna, distinta de la temperatura del aire.',
  },
  soilMoisture: {
    layerId: 'SMAP_L4_Analyzed_Root_Zone_Soil_Moisture',
    label: 'Suelo · Humedad SMAP L4',
    note: 'Humedad radicular SMAP L4, ~9 km, producto modelado con observaciones.',
  },
  precipitation: {
    layerId: 'IMERG_Precipitation_Rate',
    label: 'Lluvia · IMERG diario',
    note: 'Visualización de tasa de precipitación. No es acumulado mensual.',
  },
  precipitationRecent: {
    layerId: 'IMERG_Precipitation_Rate_30min',
    label: 'Reciente · IMERG 30 minutos',
    note: 'Última imagen publicada, con demora del producto. No es observación instantánea.',
  },
};

import { regionConfig } from './appConfig.js';

export function createPowerUrl(mode, start, end, location = regionConfig) {
  const query = new URLSearchParams({
    parameters: 'PRECTOTCORR,T2M,RH2M,GWETROOT,WS2M,ALLSKY_SFC_SW_DWN',
    community: 'AG',
    longitude: String(location.longitude),
    latitude: String(location.latitude),
    format: 'JSON',
    start,
    end,
  });
  if (mode === 'daily') query.set('time-standard', 'UTC');
  return `https://power.larc.nasa.gov/api/temporal/${mode}/point?${query}`;
}

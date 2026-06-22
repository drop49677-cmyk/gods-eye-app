import L from 'leaflet';

/**
 * Countries Module - Hover Detection and Info Display
 * Uses RestCountries API for country data.
 */

let countryLayer = null;
let countryPopup = null;
let currentHighlight = null;
let cache = {};
let countryClickHandler = null;

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1/alpha/';

// Simplified country detection based on coordinates
// Uses a reverse-geocoding approach with Nominatim
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';

let lastFetchTime = 0;
const FETCH_COOLDOWN = 2000; // 2 seconds between API calls

async function getCountryCode(lat, lng) {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_COOLDOWN) return null;
  lastFetchTime = now;

  try {
    const response = await fetch(
      `${NOMINATIM_API}?lat=${lat}&lon=${lng}&format=json&zoom=3&accept-language=en`,
      { headers: { 'User-Agent': 'GodsEyeApp/1.0' } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.address?.country_code?.toUpperCase() || null;
  } catch {
    return null;
  }
}

async function getCountryInfo(code) {
  if (cache[code]) return cache[code];

  try {
    const response = await fetch(`${REST_COUNTRIES_API}${code}`);
    if (!response.ok) return null;
    const data = await response.json();
    const country = data[0];

    const info = {
      name: country.name?.common || 'Unknown',
      official: country.name?.official || '',
      capital: country.capital?.[0] || 'N/A',
      population: country.population || 0,
      region: country.region || 'N/A',
      subregion: country.subregion || '',
      flag: country.flag || '',
      currencies: Object.values(country.currencies || {})[0]?.name || 'N/A',
      languages: Object.values(country.languages || {}).slice(0, 3).join(', ') || 'N/A',
      area: country.area || 0
    };

    cache[code] = info;
    return info;
  } catch {
    return null;
  }
}

function formatPopulation(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
  return num.toString();
}

function showCountryPopup(map, latlng, info) {
  if (countryPopup) {
    map.closePopup(countryPopup);
  }

  const content = `
    <div class="country-popup">
      <div class="country-header">${info.flag} ${info.name}</div>
      <div class="country-official">${info.official}</div>
      <div class="country-data">
        <div class="country-row"><span>CAPITAL</span><span>${info.capital}</span></div>
        <div class="country-row"><span>POPULATION</span><span>${formatPopulation(info.population)}</span></div>
        <div class="country-row"><span>REGION</span><span>${info.region}</span></div>
        <div class="country-row"><span>AREA</span><span>${info.area.toLocaleString()} km&sup2;</span></div>
        <div class="country-row"><span>CURRENCY</span><span>${info.currencies}</span></div>
        <div class="country-row"><span>LANGUAGES</span><span>${info.languages}</span></div>
      </div>
    </div>
  `;

  countryPopup = L.popup({
    className: 'cyber-leaflet-popup',
    maxWidth: 280,
    closeButton: true
  })
    .setLatLng(latlng)
    .setContent(content)
    .openOn(map);
}

export function initCountryInteractions(map) {
  countryClickHandler = async (e) => {
    const { lat, lng } = e.latlng;
    const code = await getCountryCode(lat, lng);
    if (!code) return;

    const info = await getCountryInfo(code);
    if (info) {
      showCountryPopup(map, e.latlng, info);
    }
  };

  map.on('click', countryClickHandler);
}

export function destroyCountryInteractions(map) {
  if (countryPopup) {
    map.closePopup(countryPopup);
    countryPopup = null;
  }
  if (countryClickHandler) {
    map.off('click', countryClickHandler);
    countryClickHandler = null;
  }
  cache = {};
}

import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloud,
  Search,
  MapPin,
  RefreshCw,
  Edit2,
  Check,
  Globe,
} from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  rainProb: number;
  hourly: Array<{ time: string; temp: number }>;
}

const PRESET_CITIES = [
  { name: 'New York', country: 'United States', lat: 40.71, lon: -74.01 },
  { name: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69 },
  { name: 'Paris', country: 'France', lat: 48.85, lon: 2.35 },
  { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
  { name: 'Sydney', country: 'Australia', lat: -33.87, lon: 151.21 },
  { name: 'Dubai', country: 'UAE', lat: 25.20, lon: 55.27 },
];

const DEFAULT_WEATHER: WeatherData = {
  city: 'London',
  country: 'United Kingdom',
  temp: 18,
  condition: 'Partly Cloudy',
  feelsLike: 17,
  humidity: 62,
  windSpeed: 12,
  uvIndex: 4,
  rainProb: 15,
  hourly: [
    { time: 'Now', temp: 18 },
    { time: '16:00', temp: 19 },
    { time: '18:00', temp: 17 },
    { time: '20:00', temp: 15 },
    { time: '22:00', temp: 13 },
  ],
};

export const WeatherView: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const saved = localStorage.getItem('nova_user_weather');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_WEATHER;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; country: string; latitude: number; longitude: number }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  // Custom override fields
  const [customCity, setCustomCity] = useState<string>(weather.city);
  const [customTemp, setCustomTemp] = useState<number>(weather.temp);
  const [customCondition, setCustomCondition] = useState<string>(weather.condition);
  const [customHumidity, setCustomHumidity] = useState<number>(weather.humidity);
  const [customWind, setCustomWind] = useState<number>(weather.windSpeed);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem('nova_user_weather', JSON.stringify(weather));
    } catch (e) {}
  }, [weather]);

  // Live Geocoding Search via Open-Meteo
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=4&language=en&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch real live weather from coordinates
  const fetchLiveWeather = async (city: string, country: string, lat: number, lon: number) => {
    setIsLoading(true);
    setSearchResults([]);
    setSearchQuery('');
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.current_weather) {
        const cur = data.current_weather;
        const code = cur.weathercode;
        let cond = 'Clear Sky';
        if (code >= 1 && code <= 3) cond = 'Partly Cloudy';
        else if (code >= 45 && code <= 48) cond = 'Foggy';
        else if (code >= 51 && code <= 67) cond = 'Rainy';
        else if (code >= 71 && code <= 77) cond = 'Snowy';
        else if (code >= 80 && code <= 82) cond = 'Heavy Rain';
        else if (code >= 95) cond = 'Thunderstorm';

        const hourlyData = data.hourly?.temperature_2m?.slice(0, 5).map((t: number, i: number) => ({
          time: i === 0 ? 'Now' : `${(new Date().getHours() + i * 2) % 24}:00`,
          temp: Math.round(t),
        })) || DEFAULT_WEATHER.hourly;

        const updated: WeatherData = {
          city,
          country,
          temp: Math.round(cur.temperature),
          condition: cond,
          feelsLike: Math.round(cur.temperature - (cur.windspeed > 15 ? 1 : 0)),
          humidity: data.hourly?.relativehumidity_2m?.[0] || 60,
          windSpeed: Math.round(cur.windspeed),
          uvIndex: 4,
          rainProb: data.hourly?.precipitation_probability?.[0] || 10,
          hourly: hourlyData,
        };

        setWeather(updated);
        setCustomCity(city);
        setCustomTemp(updated.temp);
        setCustomCondition(updated.condition);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCustom = () => {
    const updated: WeatherData = {
      ...weather,
      city: customCity || 'Custom Area',
      temp: customTemp,
      condition: customCondition,
      humidity: customHumidity,
      windSpeed: customWind,
      feelsLike: customTemp - 1,
      hourly: [
        { time: 'Now', temp: customTemp },
        { time: '+2h', temp: customTemp - 1 },
        { time: '+4h', temp: customTemp - 2 },
        { time: '+6h', temp: customTemp - 3 },
      ],
    };
    setWeather(updated);
    setIsCustomizing(false);
  };

  const displayTemp = (t: number) => {
    if (unit === 'F') return `${Math.round((t * 9) / 5 + 32)}°F`;
    return `${t}°C`;
  };

  const getWeatherIcon = (cond: string, size = 32) => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return <CloudRain size={size} style={{ color: 'var(--nova-blue)' }} />;
    if (c.includes('snow')) return <CloudSnow size={size} style={{ color: 'var(--nova-cyan)' }} />;
    if (c.includes('thunder')) return <CloudLightning size={size} style={{ color: 'var(--nova-warning)' }} />;
    if (c.includes('cloud')) return <CloudSun size={size} style={{ color: 'var(--nova-warning)' }} />;
    if (c.includes('clear') || c.includes('sun')) return <Sun size={size} style={{ color: '#FBBF24' }} />;
    return <Cloud size={size} style={{ color: 'var(--nova-text-secondary)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 330, overflowY: 'auto', paddingRight: 4 }}>
      {/* Search & Location Bar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: 6 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flex: 1,
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              padding: '0 8px',
            }}
          >
            <Search size={12} style={{ color: 'var(--nova-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any city or area..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--nova-text-primary)',
                fontSize: '11px',
                padding: '6px 0',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--nova-blue)',
              color: '#fff',
              borderRadius: 'var(--nova-radius-button)',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          style={{
            padding: '6px 10px',
            backgroundColor: isCustomizing ? 'rgba(96, 165, 250, 0.2)' : 'var(--nova-surface)',
            border: isCustomizing ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            color: isCustomizing ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Manually customize weather values"
        >
          <Edit2 size={12} />
          <span>{isCustomizing ? 'Close' : 'Set Manual'}</span>
        </button>

        <button
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          style={{
            padding: '6px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--nova-cyan)',
          }}
          title="Toggle °C / °F"
        >
          °{unit}
        </button>
      </div>

      {/* Geocoding Search Dropdown Results */}
      {searchResults.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            backgroundColor: 'var(--nova-surface-elevated)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-input)',
            padding: 6,
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600, padding: '2px 4px' }}>
            SELECT MATCHING LOCATION:
          </div>
          {searchResults.map((res, i) => (
            <button
              key={i}
              onClick={() => fetchLiveWeather(res.name, res.country, res.latitude, res.longitude)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                borderRadius: 4,
                backgroundColor: 'var(--nova-surface)',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontWeight: 600 }}>{res.name}</span>
              <span style={{ color: 'var(--nova-text-muted)', fontSize: '10px' }}>{res.country}</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Preset Cities Pill Strip */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {PRESET_CITIES.map((c) => (
          <button
            key={c.name}
            onClick={() => fetchLiveWeather(c.name, c.country, c.lat, c.lon)}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: weather.city === c.name ? 'rgba(96, 165, 250, 0.2)' : 'var(--nova-surface)',
              border: weather.city === c.name ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
              color: weather.city === c.name ? 'var(--nova-blue)' : 'var(--nova-text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Manual Customization Panel (if toggled) */}
      {isCustomizing && (
        <div
          style={{
            padding: 10,
            backgroundColor: 'var(--nova-surface-elevated)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-blue)' }}>
            CUSTOMIZE YOUR REGION & WEATHER:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>City Name:</span>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Condition:</span>
              <select
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              >
                <option value="Sunny">Sunny</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Thunderstorm">Thunderstorm</option>
                <option value="Snowy">Snowy</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Temperature: {customTemp}°C</span>
              <input
                type="range"
                min={-15}
                max={48}
                value={customTemp}
                onChange={(e) => setCustomTemp(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--nova-blue)' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Humidity: {customHumidity}%</span>
              <input
                type="range"
                min={10}
                max={100}
                value={customHumidity}
                onChange={(e) => setCustomHumidity(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--nova-cyan)' }}
              />
            </div>
          </div>

          <button
            onClick={handleApplyCustom}
            style={{
              padding: '6px',
              backgroundColor: 'var(--nova-blue)',
              color: '#fff',
              borderRadius: 4,
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Check size={12} />
            <span>Apply Custom Weather</span>
          </button>
        </div>
      )}

      {/* Main Weather Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          position: 'relative',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} style={{ color: 'var(--nova-blue)' }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              {weather.city}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-muted)' }}>
              ({weather.country})
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', marginTop: 2 }}>
            {weather.condition} • Feels like {displayTemp(weather.feelsLike)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {getWeatherIcon(weather.condition)}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--nova-text-primary)',
            }}
          >
            {displayTemp(weather.temp)}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>HUMIDITY</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Droplets size={12} style={{ color: 'var(--nova-cyan)' }} /> {weather.humidity}%
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>WIND</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Wind size={12} style={{ color: 'var(--nova-blue)' }} /> {weather.windSpeed} km/h
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>UV INDEX</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Sun size={12} style={{ color: 'var(--nova-warning)' }} /> {weather.uvIndex}
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>RAIN CHANCE</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <CloudRain size={12} style={{ color: 'var(--nova-blue)' }} /> {weather.rainProb}%
          </div>
        </div>
      </div>

      {/* Hourly Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          fontSize: '11px',
          textAlign: 'center',
        }}
      >
        {weather.hourly.map((slot, idx) => (
          <div key={idx}>
            <div style={{ color: 'var(--nova-text-secondary)', fontSize: '10px' }}>{slot.time}</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{displayTemp(slot.temp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

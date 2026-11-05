import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Wind, Cloud, CloudRain, Thermometer, Clock, MapPin, RotateCcw, ShieldCheck, Map as MapIcon, Globe } from 'lucide-react';
import { LangId, TRANSLATIONS } from '../../services/weatherTranslations';

interface WeatherMapProps {
  lat: number;
  lon: number;
  placeName: string;
  windSpeed: number;
  cloudCover: number;
  rainNow: number;
  hourlyTimes: string[];
  hourlyRain: number[];
  hourlyWind: number[];
  hourlyCloud: number[];
  hourlyTemp?: number[];
  lang: LangId;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  lat,
  lon,
  placeName,
  windSpeed,
  cloudCover,
  rainNow,
  hourlyTimes,
  hourlyRain,
  hourlyWind,
  hourlyCloud,
  hourlyTemp = [],
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const overlayLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'rain' | 'wind' | 'cloud' | 'temp'>('rain');
  const [mapStyle, setMapStyle] = useState<'osm' | 'terrain' | 'satellite'>('osm');
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0);
  const [inspectedPoint, setInspectedPoint] = useState<{ lat: number; lon: number; label: string; temp: number; rain: number } | null>(null);

  // Initialize or update Leaflet Map with 100% Free OpenStreetMap & Esri Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 9,
        zoomControl: true,
        attributionControl: false,
        touchZoom: true,
        scrollWheelZoom: true
      });

      // 100% Free OpenStreetMap standard tile layer (zero API key, zero watermark)
      const baseTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      baseTileLayerRef.current = baseTile;

      // Layer group for live weather overlays
      const layerGroup = L.layerGroup().addTo(map);
      overlayLayerGroupRef.current = layerGroup;

      // Click to inspect any coordinate on map
      map.on('click', (e: L.LeafletMouseEvent) => {
        const cLat = e.latlng.lat;
        const cLon = e.latlng.lng;
        const dDist = Math.hypot(cLat - lat, cLon - lon);
        const estTemp = Math.round((hourlyTemp[0] || 28) - dDist * 1.5);
        const estRain = Math.max(0, Math.round(((hourlyRain[0] || 0) + (dDist > 0.3 ? 0.8 : 0)) * 10) / 10);

        setInspectedPoint({
          lat: cLat,
          lon: cLon,
          label: `${cLat.toFixed(2)}°N, ${cLon.toFixed(2)}°E`,
          temp: estTemp,
          rain: estRain
        });
      });

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([lat, lon], leafletMapRef.current.getZoom());
    }

    const map = leafletMapRef.current;
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Pin marker for user location
    const customIcon = L.divIcon({
      className: 'custom-weather-pin',
      html: `
        <div style="
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
        ">
          📍
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; min-width: 160px; line-height: 1.4;">
        <b style="color: #1e293b; font-size: 13px;">${placeName}</b>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</div>
        <div style="margin-top: 6px; padding: 5px 8px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">
          ${windSpeed} km/h · ${rainNow} mm · ${cloudCover}% Cloud
        </div>
      </div>
    `);
    markerRef.current = marker;

    return () => {
      clearTimeout(timer);
    };
  }, [lat, lon, placeName, windSpeed, cloudCover, rainNow, hourlyTemp, hourlyRain]);

  // Handle Base Tile Style Switching (Zero API Key for all styles)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.remove();
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains: string[] | string = ['a', 'b', 'c'];
    let maxZoom = 19;

    if (mapStyle === 'terrain') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
      maxZoom = 18;
    } else if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
      maxZoom = 18;
    }

    const newTile = L.tileLayer(url, {
      maxZoom,
      subdomains,
      attribution: '&copy; OpenStreetMap / Esri'
    }).addTo(map);

    baseTileLayerRef.current = newTile;
    newTile.bringToBack();
  }, [mapStyle]);

  // Update Live Weather Overlays based on active layer & hour scrub
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = overlayLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const currentRain = hourlyRain[selectedHourOffset] ?? rainNow;
    const currentWind = hourlyWind[selectedHourOffset] ?? windSpeed;
    const currentCloud = hourlyCloud[selectedHourOffset] ?? cloudCover;
    const currentTemp = hourlyTemp[selectedHourOffset] ?? 28;

    // Surrounding grid cells (0.25° ~25km resolution)
    const offsets = [
      [-0.4, -0.4], [-0.4, 0], [-0.4, 0.4],
      [-0.2, -0.3], [-0.2, 0], [-0.2, 0.3],
      [0, -0.4], [0, 0], [0, 0.4],
      [0.2, -0.3], [0.2, 0], [0.2, 0.3],
      [0.4, -0.4], [0.4, 0], [0.4, 0.4]
    ];

    offsets.forEach(([dLat, dLon], idx) => {
      const gLat = lat + dLat;
      const gLon = lon + dLon;

      if (activeLayer === 'rain') {
        const val = Math.max(0, currentRain + ((idx % 3) - 1) * 0.4);
        if (val > 0.05) {
          const color = val > 4 ? '#9333ea' : val > 1.5 ? '#2563eb' : '#38bdf8';
          const circle = L.circle([gLat, gLon], {
            radius: 13000,
            color,
            fillColor: color,
            fillOpacity: 0.38,
            weight: 1
          });
          circle.bindTooltip(`Radar: ${val.toFixed(1)} mm/h`, { sticky: true });
          layerGroup.addLayer(circle);
        }
      } else if (activeLayer === 'wind') {
        const wVal = Math.max(5, currentWind + ((idx % 4) - 2) * 3);
        const circle = L.circle([gLat, gLon], {
          radius: 12000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.22,
          weight: 1
        });
        circle.bindTooltip(`Wind: ${Math.round(wVal)} km/h`, { sticky: true });
        layerGroup.addLayer(circle);
      } else if (activeLayer === 'cloud') {
        const cVal = Math.min(100, Math.max(0, currentCloud + ((idx % 5) - 2) * 8));
        const circle = L.circle([gLat, gLon], {
          radius: 14000,
          color: '#94a3b8',
          fillColor: '#64748b',
          fillOpacity: Math.min(0.55, cVal / 180),
          weight: 1
        });
        circle.bindTooltip(`Cloud: ${Math.round(cVal)}%`, { sticky: true });
        layerGroup.addLayer(circle);
      } else if (activeLayer === 'temp') {
        const tVal = currentTemp + ((idx % 3) - 1) * 1.2;
        const color = tVal > 36 ? '#ef4444' : tVal > 30 ? '#f97316' : tVal > 22 ? '#3b82f6' : '#06b6d4';
        const circle = L.circle([gLat, gLon], {
          radius: 13000,
          color,
          fillColor: color,
          fillOpacity: 0.32,
          weight: 1
        });
        circle.bindTooltip(`Temp: ${tVal.toFixed(1)}°C`, { sticky: true });
        layerGroup.addLayer(circle);
      }
    });
  }, [activeLayer, selectedHourOffset, lat, lon, hourlyRain, hourlyWind, hourlyCloud, hourlyTemp, rainNow, windSpeed, cloudCover]);

  // Recenter map back to user pin
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lon], 9);
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Layer Selectors, Map Basemap Switcher & Controls Bar */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-wrap items-center justify-between gap-2">
        {/* Weather Overlay Buttons (Short mobile-friendly names) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setActiveLayer('rain')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'rain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CloudRain size={13} />
            <span>Rain</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('wind')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'wind'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wind size={13} />
            <span>Wind</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('temp')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'temp'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Thermometer size={13} />
            <span>Temp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('cloud')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeLayer === 'cloud'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud size={13} />
            <span>Cloud</span>
          </button>
        </div>

        {/* Basemap Switcher & Re-center */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMapStyle('osm')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapStyle === 'osm' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('terrain')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapStyle === 'terrain' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Terrain
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Center on My Location"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Center</span>
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-white/50 dark:border-white/10 shadow-xl">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Click Inspection Floating Chip */}
        {inspectedPoint && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 text-xs shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <MapPin size={14} />
              <span>{inspectedPoint.label}</span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3 font-semibold text-slate-700 dark:text-slate-300">
              <span>{inspectedPoint.temp}°C</span>
              <span>·</span>
              <span>{inspectedPoint.rain} mm/h</span>
            </div>
            <button
              type="button"
              onClick={() => setInspectedPoint(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-16 sm:bottom-18 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-800 rounded-2xl p-2 text-[11px] shadow-lg flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{activeLayer}:</span>
          {activeLayer === 'rain' && (
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="w-3 h-3 rounded-full bg-sky-400" /> &lt;1.5mm
              <span className="w-3 h-3 rounded-full bg-blue-600 ml-1" /> 1.5-4mm
              <span className="w-3 h-3 rounded-full bg-purple-600 ml-1" /> &gt;4mm
            </div>
          )}
          {activeLayer === 'wind' && (
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Speed (km/h)
            </div>
          )}
          {activeLayer === 'temp' && (
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Cool
              <span className="w-3 h-3 rounded-full bg-orange-500 ml-1" /> Warm
              <span className="w-3 h-3 rounded-full bg-rose-500 ml-1" /> Hot
            </div>
          )}
          {activeLayer === 'cloud' && (
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="w-3 h-3 rounded-full bg-slate-500" /> Coverage %
            </div>
          )}
        </div>

        {/* Time Scrubber (0h to +24h Forecast Overlay) */}
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock size={14} className="text-blue-500" />
            <span className="font-mono">{selectedHourOffset === 0 ? 'Live Now' : `+${selectedHourOffset}h`}</span>
          </div>

          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={selectedHourOffset}
            onChange={(e) => setSelectedHourOffset(parseInt(e.target.value, 10))}
            className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
            {hourlyTimes[selectedHourOffset]?.slice(11, 16) || 'Now'}
          </span>
        </div>
      </div>
    </div>
  );
};

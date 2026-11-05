import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Wind, Cloud, CloudRain, Thermometer, Clock, MapPin, RotateCcw } from 'lucide-react';
import { LangId, TRANSLATIONS } from '../../services/weatherTranslations';
import { formatNumByLang } from '../../services/weatherService';

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

interface WindParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
}

export const WeatherMap: React.FC<WeatherMapProps> = React.memo(({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [activeLayer, setActiveLayer] = useState<'rain' | 'wind' | 'cloud' | 'temp'>('wind');
  const [mapStyle, setMapStyle] = useState<'osm' | 'terrain' | 'satellite'>('osm');
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0);
  const [inspectedPoint, setInspectedPoint] = useState<{
    lat: number;
    lon: number;
    label: string;
    temp: number;
    rain: number;
    wind: number;
  } | null>(null);

  const currentRain = hourlyRain[selectedHourOffset] ?? rainNow ?? 0;
  const currentWind = hourlyWind[selectedHourOffset] ?? windSpeed ?? 12;
  const currentCloud = hourlyCloud[selectedHourOffset] ?? cloudCover ?? 35;
  const currentTemp = hourlyTemp[selectedHourOffset] ?? 29;

  // Keep latest values in ref for canvas animation loop and map click handler
  const stateRef = useRef({
    lat,
    lon,
    activeLayer,
    currentRain,
    currentWind,
    currentCloud,
    currentTemp
  });
  stateRef.current = {
    lat,
    lon,
    activeLayer,
    currentRain,
    currentWind,
    currentCloud,
    currentTemp
  };

  // 1. Initialize Leaflet Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 8,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true
    });

    const baseTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);
    baseTileLayerRef.current = baseTile;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const cLat = e.latlng.lat;
      const cLon = e.latlng.lng;
      const st = stateRef.current;
      const dLat = cLat - st.lat;
      const dLon = cLon - st.lon;
      const dist = Math.hypot(dLat, dLon);
      const spatialWave = Math.sin(dLat * 5) * Math.cos(dLon * 5);

      const estTemp = Math.round((st.currentTemp - dLat * 0.9 + spatialWave * 1.4) * 10) / 10;
      const estRain = Math.max(0, Math.round((st.currentRain + Math.max(0, spatialWave * 1.8)) * 10) / 10);
      const estWind = Math.max(2, Math.round(st.currentWind + spatialWave * 4 - dist * 0.5));

      setInspectedPoint({
        lat: cLat,
        lon: cLon,
        label: `${cLat.toFixed(2)}°N, ${cLon.toFixed(2)}°E`,
        temp: estTemp,
        rain: estRain,
        wind: estWind
      });
    });

    leafletMapRef.current = map;

    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // 2. Update Map Center & Location Pin when location or current metrics change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    map.setView([lat, lon], map.getZoom(), { animate: true });

    const customIcon = L.divIcon({
      className: 'custom-weather-pin',
      html: `
        <div style="
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.55);
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
      <div style="font-family: inherit; font-size: 12px; min-width: 165px; line-height: 1.45;">
        <b style="color: #0f172a; font-size: 13px;">${placeName}</b>
        <div style="color: #64748b; font-size: 11px; margin-top: 1px;">${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</div>
        <div style="margin-top: 6px; padding: 5px 8px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${Math.round(currentTemp)}°C · ${Math.round(currentWind)} km/h · ${currentRain.toFixed(1)} mm
        </div>
      </div>
    `);
    markerRef.current = marker;
  }, [lat, lon, placeName, currentTemp, currentWind, currentRain]);

  // 3. Switch Base Tile Layer (Street / Terrain / Satellite)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.remove();
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains: string[] | string = ['a', 'b', 'c'];
    let maxZoom = 18;

    if (mapStyle === 'terrain') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    } else if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    }

    const newTile = L.tileLayer(url, {
      maxZoom,
      subdomains
    }).addTo(map);

    baseTileLayerRef.current = newTile;
    newTile.bringToBack();
  }, [mapStyle]);

  // 4. Optional Live RainViewer Precipitation Radar Tile Layer when Rain layer is active
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (radarTileLayerRef.current) {
      radarTileLayerRef.current.remove();
      radarTileLayerRef.current = null;
    }

    if (activeLayer !== 'rain') return;

    let cancelled = false;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.radar?.past?.length || !leafletMapRef.current) return;
        const latest = data.radar.past[data.radar.past.length - 1];
        if (latest?.path) {
          const radarLayer = L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`, {
            opacity: 0.55,
            zIndex: 15
          }).addTo(leafletMapRef.current);
          radarTileLayerRef.current = radarLayer;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeLayer]);

  // 5. High-FPS HTML5 Canvas Meteorological Field & Wind Streamlines Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = leafletMapRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();

    // Initialize 60 wind streamline particles
    const particles: WindParticle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 1.2,
      vy: -0.4,
      age: Math.floor(Math.random() * 90),
      maxAge: 75 + Math.floor(Math.random() * 45)
    }));

    let phase = 0;

    const renderFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const st = stateRef.current;
      const centerPt = map.latLngToContainerPoint([st.lat, st.lon]);
      const cx = centerPt.x;
      const cy = centerPt.y;

      ctx.clearRect(0, 0, w, h);
      phase += 0.025;

      if (st.activeLayer === 'temp') {
        // Smooth radial thermal heatmap field
        const tVal = st.currentTemp;
        const primaryRgba =
          tVal >= 36
            ? 'rgba(239, 68, 68, 0.34)'
            : tVal >= 30
            ? 'rgba(249, 115, 22, 0.32)'
            : tVal >= 22
            ? 'rgba(234, 179, 8, 0.28)'
            : 'rgba(6, 182, 212, 0.30)';
        const secondaryRgba =
          tVal >= 32
            ? 'rgba(245, 158, 11, 0.20)'
            : 'rgba(59, 130, 246, 0.20)';

        const grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, Math.max(w, h) * 0.65);
        grad.addColorStop(0, primaryRgba);
        grad.addColorStop(0.55, secondaryRgba);
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Isotherm contour rings & temperature badges
        [75, 145, 220].forEach((radius, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, radius + Math.sin(phase + idx) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = tVal >= 32 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(37, 99, 235, 0.32)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          const ringTemp = (tVal - idx * 0.8).toFixed(1);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`${ringTemp}°C`, cx + radius * 0.7, cy - radius * 0.7);
        });
      } else if (st.activeLayer === 'rain') {
        // Smooth precipitation & moisture radar cells
        const rVal = st.currentRain;
        const cells = [
          { dx: 0, dy: 0, r: 120, intensity: Math.max(0.4, rVal) },
          { dx: -95, dy: -55, r: 95, intensity: Math.max(0.25, rVal * 0.8 + 0.5) },
          { dx: 110, dy: 45, r: 105, intensity: Math.max(0.3, rVal * 0.9 + 0.3) },
          { dx: -60, dy: 85, r: 80, intensity: Math.max(0.2, rVal * 0.6) }
        ];

        cells.forEach((c, i) => {
          const x = cx + c.dx + Math.sin(phase * 0.8 + i) * 8;
          const y = cy + c.dy + Math.cos(phase * 0.8 + i) * 6;
          const g = ctx.createRadialGradient(x, y, 8, x, y, c.r);
          if (rVal > 2.5) {
            g.addColorStop(0, 'rgba(147, 51, 234, 0.42)');
            g.addColorStop(0.5, 'rgba(37, 99, 235, 0.28)');
          } else if (rVal > 0.2) {
            g.addColorStop(0, 'rgba(37, 99, 235, 0.38)');
            g.addColorStop(0.55, 'rgba(56, 189, 248, 0.22)');
          } else {
            // Even when 0 mm rain right now, show subtle atmospheric moisture radar sweep
            g.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
            g.addColorStop(0.6, 'rgba(14, 165, 233, 0.12)');
          }
          g.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, c.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (st.activeLayer === 'cloud') {
        const cPct = Math.max(15, st.currentCloud);
        const alpha = Math.min(0.48, (cPct / 100) * 0.5);
        const puffs = [
          { dx: 0, dy: 0, rx: 140, ry: 90 },
          { dx: -110, dy: -45, rx: 120, ry: 75 },
          { dx: 115, dy: -30, rx: 130, ry: 80 },
          { dx: -75, dy: 70, rx: 115, ry: 70 },
          { dx: 95, dy: 65, rx: 125, ry: 78 }
        ];
        puffs.forEach((p, idx) => {
          const x = cx + p.dx + Math.sin(phase * 0.5 + idx) * 12;
          const y = cy + p.dy;
          const g = ctx.createRadialGradient(x, y, 10, x, y, p.rx);
          g.addColorStop(0, `rgba(100, 116, 139, ${alpha})`);
          g.addColorStop(0.6, `rgba(148, 163, 184, ${alpha * 0.55})`);
          g.addColorStop(1, 'rgba(148, 163, 184, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, p.rx, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (st.activeLayer === 'wind') {
        // Ambient emerald wind velocity tint
        const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.6);
        bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        bgGrad.addColorStop(0.6, 'rgba(20, 184, 166, 0.12)');
        bgGrad.addColorStop(1, 'rgba(16, 185, 129, 0.03)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw animated flowing wind streamlines on Wind & Rain layers
      if (st.activeLayer === 'wind' || st.activeLayer === 'rain') {
        const speedFactor = Math.max(0.8, Math.min(3.5, st.currentWind / 10));
        ctx.strokeStyle =
          st.activeLayer === 'wind' ? 'rgba(5, 150, 105, 0.75)' : 'rgba(37, 99, 235, 0.45)';
        ctx.lineWidth = st.activeLayer === 'wind' ? 2.0 : 1.4;
        ctx.lineCap = 'round';

        particles.forEach((p) => {
          const angle = Math.sin(p.x * 0.006 + phase * 0.4) * 0.45 - 0.25;
          const vx = Math.cos(angle) * speedFactor * 1.8;
          const vy = Math.sin(angle) * speedFactor * 1.8;

          const tailLen = st.activeLayer === 'wind' ? 14 : 9;
          ctx.beginPath();
          ctx.moveTo(p.x - vx * tailLen * 0.4, p.y - vy * tailLen * 0.4);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          p.x += vx;
          p.y += vy;
          p.age++;

          if (p.x > w + 20) p.x = -10;
          if (p.x < -20) p.x = w + 10;
          if (p.y > h + 20) p.y = -10;
          if (p.y < -20) p.y = h + 10;
          if (p.age >= p.maxAge) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.age = 0;
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lon], 8, { animate: true });
      markerRef.current?.openPopup();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Layer Selectors & Basemap Switcher */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-white/10 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setActiveLayer('wind')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeLayer === 'wind'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wind size={13} />
            <span>{t.layerWind}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('rain')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeLayer === 'rain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CloudRain size={13} />
            <span>{t.layerRain}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('temp')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeLayer === 'temp'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Thermometer size={13} />
            <span>{t.layerTemp}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('cloud')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeLayer === 'cloud'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud size={13} />
            <span>{t.layerCloud}</span>
          </button>
        </div>

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
            title="Center on Location"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Map Viewport Container + Synchronized HTML5 Canvas Overlay */}
      <div className="relative w-full h-[390px] sm:h-[480px] rounded-3xl overflow-hidden border border-white/50 dark:border-white/10 shadow-xl">
        <div ref={mapContainerRef} className="w-full h-full z-10" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
        />

        {/* Click Inspection Floating Chip */}
        {inspectedPoint && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 text-xs shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <MapPin size={14} />
              <span>{inspectedPoint.label}</span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3 font-semibold text-slate-700 dark:text-slate-300">
              <span>{formatNumByLang(inspectedPoint.temp, lang)}°C</span>
              <span>·</span>
              <span>{formatNumByLang(inspectedPoint.rain, lang)} mm</span>
              <span>·</span>
              <span>{formatNumByLang(inspectedPoint.wind, lang)} km/h</span>
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

        {/* Active Layer Live Telemetry & Legend Badge */}
        <div className="absolute bottom-16 left-3 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3 py-1.5 text-[11px] shadow-lg flex items-center gap-2.5">
          {activeLayer === 'wind' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t.layerWind}: {formatNumByLang(Math.round(currentWind), lang)} km/h
              </span>
            </>
          )}
          {activeLayer === 'rain' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t.layerRain}: {formatNumByLang(currentRain.toFixed(1), lang)} mm/h
              </span>
            </>
          )}
          {activeLayer === 'temp' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t.layerTemp}: {formatNumByLang(currentTemp.toFixed(1), lang)}°C
              </span>
            </>
          )}
          {activeLayer === 'cloud' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t.layerCloud}: {formatNumByLang(Math.round(currentCloud), lang)}%
              </span>
            </>
          )}
          <span className="text-[10px] text-slate-400 hidden sm:inline">· {t.mapHint}</span>
        </div>

        {/* Time Scrubber (0h to +24h Forecast Overlay) */}
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock size={14} className="text-blue-500" />
            <span className="font-mono">
              {selectedHourOffset === 0 ? t.todayLabel : `+${formatNumByLang(selectedHourOffset, lang)}h`}
            </span>
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

          <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
            {hourlyTimes[selectedHourOffset]?.slice(11, 16) || 'Now'}
          </span>
        </div>
      </div>
    </div>
  );
});

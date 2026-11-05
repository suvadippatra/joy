import React, { useRef, useEffect } from 'react';
import { getSunPos, getSunAltitude, getMoonDetails, computeAstroSnapshot } from '../../services/weatherService';
import { Sun, Moon, Compass, Sparkles, Globe2 } from 'lucide-react';

interface WeatherGlobeProps {
  lat: number;
  lon: number;
  placeName: string;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm360 = (x: number) => ((x % 360) + 360) % 360;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export const WeatherGlobe: React.FC<WeatherGlobeProps> = ({ lat, lon, placeName }) => {
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const moonCanvasRef = useRef<HTMLCanvasElement>(null);

  const now = new Date();
  const astro = computeAstroSnapshot(now, lat, lon);

  // Draw day-night terminator globe centred on lat/lon
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const img = ctx.createImageData(W, H);
    const s = getSunPos(now);
    const decS = s.dec;
    const lamS = norm360(s.ra - s.gmst);

    const Sv = [Math.cos(decS) * Math.cos(rad(lamS)), Math.cos(decS) * Math.sin(rad(lamS)), Math.sin(decS)];
    const la = rad(lat);
    const lo = rad(lon);

    // Vector pointing to user's place
    const C = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    // East vector
    const E = [-Math.sin(lo), Math.cos(lo), 0];
    // North vector
    const N = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];

    const cx = W / 2;
    const cy = H / 2;
    const R = W / 2 - 12;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = (px - cx) / R;
        const y = (cy - py) / R;
        const rr = x * x + y * y;
        const i = (py * W + px) * 4;

        if (rr > 1) {
          img.data[i + 3] = 0;
          continue;
        }

        const z = Math.sqrt(1 - rr);
        const P0 = x * E[0] + y * N[0] + z * C[0];
        const P1 = x * E[1] + y * N[1] + z * C[1];
        const P2 = x * E[2] + y * N[2] + z * C[2];

        const dot = P0 * Sv[0] + P1 * Sv[1] + P2 * Sv[2];
        const day = clamp((dot + 0.1) / 0.25, 0, 1);
        const shade = 0.25 + 0.75 * Math.max(0, dot);

        // Vibrant oceanic day / deep night colors
        const oceanDay = [14, 116, 185];
        const oceanNight = [11, 22, 44];

        const mix = (a: number, b: number, t: number) => a + (b - a) * t;
        img.data[i] = Math.round(mix(oceanNight[0], oceanDay[0] * shade, day));
        img.data[i + 1] = Math.round(mix(oceanNight[1], oceanDay[1] * shade, day));
        img.data[i + 2] = Math.round(mix(oceanNight[2], oceanDay[2] * shade, day));
        img.data[i + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    // Subtle atmospheric rim ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // User's location marker right in the centre
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pulse ring
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.stroke();
  }, [lat, lon]);

  // Draw Moon Phase
  useEffect(() => {
    const canvas = moonCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = W / 2 - 4;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(cx, cy);

    const m = getMoonDetails(now);
    if (m.age >= m.SYN / 2) {
      ctx.scale(-1, 1);
    }

    const lit = '#fef08a';
    const dark = '#1e293b';

    ctx.fillStyle = lit;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.fill();

    const k = Math.cos((2 * Math.PI * m.age) / m.SYN);
    if (k > 0) {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(0, 0, k * r, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
    } else if (k < 0) {
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.ellipse(0, 0, -k * r, r, 0, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.fill();
    }

    ctx.restore();
  }, [lat, lon]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      {/* Globe Canvas */}
      <div className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
          <Globe2 size={14} />
          <span>Real-time Earth Sun Terminator</span>
        </div>
        <canvas
          ref={globeCanvasRef}
          width={240}
          height={240}
          className="rounded-full shadow-lg shadow-blue-500/10 cursor-pointer max-w-[210px] sm:max-w-[240px] aspect-square"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2 font-medium">
          Centre mark = <span className="text-rose-500 font-bold">{placeName}</span> ({lat.toFixed(2)}°N, {lon.toFixed(2)}°E)
        </p>
      </div>

      {/* Moon & Celestial metrics */}
      <div className="flex flex-col gap-3 p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <canvas ref={moonCanvasRef} width={64} height={64} className="rounded-full shadow-md" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Moon Phase &amp; Age</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{astro.moonAge} days</span>
                <span className="text-xs font-normal text-amber-500">({astro.moonIllumination}% lit)</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            {astro.paksha} Paksha
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Sun size={12} className="text-amber-500" />
              <span>Sun Altitude</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
              {astro.sunAltitude}°
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Compass size={12} className="text-blue-500" />
              <span>Sun Distance</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
              {astro.sunDistanceMkm} M km
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Moon size={12} className="text-indigo-400" />
              <span>Next Full Moon</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">
              {astro.nextFullMoon}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-400" />
              <span>Next New Moon</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">
              {astro.nextNewMoon}
            </div>
          </div>
        </div>

        <div className="mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Tithi at Sunrise:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">{astro.tithiName}</span>
        </div>
      </div>
    </div>
  );
};

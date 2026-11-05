import React, { useState } from 'react';
import { Sun, Moon, Compass, Sparkles, Clock, Waves, ChevronRight } from 'lucide-react';
import { SunMoonInfo, getSunAltitudeAndAzimuth } from '../../services/weatherService';
import { LangId, TRANSLATIONS, TITHI_TRANSLATIONS, PAKSHA_TRANSLATIONS } from '../../services/weatherTranslations';

interface SunMoonViewProps {
  lat: number;
  lon: number;
  placeName: string;
  astro: SunMoonInfo;
  sunriseTime: string;
  sunsetTime: string;
  lang: LangId;
}

export const SunMoonView: React.FC<SunMoonViewProps> = ({
  lat,
  lon,
  placeName,
  astro,
  sunriseTime,
  sunsetTime,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [sliderHour, setSliderHour] = useState<number>(() => new Date().getHours());

  // Interactive Sun position for scrubbed hour
  const now = new Date();
  const scrubDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sliderHour, 30);
  const scrubSun = getSunAltitudeAndAzimuth(scrubDate, lat, lon);

  // Format sunrise / sunset (e.g. "05:42")
  const sr = sunriseTime ? sunriseTime.slice(11, 16) : '05:42';
  const ss = sunsetTime ? sunsetTime.slice(11, 16) : '17:51';

  // Sun Arc Coordinates (SVG 300x160)
  // Arc starts at (30, 130), peaks at (150, 30), ends at (270, 130)
  // Clamp scrubbed altitude between -10 and 90
  const normalizedAlt = Math.max(0, Math.min(90, scrubSun.altitude));
  // Progress along the arc: 0 (sunrise ~ 6am) to 1 (sunset ~ 18pm)
  const dayProgress = Math.max(0, Math.min(1, (sliderHour - 5.5) / 12.5));
  
  // Parabolic sun coordinates
  const sunX = 30 + dayProgress * 240;
  const sunY = 130 - Math.sin(dayProgress * Math.PI) * 100;
  const isAboveHorizon = scrubSun.altitude > 0;

  // Moon Phase visualization (SVG 100x100)
  // Illumination percentage: 0 to 100
  const illumFraction = astro.moonIllumination / 100;
  const isWaxing = astro.paksha === 'Shukla';

  // Translated Tithi & Paksha
  const baseTithi = astro.tithiName.replace('Shukla ', '').replace('Krishna ', '').trim();
  const translatedTithi = TITHI_TRANSLATIONS[baseTithi]?.[lang] || astro.tithiName;
  const translatedPaksha = PAKSHA_TRANSLATIONS[astro.paksha]?.[lang] || astro.paksha;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {t.skyTitle} · {placeName}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Lat {lat.toFixed(2)}° · Lon {lon.toFixed(2)}°
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: SUN TRACK & DAYLIGHT ARC */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sun size={15} className="text-amber-500" />
              <span>{t.sunTrackTitle}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {astro.sunAltitude > 0 ? `${astro.sunAltitude}° Above Horizon` : `${Math.abs(astro.sunAltitude)}° Below Horizon (Night)`}
            </span>
          </div>

          {/* SVG Sun Sky Dome */}
          <div className="relative w-full aspect-[2/1] max-h-48 my-1 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 300 150" className="w-full h-full">
              {/* Sky background gradient */}
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              {/* Sky Arc Area */}
              <path
                d="M 30,130 A 120,100 0 0,1 270,130"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="text-amber-400/50 dark:text-amber-500/40"
              />

              {/* Horizon Line */}
              <line
                x1="15"
                y1="130"
                x2="285"
                y2="130"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-300 dark:text-slate-700"
              />

              {/* Sunrise Marker */}
              <circle cx="30" cy="130" r="4" fill="#f97316" />
              <text x="30" y="145" fontSize="8" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-semibold font-mono">
                {sr}
              </text>

              {/* Sunset Marker */}
              <circle cx="270" cy="130" r="4" fill="#f97316" />
              <text x="270" y="145" fontSize="8" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-semibold font-mono">
                {ss}
              </text>

              {/* Solar Noon Marker */}
              <line x1="150" y1="26" x2="150" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="150" y="22" fontSize="7.5" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-bold">
                Solar Noon (Peak)
              </text>

              {/* Interactive Sun Orb */}
              {isAboveHorizon ? (
                <g transform={`translate(${sunX}, ${sunY})`}>
                  {/* Outer glow ring */}
                  <circle cx="0" cy="0" r="14" fill="#f59e0b" opacity="0.25" className="animate-ping" />
                  <circle cx="0" cy="0" r="10" fill="url(#sunGlow)" filter="drop-shadow(0 2px 4px rgba(245,158,11,0.5))" />
                  <circle cx="0" cy="0" r="5" fill="#fffbeb" />
                </g>
              ) : (
                <g transform={`translate(${sliderHour < 12 ? 30 : 270}, 136)`}>
                  <circle cx="0" cy="0" r="6" fill="#475569" opacity="0.7" />
                  <text x="0" y="10" fontSize="7" textAnchor="middle" className="fill-slate-400">Night</text>
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Scrub Slider */}
          <div className="flex flex-col gap-1.5 mt-2 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-amber-500" />
                <span>Simulated Hour: {sliderHour.toString().padStart(2, '0')}:00</span>
              </span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                Alt: {scrubSun.altitude.toFixed(1)}° · Az: {scrubSun.azimuth.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={sliderHour}
              onChange={(e) => setSliderHour(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>00:00</span>
              <span>06:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Dusk)</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Sun Metrics Bento */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">{t.sunrise}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{sr}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">{t.sunset}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{ss}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-medium">{t.dayLength}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{astro.dayLengthHours}h</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MOON PHASE & PANCHANGA TITHI */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Moon size={15} className="text-indigo-500" />
              <span>{t.moonTrackTitle}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              {translatedPaksha}
            </span>
          </div>

          {/* Moon Visual Sphere & Tithi Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
            {/* Visual Moon Disc */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <defs>
                  <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                  </radialGradient>
                  {/* Moon surface texture */}
                  <pattern id="craterPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1.5" fill="#cbd5e1" opacity="0.3" />
                    <circle cx="14" cy="12" r="2" fill="#cbd5e1" opacity="0.25" />
                  </pattern>
                </defs>

                {/* Outer halo glow */}
                <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />

                {/* Dark Moon Base */}
                <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#334155" strokeWidth="1" />

                {/* Illuminated Shape approximation */}
                {astro.moonIllumination >= 90 ? (
                  // Full Moon
                  <circle cx="50" cy="50" r="40" fill="#fef08a" />
                ) : astro.moonIllumination <= 8 ? (
                  // New Moon
                  <circle cx="50" cy="50" r="40" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                ) : (
                  // Waxing or Waning Crescent / Gibbous
                  <g>
                    {/* Lit background half */}
                    <path
                      d={isWaxing ? "M 50,10 A 40,40 0 0,1 50,90 Z" : "M 50,10 A 40,40 0 0,0 50,90 Z"}
                      fill="#fef08a"
                    />
                    {/* Elliptical terminator curve */}
                    <ellipse
                      cx="50"
                      cy="50"
                      rx={Math.abs(40 * Math.cos((astro.moonAge / 29.53) * 2 * Math.PI))}
                      ry="40"
                      fill={astro.moonIllumination > 50 ? "#fef08a" : "#1e293b"}
                    />
                  </g>
                )}

                {/* Subtle crater overlay */}
                <circle cx="50" cy="50" r="40" fill="url(#craterPattern)" />
              </svg>

              {/* Illumination % Badge */}
              <div className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 font-bold font-mono text-[10px] border border-amber-300/30">
                {astro.moonIllumination}%
              </div>
            </div>

            {/* Tithi & Details Breakdown */}
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-[10px] text-slate-400 font-medium block">{t.tithiLabel}</span>
                <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                  {translatedTithi} ({astro.tithiNumber}/15)
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                  {translatedPaksha} · Day {astro.moonAge} of 29.5d
                </span>
              </div>

              {/* Tidal Indicator */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                  <Waves size={13} className="text-cyan-500" /> {t.tideRange}:
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${astro.tideStrength.cls}`}>
                  {astro.tideStrength.label}
                </span>
              </div>
            </div>
          </div>

          {/* Next Full & New Moon Dates */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">{t.nextFullMoon}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {astro.nextFullMoon}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">{t.nextNewMoon}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {astro.nextNewMoon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

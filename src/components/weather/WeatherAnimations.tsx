import React from 'react';

interface WeatherAnimationsProps {
  weatherCode: number;
  isDay: number;
  precipitation: number;
  enabled?: boolean;
}

export const WeatherAnimations: React.FC<WeatherAnimationsProps> = ({
  weatherCode,
  isDay,
  precipitation,
  enabled = true
}) => {
  if (!enabled) return null;

  const isRain = precipitation > 0 || (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isThunder = weatherCode >= 95;
  const isCloudy = (weatherCode >= 2 && weatherCode <= 3) || weatherCode === 45 || weatherCode === 48;
  const isClearDay = isDay === 1 && (weatherCode === 0 || weatherCode === 1);
  const isClearNight = isDay === 0 && (weatherCode === 0 || weatherCode === 1);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(45px, 60px, 0) scale(1.15); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.1); }
          50% { transform: translate3d(-50px, -45px, 0) scale(0.95); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.35; }
          50% { transform: translate3d(60px, -35px, 0); opacity: 0.6; }
        }
        @keyframes cloud-glide-1 {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes cloud-glide-2 {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
        @keyframes sun-shimmer {
          0%, 100% { opacity: 0.45; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.75; transform: scale(1.12) rotate(10deg); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.3); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(-80px) translateX(0); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { transform: translateY(105vh) translateX(-28px); opacity: 0; }
        }
        @keyframes thunder-flash {
          0%, 92%, 97%, 100% { opacity: 0; }
          93%, 95% { opacity: 0.75; }
          94% { opacity: 0.2; }
        }
      `}</style>

      {/* Floating Atmosphere Light Orbs (Noticeable, rich, living ambient lights) */}
      <div
        className="absolute -top-28 -left-20 w-[600px] h-[600px] rounded-full blur-2xl pointer-events-none opacity-45 dark:opacity-25 will-change-transform"
        style={{
          background: isClearDay
            ? 'radial-gradient(circle, rgba(253,224,71,0.65) 0%, rgba(56,189,248,0.35) 100%)'
            : isRain
            ? 'radial-gradient(circle, rgba(37,99,235,0.7) 0%, rgba(30,41,59,0.3) 100%)'
            : isThunder
            ? 'radial-gradient(circle, rgba(147,51,234,0.65) 0%, rgba(30,27,75,0.3) 100%)'
            : 'radial-gradient(circle, rgba(14,165,233,0.55) 0%, rgba(99,102,241,0.25) 100%)',
          animation: 'float-orb-1 16s ease-in-out infinite'
        }}
      />

      <div
        className="absolute top-1/3 -right-28 w-[540px] h-[540px] rounded-full blur-2xl pointer-events-none opacity-40 dark:opacity-20 will-change-transform"
        style={{
          background: isClearDay
            ? 'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(2,132,199,0.35) 100%)'
            : isRain
            ? 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(15,23,42,0.4) 100%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(15,23,42,0.3) 100%)',
          animation: 'float-orb-2 20s ease-in-out infinite'
        }}
      />

      <div
        className="absolute bottom-10 left-1/4 w-[620px] h-[480px] rounded-full blur-2xl pointer-events-none opacity-35 dark:opacity-15 will-change-transform"
        style={{
          background: isClearNight
            ? 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(15,23,42,0.4) 100%)'
            : isRain
            ? 'radial-gradient(circle, rgba(30,58,138,0.6) 0%, rgba(30,41,59,0.3) 100%)'
            : 'radial-gradient(circle, rgba(2,132,199,0.5) 0%, rgba(14,165,233,0.2) 100%)',
          animation: 'float-orb-3 24s ease-in-out infinite'
        }}
      />

      {/* Floating Animated Cloud Layers (Visible drifting clouds across the sky) */}
      <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none opacity-40 dark:opacity-25">
        <div
          className="absolute top-6 w-[480px] h-32 rounded-full blur-2xl bg-white/70 dark:bg-slate-400/30"
          style={{ animation: 'cloud-glide-1 42s linear infinite' }}
        />
        <div
          className="absolute top-24 w-[620px] h-36 rounded-full blur-3xl bg-sky-200/50 dark:bg-slate-500/25"
          style={{ animation: 'cloud-glide-2 56s linear infinite', animationDelay: '-18s' }}
        />
      </div>

      {/* Rain Drops Animation */}
      {isRain && (
        <div className="absolute inset-0 w-full h-full opacity-45 dark:opacity-55">
          {Array.from({ length: 18 }).map((_, i) => {
            const left = (i * 3.1) % 100;
            const duration = 0.7 + (i % 5) * 0.12;
            const delay = (i * 0.1) % 1.4;
            return (
              <div
                key={`rain-${i}`}
                className="absolute w-[1.5px] h-[30px] rounded-full bg-gradient-to-b from-transparent to-sky-300 dark:to-sky-400"
                style={{
                  left: `${left}%`,
                  top: '-30px',
                  animation: `rain-fall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Thunder Flash */}
      {isThunder && (
        <div className="absolute inset-0 w-full h-full opacity-20 dark:opacity-25">
          <div
            className="w-full h-full bg-indigo-200 dark:bg-indigo-300"
            style={{ animation: 'thunder-flash 7s ease-in-out infinite' }}
          />
        </div>
      )}

      {/* Radiant Sun Shimmer */}
      {isClearDay && (
        <div className="absolute top-0 right-0 w-[420px] h-[420px] pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-3xl bg-amber-300/40 dark:bg-amber-500/20"
            style={{ animation: 'sun-shimmer 9s ease-in-out infinite' }}
          />
        </div>
      )}

      {/* Starfield with Twinkle */}
      {isClearNight && (
        <div className="absolute inset-0 w-full h-80 opacity-55 dark:opacity-75 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => {
            const top = (i * 13) % 85;
            const left = (i * 19) % 95;
            const duration = 2.0 + (i % 4) * 0.8;
            const delay = (i * 0.35) % 2.5;
            return (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 rounded-full bg-white"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animation: `star-twinkle ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

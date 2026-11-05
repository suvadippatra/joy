import React from 'react';

interface WeatherAnimationsProps {
  weatherCode: number;
  isDay: number;
  precipitation: number;
  enabled?: boolean;
}

export const WeatherAnimations: React.FC<WeatherAnimationsProps> = React.memo(({
  weatherCode,
  isDay,
  precipitation,
  enabled = true
}) => {
  if (!enabled) return null;

  const isRain = precipitation > 0 || (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isThunder = weatherCode >= 95;
  const isClearDay = isDay === 1 && (weatherCode === 0 || weatherCode === 1);
  const isClearNight = isDay === 0 && (weatherCode === 0 || weatherCode === 1);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      <style>{`
        @keyframes qp-orb-drift-1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(36px, 42px, 0) scale(1.08); }
        }
        @keyframes qp-orb-drift-2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); }
          50% { transform: translate3d(-40px, -32px, 0) scale(0.96); }
        }
        @keyframes qp-cloud-pass {
          0% { transform: translate3d(-35%, 0, 0); }
          50% { transform: translate3d(25%, 6px, 0); }
          100% { transform: translate3d(-35%, 0, 0); }
        }
        @keyframes qp-star-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.95; transform: scale(1.25); }
        }
        @keyframes qp-rain-streak {
          0% { transform: translate3d(0, -60px, 0); opacity: 0; }
          20% { opacity: 0.75; }
          85% { opacity: 0.75; }
          100% { transform: translate3d(-24px, 95vh, 0); opacity: 0; }
        }
        @keyframes qp-lightning {
          0%, 93%, 97%, 100% { opacity: 0; }
          94%, 96% { opacity: 0.45; }
          95% { opacity: 0.1; }
        }
      `}</style>

      {/* Pure GPU-composited multi-stop radial gradients (zero CSS filter:blur overhead!) */}
      <div
        className="absolute -top-32 -left-24 w-[560px] h-[560px] rounded-full opacity-55 dark:opacity-30"
        style={{
          background: isClearDay
            ? 'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(56,189,248,0.22) 45%, transparent 72%)'
            : isRain
            ? 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(30,58,138,0.2) 48%, transparent 72%)'
            : isThunder
            ? 'radial-gradient(circle, rgba(147,51,234,0.48) 0%, rgba(49,46,129,0.2) 48%, transparent 72%)'
            : 'radial-gradient(circle, rgba(14,165,233,0.45) 0%, rgba(99,102,241,0.18) 48%, transparent 72%)',
          animation: 'qp-orb-drift-1 18s ease-in-out infinite',
          willChange: 'transform'
        }}
      />

      <div
        className="absolute top-1/4 -right-28 w-[520px] h-[520px] rounded-full opacity-45 dark:opacity-25"
        style={{
          background: isClearDay
            ? 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, rgba(2,132,199,0.2) 45%, transparent 72%)'
            : isClearNight
            ? 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(30,27,75,0.2) 48%, transparent 72%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(15,23,42,0.18) 48%, transparent 72%)',
          animation: 'qp-orb-drift-2 22s ease-in-out infinite',
          willChange: 'transform'
        }}
      />

      {/* Soft Cloud Band (Zero blur filter — pure gradient) */}
      <div
        className="absolute top-4 left-0 right-0 h-56 opacity-45 dark:opacity-25"
        style={{
          background:
            'radial-gradient(ellipse 38% 45% at 30% 40%, rgba(255,255,255,0.55) 0%, transparent 70%), radial-gradient(ellipse 42% 50% at 72% 55%, rgba(224,242,254,0.45) 0%, transparent 72%)',
          animation: 'qp-cloud-pass 36s ease-in-out infinite',
          willChange: 'transform'
        }}
      />

      {/* Rain Streaks */}
      {isRain && (
        <div className="absolute inset-0 w-full h-full opacity-55">
          {Array.from({ length: 14 }).map((_, i) => {
            const left = (i * 7.1) % 98;
            const duration = 0.75 + (i % 4) * 0.14;
            const delay = (i * 0.13) % 1.2;
            return (
              <div
                key={`rain-${i}`}
                className="absolute w-[1.5px] h-[28px] rounded-full bg-gradient-to-b from-transparent to-sky-200 dark:to-sky-400"
                style={{
                  left: `${left}%`,
                  top: '-30px',
                  animation: `qp-rain-streak ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  willChange: 'transform'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Thunder Flash */}
      {isThunder && (
        <div
          className="absolute inset-0 w-full h-full bg-indigo-200 dark:bg-indigo-300"
          style={{ animation: 'qp-lightning 7s ease-in-out infinite' }}
        />
      )}

      {/* Night Sky Stars */}
      {isClearNight && (
        <div className="absolute inset-0 w-full h-72 opacity-70">
          {Array.from({ length: 14 }).map((_, i) => {
            const top = (i * 13 + 7) % 80;
            const left = (i * 19 + 5) % 96;
            const duration = 2.2 + (i % 4) * 0.7;
            const delay = (i * 0.3) % 2.1;
            return (
              <div
                key={`star-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animation: `qp-star-pulse ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

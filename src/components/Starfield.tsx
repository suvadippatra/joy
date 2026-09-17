import React from 'react';

export const Starfield: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="mesh-gradient"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="stars-container opacity-40 dark:opacity-100 transition-opacity duration-500">
        <div className="stars1"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
    </div>
  );
};

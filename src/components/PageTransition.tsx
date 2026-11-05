import React from 'react';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in duration-200">
      {children}
    </div>
  );
};


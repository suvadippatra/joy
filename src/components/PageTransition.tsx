import React from 'react';
import { motion } from 'motion/react';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1 w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

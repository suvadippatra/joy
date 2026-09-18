import React from 'react';
import { motion } from 'motion/react';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-1 w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

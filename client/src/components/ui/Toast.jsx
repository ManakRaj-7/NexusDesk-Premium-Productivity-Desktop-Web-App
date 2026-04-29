import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Toast = ({ 
  message, 
  type = 'info', 
  onClose,
  autoClose = true 
}) => {
  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-600 text-white',
    info: 'bg-primary-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={clsx(
        'px-6 py-3 rounded-lg shadow-soft-lg font-medium',
        typeStyles[type]
      )}
    >
      {message}
    </motion.div>
  );
};

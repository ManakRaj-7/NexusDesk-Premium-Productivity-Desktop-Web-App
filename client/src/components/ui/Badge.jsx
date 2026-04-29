import clsx from 'clsx';

export const Badge = ({ 
  variant = 'default', 
  children, 
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-slate-700 text-slate-100',
    primary: 'bg-primary-500 text-white',
    accent: 'bg-accent-500 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-600 text-white',
    danger: 'bg-red-600 text-white',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

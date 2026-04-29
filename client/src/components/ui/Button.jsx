import clsx from 'clsx';

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  disabled,
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50',
    secondary: 'bg-dark-card border border-dark-border text-slate-100 hover:bg-dark-hover',
    ghost: 'text-slate-300 hover:text-slate-100 hover:bg-dark-hover',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

import clsx from 'clsx';

export const Input = ({ 
  label, 
  error, 
  className,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-slate-100 placeholder-slate-500',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent transition',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

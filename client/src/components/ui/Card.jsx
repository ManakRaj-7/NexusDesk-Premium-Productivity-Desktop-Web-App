import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-dark-card border border-dark-border rounded-xl p-4 shadow-soft transition-all duration-200 hover:shadow-soft-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

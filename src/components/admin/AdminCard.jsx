import React from 'react';

export const AdminCard = ({ children, className = "", noPadding = false, title, action }) => {
  return (
    <div className={`bg-admin-card border border-admin-border rounded-xl flex flex-col overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between bg-admin-card/50">
          {title && <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6'} flex-1`}>
        {children}
      </div>
    </div>
  );
};

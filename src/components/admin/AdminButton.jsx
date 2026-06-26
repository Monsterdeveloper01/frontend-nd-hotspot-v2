import React from 'react';

export const AdminButton = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false, icon: Icon }) => {
  let baseClass = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  let variantClass = "";

  switch (variant) {
    case 'primary':
      variantClass = "bg-admin-accent text-white hover:bg-admin-accent/90 shadow-sm";
      break;
    case 'secondary':
      variantClass = "bg-admin-base text-admin-text border border-admin-border hover:bg-zinc-700";
      break;
    case 'danger':
      variantClass = "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20";
      break;
    case 'ghost':
      variantClass = "text-admin-muted hover:text-admin-text hover:bg-admin-base";
      break;
    default:
      variantClass = "bg-admin-accent text-white hover:bg-admin-accent/90 shadow-sm";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

import React from 'react';

export const AdminBadge = ({ status, text, className = "" }) => {
  let colorClass = "bg-admin-base text-admin-muted border-admin-border";
  let dotClass = "bg-zinc-500";
  
  const statusLower = status?.toLowerCase();
  
  if (statusLower === 'success' || statusLower === 'online' || statusLower === 'active' || statusLower === 'aktif') {
    colorClass = "bg-admin-success/10 text-admin-success border-admin-success/20";
    dotClass = "bg-admin-success";
  } else if (statusLower === 'error' || statusLower === 'offline' || statusLower === 'down' || statusLower === 'nonaktif') {
    colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
    dotClass = "bg-red-500";
  } else if (statusLower === 'warning' || statusLower === 'pending') {
    colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    dotClass = "bg-amber-500";
  } else if (statusLower === 'info') {
    colorClass = "bg-admin-accent/10 text-admin-accent border-admin-accent/20";
    dotClass = "bg-admin-accent";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {text || status}
    </span>
  );
};

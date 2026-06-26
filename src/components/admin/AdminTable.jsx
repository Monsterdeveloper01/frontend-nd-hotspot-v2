import React from 'react';

export const AdminTable = ({ columns, data, keyField = "id", emptyMessage = "No data available", onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`py-3 px-4 text-xs font-semibold text-admin-muted border-b border-admin-border uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-admin-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-admin-base/50' : 'hover:bg-admin-base/30'}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`py-3 px-4 text-sm text-admin-text ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

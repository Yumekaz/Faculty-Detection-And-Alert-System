'use client';

import { ReactNode } from 'react';

interface Column {
    header: string;
    accessor?: string;
    render?: (row: any) => ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    emptyMessage?: string;
}

export function Table({ columns, data, emptyMessage = 'No data available' }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-slate-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-4 py-4 text-sm text-slate-700">
                                        {col.render ? col.render(row) : col.accessor ? String(row[col.accessor] ?? '') : ''}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

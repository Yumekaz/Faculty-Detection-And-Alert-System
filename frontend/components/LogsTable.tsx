"use client";

import React from "react";

// --- Types ---
export interface LogEntry {
    timestamp: string;
    status: string;
    name: string | null;
    confidence: number | string | null;
    period: string | null;
    mode: string;
}

interface LogsTableProps {
    logs: LogEntry[];
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}

// --- Component ---
export default function LogsTable({
    logs,
    isLoading = false,
    emptyMessage = "No logs available",
    className = "",
}: LogsTableProps) {
    // Format timestamp
    const formatTimestamp = (ts: string) => {
        try {
            return new Date(ts).toLocaleString();
        } catch {
            return ts;
        }
    };

    // Format confidence
    const formatConfidence = (conf: number | string | null) => {
        if (conf === null || conf === undefined || conf === "") return "—";
        if (typeof conf === "string") return conf;
        return `${(conf * 100).toFixed(1)}%`;
    };

    // Get status badge class
    const getStatusClass = (status: string) => {
        switch (status) {
            case "Present":
                return "logs-table__status--present";
            case "Absent":
                return "logs-table__status--absent";
            case "Error":
                return "logs-table__status--error";
            default:
                return "";
        }
    };

    // Get mode badge class
    const getModeClass = (mode: string) => {
        return mode === "auto" ? "logs-table__mode--auto" : "logs-table__mode--manual";
    };

    if (isLoading) {
        return (
            <div className={`logs-table-container logs-table-container--loading ${className}`}>
                <div className="logs-table__spinner" />
                <p>Loading logs...</p>
                <style jsx>{styles}</style>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className={`logs-table-container logs-table-container--empty ${className}`}>
                <p>{emptyMessage}</p>
                <style jsx>{styles}</style>
            </div>
        );
    }

    return (
        <div className={`logs-table-container ${className}`}>
            <table className="logs-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Confidence</th>
                        <th>Period</th>
                        <th>Mode</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td className="logs-table__timestamp">{formatTimestamp(log.timestamp)}</td>
                            <td>
                                <span className={`logs-table__status ${getStatusClass(log.status)}`}>
                                    {log.status.replace("_", " ")}
                                </span>
                            </td>
                            <td className="logs-table__name">{log.name || "—"}</td>
                            <td className="logs-table__confidence">{formatConfidence(log.confidence)}</td>
                            <td className="logs-table__period">{log.period || "—"}</td>
                            <td>
                                <span className={`logs-table__mode ${getModeClass(log.mode)}`}>{log.mode}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
  .logs-table-container {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
  }

  .logs-table-container--loading,
  .logs-table-container--empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #64748b;
    text-align: center;
  }

  .logs-table__spinner {
    width: 32px;
    height: 32px;
    margin-bottom: 1rem;
    border: 3px solid rgba(99, 102, 241, 0.2);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .logs-table {
    width: 100%;
    border-collapse: collapse;
  }

  .logs-table th,
  .logs-table td {
    padding: 0.875rem 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .logs-table th {
    background: rgba(255, 255, 255, 0.03);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  .logs-table tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .logs-table__timestamp {
    font-family: monospace;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .logs-table__status {
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .logs-table__status--present {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
  }

  .logs-table__status--absent {
    background: rgba(251, 191, 36, 0.15);
    color: #fde047;
  }

  .logs-table__status--error {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }

  .logs-table__name {
    font-weight: 500;
    color: #e2e8f0;
  }

  .logs-table__confidence {
    font-family: monospace;
    color: #94a3b8;
  }

  .logs-table__period {
    color: #a5b4fc;
  }

  .logs-table__mode {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .logs-table__mode--manual {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
  }

  .logs-table__mode--auto {
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
  }
`;

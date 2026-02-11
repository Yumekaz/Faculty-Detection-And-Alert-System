const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
  status: string;
  details: string;
}

export async function getAuditLogs(limit = 200): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/audit/logs?limit=${limit}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to load audit logs');
  }
  const data = await res.json();
  return data.logs || [];
}

export function auditExportUrl() {
  return `${API_BASE}/audit/export`;
}

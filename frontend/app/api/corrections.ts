const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CorrectionRequest {
  id?: string;
  faculty_name: string;
  date: string; // YYYY-MM-DD
  period?: string | null;
  reason: string;
  requester?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewer?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function createCorrection(payload: CorrectionRequest) {
  const res = await fetch(`${API_BASE}/corrections/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create correction request');
  }
  return res.json();
}

export async function listCorrections(status?: string) {
  const url = status ? `${API_BASE}/corrections/list?status=${encodeURIComponent(status)}` : `${API_BASE}/corrections/list`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to load corrections');
  }
  return res.json();
}

export async function reviewCorrection(id: string, status: 'approved' | 'rejected', reviewer?: string, notes?: string) {
  const res = await fetch(`${API_BASE}/corrections/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reviewer, notes }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to review correction');
  }
  return res.json();
}

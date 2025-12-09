"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { deleteFaculty } from "../../api/recognition";

export default function FacultyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const name = decodeURIComponent(params.name as string);

    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await deleteFaculty(name);
            router.push("/faculty");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete faculty");
            setIsDeleting(false);
        }
    };

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
            <NavBar />
            <main className="faculty-detail">
                <Link href="/faculty" className="faculty-detail__back">← Back to Directory</Link>

                <div className="faculty-detail__card">
                    <div className="faculty-detail__avatar">{initials}</div>
                    <h1 className="faculty-detail__name">{name}</h1>
                    <p className="faculty-detail__status">Registered Faculty Member</p>

                    {error && <div className="faculty-detail__error">{error}</div>}

                    <div className="faculty-detail__actions">
                        <button onClick={handleDelete} disabled={isDeleting} className="faculty-detail__btn faculty-detail__btn--danger">
                            {isDeleting ? (
                                <><span className="spinner" /> Deleting...</>
                            ) : (
                                <>🗑️ Delete Faculty</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="faculty-detail__info-section">
                    <h2>Information</h2>
                    <div className="faculty-detail__info-grid">
                        <div className="info-item">
                            <span className="info-item__label">Status</span>
                            <span className="info-item__value info-item__value--active">Active</span>
                        </div>
                        <div className="info-item">
                            <span className="info-item__label">Face Encoding</span>
                            <span className="info-item__value">Registered</span>
                        </div>
                    </div>
                </div>

                <style jsx>{`
          .faculty-detail { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .faculty-detail__back { display: inline-block; color: #818cf8; text-decoration: none; font-size: 0.9rem; margin-bottom: 2rem; }
          .faculty-detail__back:hover { color: #a5b4fc; }

          .faculty-detail__card { max-width: 500px; margin: 0 auto 2rem; padding: 2.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; text-align: center; }
          .faculty-detail__avatar { width: 100px; height: 100px; margin: 0 auto 1.5rem; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; color: white; }
          .faculty-detail__name { font-size: 1.75rem; font-weight: 700; margin: 0; color: #f1f5f9; }
          .faculty-detail__status { color: #64748b; margin: 0.5rem 0 0; }

          .faculty-detail__error { margin-top: 1.5rem; padding: 0.75rem 1rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #fca5a5; font-size: 0.9rem; }

          .faculty-detail__actions { margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; }
          .faculty-detail__btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
          .faculty-detail__btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .faculty-detail__btn--danger { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
          .faculty-detail__btn--danger:hover:not(:disabled) { background: rgba(239,68,68,0.25); }

          .faculty-detail__info-section { max-width: 500px; margin: 0 auto; }
          .faculty-detail__info-section h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem; color: #e2e8f0; }
          .faculty-detail__info-grid { display: flex; flex-direction: column; gap: 0.75rem; }
          .info-item { display: flex; justify-content: space-between; padding: 1rem 1.25rem; background: rgba(255,255,255,0.02); border-radius: 10px; }
          .info-item__label { color: #64748b; }
          .info-item__value { font-weight: 500; color: #e2e8f0; }
          .info-item__value--active { color: #86efac; }

          .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
            </main>
        </>
    );
}

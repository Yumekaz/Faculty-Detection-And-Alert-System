"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { getFullSchedule, updateSchedule, formatTime, sortScheduleByPeriod, type SchedulePeriod } from "../api/schedule";

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<SchedulePeriod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [editingPeriod, setEditingPeriod] = useState<SchedulePeriod | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const [newPeriod, setNewPeriod] = useState<SchedulePeriod>({
        period: schedule.length + 1,
        start: "09:00",
        end: "10:00",
        faculty: "",
        subject: "",
    });

    useEffect(() => { loadSchedule(); }, []);

    const loadSchedule = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getFullSchedule();
            setSchedule(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load schedule");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateSchedule(schedule);
            setMessage("Schedule saved successfully!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save schedule");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddPeriod = () => {
        if (!newPeriod.faculty.trim()) {
            setError("Faculty name is required");
            return;
        }
        const nextPeriodNum = schedule.length > 0 ? Math.max(...schedule.map(p => p.period)) + 1 : 1;
        setSchedule([...schedule, { ...newPeriod, period: nextPeriodNum }]);
        setNewPeriod({ period: nextPeriodNum + 1, start: "09:00", end: "10:00", faculty: "", subject: "" });
        setIsAddingNew(false);
    };

    const handleDeletePeriod = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const sortedSchedule = sortScheduleByPeriod(schedule);

    return (
        <>
            <NavBar />
            <main className="schedule-page">
                <div className="schedule-page__header">
                    <h1 className="schedule-page__title">Class Schedule</h1>
                    <div className="schedule-page__actions">
                        <button onClick={() => setIsAddingNew(true)} className="schedule-page__btn schedule-page__btn--add">➕ Add Period</button>
                        <button onClick={handleSave} disabled={isSaving} className="schedule-page__btn schedule-page__btn--save">{isSaving ? "Saving..." : "💾 Save"}</button>
                    </div>
                </div>

                {error && <div className="schedule-page__message schedule-page__message--error">{error}</div>}
                {message && <div className="schedule-page__message schedule-page__message--success">{message}</div>}

                {/* Add New Form */}
                {isAddingNew && (
                    <div className="schedule-page__add-form">
                        <h3>Add New Period</h3>
                        <div className="add-form__fields">
                            <input type="time" value={newPeriod.start} onChange={(e) => setNewPeriod({ ...newPeriod, start: e.target.value })} />
                            <input type="time" value={newPeriod.end} onChange={(e) => setNewPeriod({ ...newPeriod, end: e.target.value })} />
                            <input type="text" placeholder="Faculty name" value={newPeriod.faculty} onChange={(e) => setNewPeriod({ ...newPeriod, faculty: e.target.value })} />
                            <input type="text" placeholder="Subject (optional)" value={newPeriod.subject || ""} onChange={(e) => setNewPeriod({ ...newPeriod, subject: e.target.value })} />
                        </div>
                        <div className="add-form__actions">
                            <button onClick={() => setIsAddingNew(false)} className="schedule-page__btn schedule-page__btn--secondary">Cancel</button>
                            <button onClick={handleAddPeriod} className="schedule-page__btn schedule-page__btn--add">Add</button>
                        </div>
                    </div>
                )}

                {/* Schedule List */}
                {isLoading ? (
                    <div className="schedule-page__loading"><div className="spinner" /><p>Loading schedule...</p></div>
                ) : sortedSchedule.length === 0 ? (
                    <div className="schedule-page__empty">No periods scheduled. Click "Add Period" to create one.</div>
                ) : (
                    <div className="schedule-page__list">
                        {sortedSchedule.map((period, idx) => {
                            const globalIdx = schedule.findIndex((p) => p === period);
                            return (
                                <div key={idx} className="period-card">
                                    <div className="period-card__number">Period {period.period}</div>
                                    <div className="period-card__time">{formatTime(period.start)} - {formatTime(period.end)}</div>
                                    <div className="period-card__faculty">{period.faculty}</div>
                                    {period.subject && <div className="period-card__subject">{period.subject}</div>}
                                    <button onClick={() => handleDeletePeriod(globalIdx)} className="period-card__delete">×</button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <style jsx>{`
          .schedule-page { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .schedule-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
          .schedule-page__title { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .schedule-page__actions { display: flex; gap: 0.75rem; }
          .schedule-page__btn { padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
          .schedule-page__btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .schedule-page__btn--add { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
          .schedule-page__btn--save { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
          .schedule-page__btn--secondary { background: rgba(255,255,255,0.1); color: #94a3b8; }

          .schedule-page__message { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
          .schedule-page__message--error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
          .schedule-page__message--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }

          .schedule-page__add-form { padding: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 1.5rem; }
          .schedule-page__add-form h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #e2e8f0; }
          .add-form__fields { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
          .add-form__fields select, .add-form__fields input { padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #f1f5f9; font-size: 0.9rem; }
          .add-form__actions { display: flex; gap: 0.75rem; }

          .schedule-page__loading, .schedule-page__empty { padding: 3rem; text-align: center; color: #64748b; }
          .spinner { width: 32px; height: 32px; margin: 0 auto 1rem; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }

          .schedule-page__list { display: flex; flex-direction: column; gap: 0.75rem; max-width: 600px; }

          .period-card { position: relative; padding: 1rem 1.25rem; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; display: flex; align-items: center; gap: 1.5rem; }
          .period-card__number { font-weight: 700; color: #a5b4fc; font-size: 0.9rem; min-width: 80px; }
          .period-card__time { font-size: 0.85rem; color: #94a3b8; min-width: 140px; }
          .period-card__faculty { font-weight: 600; color: #f1f5f9; font-size: 1rem; flex: 1; }
          .period-card__subject { font-size: 0.85rem; color: #64748b; }
          .period-card__delete { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); width: 28px; height: 28px; border: none; background: rgba(239,68,68,0.2); color: #fca5a5; border-radius: 6px; cursor: pointer; font-size: 1.1rem; line-height: 1; }
          .period-card__delete:hover { background: rgba(239,68,68,0.3); }
        `}</style>
            </main>
        </>
    );
}

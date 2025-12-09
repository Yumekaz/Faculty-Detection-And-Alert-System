"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { listFaculty } from "./api/recognition";
import { getAttendanceLogs, type AttendanceLog } from "./api/attendance";
import { getCurrentPeriod, type SchedulePeriod } from "./api/schedule";

export default function DashboardPage() {
    const [facultyCount, setFacultyCount] = useState<number>(0);
    const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<SchedulePeriod | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [faculty, logs, period] = await Promise.all([
                listFaculty().catch(() => []),
                getAttendanceLogs().catch(() => []),
                getCurrentPeriod().catch(() => null),
            ]);

            setFacultyCount(faculty.length);
            setRecentLogs(logs.slice(0, 5));
            setCurrentPeriod(period);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        faculty: facultyCount,
        todayPresent: recentLogs.filter((l) => l.status === "Present").length,
        todayTotal: recentLogs.length,
    };

    return (
        <>
            <NavBar />
            <main className="dashboard">
                <div className="dashboard__header">
                    <h1 className="dashboard__title">Dashboard</h1>
                    <p className="dashboard__subtitle">Faculty Presence Detection System</p>
                </div>

                {/* Current Period Banner */}
                {currentPeriod && (
                    <div className="dashboard__period-banner">
                        <div className="period-banner__icon">📅</div>
                        <div className="period-banner__info">
                            <span className="period-banner__label">Current Period</span>
                            <span className="period-banner__value">
                                {currentPeriod.faculty} • {currentPeriod.start} - {currentPeriod.end}
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="dashboard__stats">
                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--purple">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{stats.faculty}</span>
                            <span className="stat-card__label">Registered Faculty</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{stats.todayPresent}</span>
                            <span className="stat-card__label">Present Today</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{stats.todayTotal}</span>
                            <span className="stat-card__label">Total Checks</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard__section">
                    <h2 className="dashboard__section-title">Quick Actions</h2>
                    <div className="dashboard__actions">
                        <Link href="/attendance" className="action-card">
                            <div className="action-card__icon">📸</div>
                            <div className="action-card__content">
                                <h3>Check Attendance</h3>
                                <p>Run manual or auto attendance check</p>
                            </div>
                        </Link>

                        <Link href="/faculty/add" className="action-card">
                            <div className="action-card__icon">➕</div>
                            <div className="action-card__content">
                                <h3>Add Faculty</h3>
                                <p>Register a new faculty member</p>
                            </div>
                        </Link>

                        <Link href="/schedule" className="action-card">
                            <div className="action-card__icon">📅</div>
                            <div className="action-card__content">
                                <h3>Edit Schedule</h3>
                                <p>Manage class timetable</p>
                            </div>
                        </Link>

                        <Link href="/attendance/logs" className="action-card">
                            <div className="action-card__icon">📊</div>
                            <div className="action-card__content">
                                <h3>View Logs</h3>
                                <p>Browse attendance history</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard__section">
                    <div className="dashboard__section-header">
                        <h2 className="dashboard__section-title">Recent Activity</h2>
                        <Link href="/attendance/logs" className="dashboard__view-all">View all →</Link>
                    </div>

                    {isLoading ? (
                        <div className="dashboard__loading">Loading...</div>
                    ) : recentLogs.length > 0 ? (
                        <div className="dashboard__activity">
                            {recentLogs.map((log, i) => (
                                <div key={i} className="activity-item">
                                    <div className={`activity-item__status activity-item__status--${log.status}`} />
                                    <div className="activity-item__content">
                                        <span className="activity-item__name">{log.name || "Unknown"}</span>
                                        <span className="activity-item__time">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <span className={`activity-item__badge activity-item__badge--${log.status}`}>
                                        {log.status.replace("_", " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="dashboard__empty">No recent activity</div>
                    )}
                </div>

                <style jsx>{`
          .dashboard { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .dashboard__header { margin-bottom: 2rem; }
          .dashboard__title { font-size: 2.5rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .dashboard__subtitle { color: #94a3b8; margin: 0.5rem 0 0; }

          .dashboard__period-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%); border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; margin-bottom: 2rem; }
          .period-banner__icon { font-size: 1.5rem; }
          .period-banner__info { display: flex; flex-direction: column; }
          .period-banner__label { font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; }
          .period-banner__value { font-weight: 600; color: #e2e8f0; }

          .dashboard__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
          .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
          .stat-card__icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
          .stat-card__icon--purple { background: rgba(99,102,241,0.15); color: #a5b4fc; }
          .stat-card__icon--green { background: rgba(34,197,94,0.15); color: #86efac; }
          .stat-card__icon--blue { background: rgba(59,130,246,0.15); color: #93c5fd; }
          .stat-card__content { display: flex; flex-direction: column; }
          .stat-card__value { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; }
          .stat-card__label { font-size: 0.8rem; color: #64748b; }

          .dashboard__section { margin-bottom: 2rem; }
          .dashboard__section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .dashboard__section-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem; color: #e2e8f0; }
          .dashboard__view-all { color: #818cf8; text-decoration: none; font-size: 0.9rem; }
          .dashboard__view-all:hover { text-decoration: underline; }

          .dashboard__actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
          .action-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
          .action-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.4); transform: translateY(-2px); }
          .action-card__icon { font-size: 1.5rem; }
          .action-card__content h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #f1f5f9; }
          .action-card__content p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; }

          .dashboard__activity { display: flex; flex-direction: column; gap: 0.5rem; }
          .activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; }
          .activity-item__status { width: 8px; height: 8px; border-radius: 50%; }
          .activity-item__status--Present { background: #22c55e; }
          .activity-item__status--Absent { background: #eab308; }
          .activity-item__status--Error { background: #ef4444; }
          .activity-item__content { flex: 1; display: flex; justify-content: space-between; }
          .activity-item__name { font-weight: 500; color: #e2e8f0; }
          .activity-item__time { font-size: 0.8rem; color: #64748b; }
          .activity-item__badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; text-transform: capitalize; }
          .activity-item__badge--Present { background: rgba(34,197,94,0.15); color: #86efac; }
          .activity-item__badge--Absent { background: rgba(234,179,8,0.15); color: #fde047; }
          .activity-item__badge--Error { background: rgba(239,68,68,0.15); color: #fca5a5; }

          .dashboard__loading, .dashboard__empty { padding: 2rem; text-align: center; color: #64748b; }
        `}</style>
            </main>
        </>
    );
}

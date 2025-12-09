"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import FacultyCard from "@/components/FacultyCard";
import { listFaculty } from "../api/recognition";

export default function FacultyListPage() {
  const [faculty, setFaculty] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listFaculty();
      setFaculty(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load faculty");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaculty = faculty.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <main className="faculty-page">
        <div className="faculty-page__header">
          <div>
            <h1 className="faculty-page__title">Faculty Directory</h1>
            <p className="faculty-page__subtitle">
              {faculty.length} registered faculty member{faculty.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/faculty/add" className="faculty-page__add-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add Faculty
          </Link>
        </div>

        <div className="faculty-page__search">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faculty-page__search-input"
          />
        </div>

        <div className="faculty-page__content">
          {isLoading ? (
            <div className="faculty-page__loading">
              <div className="spinner" />
              <p>Loading faculty...</p>
            </div>
          ) : error ? (
            <div className="faculty-page__error">
              <p>{error}</p>
              <button onClick={loadFaculty} className="faculty-page__retry-btn">Retry</button>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="faculty-page__empty">
              {searchQuery ? (
                <p>No faculty found matching "{searchQuery}"</p>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <p>No faculty members registered yet</p>
                  <Link href="/faculty/add" className="faculty-page__add-link">Add your first faculty member</Link>
                </>
              )}
            </div>
          ) : (
            <div className="faculty-page__grid">
              {filteredFaculty.map((name, index) => (
                <FacultyCard
                  key={name}
                  name={name}
                  href={`/faculty/${encodeURIComponent(name)}`}
                  className="fade-in"
                />
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .faculty-page { min-height: 100vh; padding: 2rem; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); color: #f1f5f9; }
          .faculty-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
          .faculty-page__title { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .faculty-page__subtitle { color: #94a3b8; margin: 0.5rem 0 0; font-size: 0.9rem; }
          .faculty-page__add-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 10px; font-weight: 500; text-decoration: none; transition: all 0.2s ease; }
          .faculty-page__add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
          .faculty-page__search { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 2rem; }
          .faculty-page__search svg { color: #64748b; flex-shrink: 0; }
          .faculty-page__search-input { flex: 1; background: transparent; border: none; outline: none; color: #f1f5f9; font-size: 1rem; }
          .faculty-page__search-input::placeholder { color: #64748b; }
          .faculty-page__content { min-height: 300px; }
          .faculty-page__loading, .faculty-page__empty, .faculty-page__error { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; color: #94a3b8; gap: 1rem; }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s ease-in-out infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .faculty-page__error { color: #fca5a5; }
          .faculty-page__retry-btn { padding: 0.5rem 1.5rem; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #fca5a5; cursor: pointer; }
          .faculty-page__empty svg { opacity: 0.4; }
          .faculty-page__add-link { color: #818cf8; text-decoration: none; }
          .faculty-page__add-link:hover { text-decoration: underline; }
          .faculty-page__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
          .fade-in { animation: fadeIn 0.3s ease forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </main>
    </>
  );
}

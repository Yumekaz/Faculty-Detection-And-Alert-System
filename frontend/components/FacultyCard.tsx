"use client";

import React from "react";
import Link from "next/link";

// --- Types ---
interface FacultyCardProps {
    name: string;
    imageUrl?: string;
    onClick?: () => void;
    href?: string;
    showActions?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    className?: string;
}

// --- Component ---
export default function FacultyCard({
    name,
    imageUrl,
    onClick,
    href,
    showActions = false,
    onDelete,
    isDeleting = false,
    className = "",
}: FacultyCardProps) {
    // Get initials for avatar fallback
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const cardContent = (
        <>
            {/* Avatar */}
            <div className="faculty-card__avatar">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="faculty-card__image" />
                ) : (
                    <span className="faculty-card__initials">{initials}</span>
                )}
            </div>

            {/* Info */}
            <div className="faculty-card__info">
                <h3 className="faculty-card__name">{name}</h3>
                {!showActions && <p className="faculty-card__action">View details →</p>}
            </div>

            {/* Actions */}
            {showActions && onDelete && (
                <div className="faculty-card__actions">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isDeleting}
                        className="faculty-card__delete-btn"
                    >
                        {isDeleting ? "..." : "🗑️"}
                    </button>
                </div>
            )}
        </>
    );

    const cardClassName = `faculty-card ${className}`;

    // Render as link or button
    if (href) {
        return (
            <Link href={href} className={cardClassName}>
                {cardContent}
                <style jsx>{styles}</style>
            </Link>
        );
    }

    if (onClick) {
        return (
            <button onClick={onClick} className={cardClassName}>
                {cardContent}
                <style jsx>{styles}</style>
            </button>
        );
    }

    return (
        <div className={cardClassName}>
            {cardContent}
            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
  .faculty-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.25s ease;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .faculty-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .faculty-card__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .faculty-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .faculty-card__initials {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .faculty-card__info {
    flex: 1;
    min-width: 0;
  }

  .faculty-card__name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .faculty-card__action {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: #64748b;
    transition: color 0.2s;
  }

  .faculty-card:hover .faculty-card__action {
    color: #818cf8;
  }

  .faculty-card__actions {
    display: flex;
    gap: 0.5rem;
  }

  .faculty-card__delete-btn {
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
  }

  .faculty-card__delete-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
  }

  .faculty-card__delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

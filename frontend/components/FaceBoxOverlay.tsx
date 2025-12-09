"use client";

import React from "react";

// --- Types ---
export interface FaceBox {
    bbox: [number, number, number, number]; // [x1, y1, x2, y2]
    confidence?: number;
    name?: string | null;
    isMatched?: boolean;
}

interface FaceBoxOverlayProps {
    faces: FaceBox[];
    imageWidth: number;
    imageHeight: number;
    containerWidth?: number;
    containerHeight?: number;
    showConfidence?: boolean;
    showLabels?: boolean;
    className?: string;
}

// --- Component ---
export default function FaceBoxOverlay({
    faces,
    imageWidth,
    imageHeight,
    containerWidth,
    containerHeight,
    showConfidence = true,
    showLabels = true,
    className = "",
}: FaceBoxOverlayProps) {
    // Calculate scale factors if container dimensions differ from image
    const scaleX = containerWidth ? containerWidth / imageWidth : 1;
    const scaleY = containerHeight ? containerHeight / imageHeight : 1;

    const getBoxColor = (face: FaceBox): string => {
        if (face.isMatched === true) return "#22c55e"; // green
        if (face.isMatched === false) return "#eab308"; // yellow
        return "#6366f1"; // purple (default/unknown)
    };

    return (
        <div
            className={`face-box-overlay ${className}`}
            style={{
                width: containerWidth || imageWidth,
                height: containerHeight || imageHeight,
            }}
        >
            {faces.map((face, index) => {
                const [x1, y1, x2, y2] = face.bbox;
                const left = x1 * scaleX;
                const top = y1 * scaleY;
                const width = (x2 - x1) * scaleX;
                const height = (y2 - y1) * scaleY;
                const color = getBoxColor(face);

                return (
                    <div
                        key={index}
                        className="face-box"
                        style={{
                            left,
                            top,
                            width,
                            height,
                            borderColor: color,
                        }}
                    >
                        {/* Corner accents */}
                        <div className="face-box__corner face-box__corner--tl" style={{ borderColor: color }} />
                        <div className="face-box__corner face-box__corner--tr" style={{ borderColor: color }} />
                        <div className="face-box__corner face-box__corner--bl" style={{ borderColor: color }} />
                        <div className="face-box__corner face-box__corner--br" style={{ borderColor: color }} />

                        {/* Label */}
                        {showLabels && (face.name || face.confidence !== undefined) && (
                            <div className="face-box__label" style={{ backgroundColor: color }}>
                                {face.name && <span className="face-box__name">{face.name}</span>}
                                {showConfidence && face.confidence !== undefined && (
                                    <span className="face-box__confidence">
                                        {(face.confidence * 100).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <style jsx>{`
        .face-box-overlay {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .face-box {
          position: absolute;
          border: 2px solid;
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
        }

        .face-box__corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-style: solid;
          border-width: 3px;
        }

        .face-box__corner--tl {
          top: -2px;
          left: -2px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 4px;
        }

        .face-box__corner--tr {
          top: -2px;
          right: -2px;
          border-left: none;
          border-bottom: none;
          border-top-right-radius: 4px;
        }

        .face-box__corner--bl {
          bottom: -2px;
          left: -2px;
          border-right: none;
          border-top: none;
          border-bottom-left-radius: 4px;
        }

        .face-box__corner--br {
          bottom: -2px;
          right: -2px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 4px;
        }

        .face-box__label {
          position: absolute;
          bottom: 100%;
          left: -2px;
          display: flex;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px 4px 0 0;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          transform: translateY(2px);
        }

        .face-box__name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .face-box__confidence {
          opacity: 0.9;
        }
      `}</style>
        </div>
    );
}

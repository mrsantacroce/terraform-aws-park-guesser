"use client";

import { useState } from "react";

export default function HintButton({ parkName }) {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const getHint = async () => {
    if (hint && showHint) {
      // If hint is already loaded and showing, just toggle visibility
      setShowHint(false);
      return;
    }

    if (hint) {
      // If hint is loaded but hidden, just show it
      setShowHint(true);
      return;
    }

    // Fetch new hint
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parkName }),
      });

      if (!response.ok) {
        throw new Error("Failed to get hint");
      }

      const data = await response.json();
      setHint(data.hint);
      setShowHint(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hint-container">
      <button
        onClick={getHint}
        disabled={loading}
        className="hint-button"
      >
        {loading ? "Getting hint..." : showHint ? "Hide Hint" : "Get Hint"}
      </button>

      {error && (
        <div className="hint-error">
          Error: {error}
        </div>
      )}

      {showHint && hint && (
        <div className="hint-content">
          <p>{hint}</p>
        </div>
      )}

      <style jsx>{`
        .hint-container {
          margin: 20px 0;
        }

        .hint-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .hint-button:hover:not(:disabled) {
          background-color: #0051cc;
        }

        .hint-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .hint-content {
          margin-top: 16px;
          padding: 16px;
          background-color: #f5f5f5;
          border-radius: 8px;
          border-left: 4px solid #0070f3;
        }

        .hint-content p {
          margin: 0;
          line-height: 1.6;
        }

        .hint-error {
          margin-top: 12px;
          padding: 12px;
          background-color: #fee;
          color: #c00;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import HintButton from "./HintButton";

export default function ParkGuesserDemo() {
  const [parkName, setParkName] = useState("Yellowstone National Park");

  return (
    <div className="demo-container">
      <h2>National Park Guesser - Hint Demo</h2>

      <div className="input-section">
        <label htmlFor="parkInput">
          Enter a National Park name to test the hint feature:
        </label>
        <input
          id="parkInput"
          type="text"
          value={parkName}
          onChange={(e) => setParkName(e.target.value)}
          placeholder="e.g., Yosemite National Park"
          className="park-input"
        />
      </div>

      <HintButton parkName={parkName} />

      <style jsx>{`
        .demo-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h2 {
          margin-bottom: 24px;
          color: #333;
        }

        .input-section {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }

        .park-input {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: border-color 0.2s;
        }

        .park-input:focus {
          outline: none;
          border-color: #0070f3;
        }
      `}</style>
    </div>
  );
}

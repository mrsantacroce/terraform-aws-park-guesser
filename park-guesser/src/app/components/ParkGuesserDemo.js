"use client";

import { useState, useEffect } from "react";
import { fetchParksData, getRandomParkQuestion } from "../data/parks";
import HintButton from "./HintButton";

export default function ParkGuesserDemo() {
  const [parksData, setParksData] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState(null);

  // Load parks data on mount
  useEffect(() => {
    loadParksData();
  }, []);

  const loadParksData = async () => {
    try {
      const parks = await fetchParksData();
      setParksData(parks);
      loadNewQuestion(parks);
    } catch (err) {
      setError("Failed to load parks data. Please refresh the page.");
      console.error(err);
    }
  };

  const loadNewQuestion = (parks = parksData) => {
    if (!parks) return;
    const newQuestion = getRandomParkQuestion(parks);
    setQuestion(newQuestion);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowAnswer(false);
  };

  const handleAnswerSelect = (parkId) => {
    if (showAnswer) return; // Don't allow changing answer after submission
    setSelectedAnswer(parkId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === question.correctPark.id;
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <style jsx>{`
          .error-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            color: #ef4444;
          }
        `}</style>
      </div>
    );
  }

  if (!question || !parksData) {
    return <div>Loading parks data...</div>;
  }

  return (
    <div className="game-container">
      <div className="park-image-container">
        <img
          src={question.correctPark.imageUrl}
          alt="National Park to guess"
          className="park-image"
        />
      </div>

      <h2 className="question-title">Which National Park is this?</h2>

      <div className="options-container">
        {question.options.map((park) => (
          <button
            key={park.id}
            onClick={() => handleAnswerSelect(park.id)}
            disabled={showAnswer}
            className={`option-button ${
              selectedAnswer === park.id ? "selected" : ""
            } ${
              showAnswer && park.id === question.correctPark.id
                ? "correct"
                : ""
            } ${
              showAnswer &&
              selectedAnswer === park.id &&
              park.id !== question.correctPark.id
                ? "incorrect"
                : ""
            }`}
          >
            {park.name}
          </button>
        ))}
      </div>

      {!showAnswer && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="submit-button"
        >
          Submit Answer
        </button>
      )}

      {showAnswer && (
        <div className={`result ${isCorrect ? "correct-result" : "incorrect-result"}`}>
          {isCorrect ? (
            <p>✓ Correct! This is {question.correctPark.name}.</p>
          ) : (
            <p>
              ✗ Incorrect. The correct answer is {question.correctPark.name}.
            </p>
          )}
          <button onClick={loadNewQuestion} className="next-button">
            Next Park
          </button>
        </div>
      )}

      {!showAnswer && (
        <div className="hint-section">
          <p className="hint-label">Need help?</p>
          <HintButton parkName={question.correctPark.name} hideAnswer />
        </div>
      )}

      <style jsx>{`
        .game-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .park-image-container {
          width: 100%;
          height: 400px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .park-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .question-title {
          text-align: center;
          color: #333;
          margin-bottom: 24px;
          font-size: 24px;
        }

        .options-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .option-button {
          padding: 16px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .option-button:hover:not(:disabled) {
          border-color: #0070f3;
          background: #f0f7ff;
        }

        .option-button.selected {
          border-color: #0070f3;
          background: #e6f2ff;
        }

        .option-button.correct {
          border-color: #22c55e;
          background: #dcfce7;
        }

        .option-button.incorrect {
          border-color: #ef4444;
          background: #fee;
        }

        .option-button:disabled {
          cursor: not-allowed;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          font-size: 18px;
          font-weight: 600;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #0051cc;
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .result {
          margin-top: 24px;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .correct-result {
          background: #dcfce7;
          border: 2px solid #22c55e;
        }

        .incorrect-result {
          background: #fee;
          border: 2px solid #ef4444;
        }

        .result p {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .next-button {
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 600;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .next-button:hover {
          background: #0051cc;
        }

        .hint-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #ddd;
        }

        .hint-label {
          margin-bottom: 12px;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

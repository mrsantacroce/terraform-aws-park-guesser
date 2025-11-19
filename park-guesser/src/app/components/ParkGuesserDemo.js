"use client";

import { useState, useEffect } from "react";
import { fetchParksData } from "../data/parks";
import HintButton from "./HintButton";

export default function ParkGuesserDemo() {
  const [parksData, setParksData] = useState(null);
  const [allParksData, setAllParksData] = useState(null); // Includes decoys
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState(null);

  // Game state
  const [remainingParks, setRemainingParks] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Load parks data on mount
  useEffect(() => {
    loadParksData();
  }, []);

  const loadParksData = async () => {
    try {
      const data = await fetchParksData();
      setParksData(data.parks);        // Parks with images
      setAllParksData(data.allParks);  // All parks (including decoys)
      startNewGame(data.parks, data.allParks);
    } catch (err) {
      setError("Failed to load parks data. Please refresh the page.");
      console.error(err);
    }
  };

  const startNewGame = (parks, allParks) => {
    if (!parks || !allParks) return;
    // Shuffle parks for random order
    const shuffled = [...parks].sort(() => Math.random() - 0.5);
    setRemainingParks(shuffled);
    setCurrentRound(0);
    setScore(0);
    setGameComplete(false);
    loadQuestionForPark(shuffled[0], allParks);
  };

  const loadQuestionForPark = (correctPark, allParks) => {
    // Get 3 random wrong answers from all parks (including decoys)
    const wrongAnswers = allParks
      .filter(park => park.id !== correctPark.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle
    const options = [correctPark, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);

    setQuestion({
      correctPark,
      options,
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowAnswer(false);
  };

  const handleAnswerSelect = (parkId) => {
    if (showAnswer) return;
    setSelectedAnswer(parkId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === question.correctPark.id;
    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNextPark = () => {
    const nextRound = currentRound + 1;

    if (nextRound >= remainingParks.length) {
      // Game complete!
      setGameComplete(true);
    } else {
      setCurrentRound(nextRound);
      loadQuestionForPark(remainingParks[nextRound], allParksData);
    }
  };

  const handlePlayAgain = () => {
    startNewGame(parksData, allParksData);
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

  // Game complete screen
  if (gameComplete) {
    const percentage = Math.round((score / remainingParks.length) * 100);
    return (
      <div className="game-container">
        <div className="game-complete">
          <h1 className="complete-title">Game Complete! 🎉</h1>
          <div className="score-display">
            <div className="score-big">{score} / {remainingParks.length}</div>
            <div className="score-percentage">{percentage}% Correct</div>
          </div>
          <button onClick={handlePlayAgain} className="play-again-button">
            Play Again
          </button>
        </div>

        <style jsx>{`
          .game-complete {
            max-width: 500px;
            margin: 60px auto;
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .complete-title {
            color: #333;
            margin-bottom: 32px;
            font-size: 32px;
          }

          .score-display {
            margin-bottom: 32px;
          }

          .score-big {
            font-size: 64px;
            font-weight: bold;
            color: #0070f3;
            margin-bottom: 8px;
          }

          .score-percentage {
            font-size: 24px;
            color: #666;
          }

          .play-again-button {
            padding: 16px 48px;
            font-size: 18px;
            font-weight: 600;
            background: #0070f3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
          }

          .play-again-button:hover {
            background: #0051cc;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="progress-bar">
        <div className="progress-info">
          <span>Question {currentRound + 1} of {remainingParks.length}</span>
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="park-image-container">
        <img
          src={question.correctPark.imageUrl}
          alt="National Park to guess"
          className="park-image"
        />
      </div>

      <h2 className="question-title">Which National Park is this?</h2>

      {!showAnswer && (
        <div className="hint-section">
          <HintButton parkName={question.correctPark.name} hideAnswer />
        </div>
      )}

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
          <button onClick={handleNextPark} className="next-button">
            Next Park
          </button>
        </div>
      )}

      <style jsx>{`
        .game-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .progress-bar {
          margin-bottom: 24px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: #333;
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
          margin-bottom: 24px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

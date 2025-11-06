"use client";

import ParkGuesserDemo from "./components/ParkGuesserDemo";

export default function Home() {
  return (
    <>
      <div className="header">
        <h1>🏞️ National Park Guesser</h1>
        <p className="subtitle">
          Test your knowledge with AI-powered hints from Amazon Bedrock
        </p>
      </div>
      <main className="main">
        <ParkGuesserDemo />
      </main>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 48px 24px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
          margin: 0 0 12px 0;
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .subtitle {
          margin: 0;
          font-size: 18px;
          opacity: 0.95;
          font-weight: 400;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
          min-height: calc(100vh - 200px);
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 32px;
          }

          .subtitle {
            font-size: 16px;
          }

          .header {
            padding: 32px 20px;
          }
        }
      `}</style>
    </>
  );
}
import ParkGuesserDemo from "./components/ParkGuesserDemo";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Park Guesser</h1>
      <p>Guess national parks with AI-powered hints from Amazon Bedrock!</p>
      <ParkGuesserDemo />
    </main>
  );
}
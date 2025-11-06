import "./globals.css";

export const metadata = {
  title: "National Park Guesser",
  description: "Guess national parks with AI-powered hints from Amazon Bedrock",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
// Sample national parks data
// In production, images would come from your S3 bucket
export const nationalParks = [
  {
    id: 1,
    name: "Yellowstone National Park",
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80",
    state: "Wyoming, Montana, Idaho",
  },
  {
    id: 2,
    name: "Yosemite National Park",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    state: "California",
  },
  {
    id: 3,
    name: "Grand Canyon National Park",
    imageUrl: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    state: "Arizona",
  },
  {
    id: 4,
    name: "Zion National Park",
    imageUrl: "https://images.unsplash.com/photo-1626371376480-1937744f8a49?w=800&q=80",
    state: "Utah",
  },
  {
    id: 5,
    name: "Glacier National Park",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    state: "Montana",
  },
  {
    id: 6,
    name: "Rocky Mountain National Park",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    state: "Colorado",
  },
];

// Get a random park with wrong options for multiple choice
export function getRandomParkQuestion() {
  const correctPark = nationalParks[Math.floor(Math.random() * nationalParks.length)];

  // Get 3 random wrong answers
  const wrongAnswers = nationalParks
    .filter(park => park.id !== correctPark.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Combine and shuffle
  const options = [correctPark, ...wrongAnswers]
    .sort(() => Math.random() - 0.5);

  return {
    correctPark,
    options,
  };
}

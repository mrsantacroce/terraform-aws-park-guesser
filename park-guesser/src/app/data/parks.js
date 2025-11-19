// Fetch parks data with presigned S3 URLs from API
export async function fetchParksData() {
  try {
    const response = await fetch('/api/parks');
    if (!response.ok) {
      throw new Error('Failed to fetch parks data');
    }
    const data = await response.json();
    return {
      parks: data.parks,      // Parks with images
      allParks: data.allParks // All parks (including decoys)
    };
  } catch (error) {
    console.error('Error fetching parks:', error);
    throw error;
  }
}

// Get a random park with wrong options for multiple choice
export function getRandomParkQuestion(nationalParks) {
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

/**
 * Space Repetition Algorithm
 * Calculates next review date based on difficulty
 */

export type Difficulty = "repeat" | "hard" | "good" | "easy";

/**
 * Calculate next review date based on difficulty
 * @param difficulty - User's difficulty rating
 * @returns Date when card should be reviewed next
 */
export function calculateNextReview(difficulty: Difficulty): Date {
  const now = new Date();
  
  switch (difficulty) {
    case "repeat":
      // Review again today (same day)
      return now;
    case "hard":
      // Review in 1 day
      return addDays(now, 1);
    case "good":
      // Review in 3 days
      return addDays(now, 3);
    case "easy":
      // Review in 7 days
      return addDays(now, 7);
    default:
      return now;
  }
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get difficulty label for UI
 */
export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels = {
    repeat: "Repeat (Today)",
    hard: "Hard (1 day)",
    good: "Good (3 days)",
    easy: "Easy (7 days)",
  };
  return labels[difficulty];
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colors = {
    repeat: "bg-red-500 hover:bg-red-600",
    hard: "bg-orange-500 hover:bg-orange-600",
    good: "bg-blue-500 hover:bg-blue-600",
    easy: "bg-green-500 hover:bg-green-600",
  };
  return colors[difficulty];
}

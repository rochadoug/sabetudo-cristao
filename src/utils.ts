export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function shuffle<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}
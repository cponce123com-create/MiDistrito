export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  // Exact score
  if (predHome === realHome && predAway === realAway) return 3;
  
  const predDiff = predHome - predAway;
  const realDiff = realHome - realAway;
  
  // Correct goal difference
  if (predDiff === realDiff) return 2;
  
  // Correct winner/draw
  if (
    (predDiff > 0 && realDiff > 0) ||
    (predDiff < 0 && realDiff < 0) ||
    (predDiff === 0 && realDiff === 0)
  )
    return 1;
  
  return 0;
}

/** Determine if team results are effectively visible based on release_mode */
export function isResultsEffectivelyVisible(
  resultsVisible: boolean,
  releaseMode: string,
  deadline: string | null,
): boolean {
  if (resultsVisible) return true;
  if (releaseMode === "immediate") return true;
  if (releaseMode === "on_deadline" && deadline && new Date(deadline) < new Date()) return true;
  return false;
}

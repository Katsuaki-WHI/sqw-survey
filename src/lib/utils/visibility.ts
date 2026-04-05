/** Determine if team results are effectively visible based on release_mode */
export function isResultsEffectivelyVisible(
  resultsVisible: boolean,
  releaseMode: string,
  deadline: string | null,
): boolean {
  if (resultsVisible) return true;
  // Legacy "immediate" treated as visible
  if (releaseMode === "immediate") return true;
  if (releaseMode === "on_deadline" && deadline && new Date(deadline) < new Date()) return true;
  // "all_completed" is handled by the server when checking response counts
  return false;
}

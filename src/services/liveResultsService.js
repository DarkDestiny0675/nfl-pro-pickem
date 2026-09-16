import { apiFetch } from "./api";

export function getLiveResults(userId, weekId) {
  return apiFetch(`/games/live-results/user/${userId}/week/${weekId}`);
}

export function syncSportsDataIOWeek(seasonId, weekNumber) {
  return apiFetch(`/sync/sportsdataio-week/${seasonId}/${weekNumber}`, {
    method: "POST",
  });
}

export function simulateWeekResults(weekId) {
  return apiFetch(`/sync/simulate-week-results/${weekId}`, {
    method: "POST",
  });
}

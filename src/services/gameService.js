import { apiFetch } from "./api";
export function getGamesByWeek(weekId) {
  return apiFetch(`/games/week/${weekId}`);
}
export function setGameOfWeek(gameId) {
  return apiFetch(`/game-of-week/${gameId}`, {
    method: "POST",
  });
}
export function getGameOfWeek(weekId) {
  return apiFetch(`/games/week/${weekId}/game-of-week`);
}
export function importSeasonSchedule(seasonYear) {
  return apiFetch(`/sync/season-schedule/${seasonYear}`, {
    method: "POST",
  });
}
export function getTeams() {
  return apiFetch("/teams");
}

import { apiFetch } from "./api";
export const simulateGame = (payload) =>
  apiFetch("/simulation/game", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const simulateWeek = (weekId) =>
  apiFetch(`/simulation/week/${weekId}`, { method: "POST" });
export const resetWeek = (weekId) =>
  apiFetch(`/simulation/week/${weekId}/reset`, { method: "POST" });
export const resetSeason = (seasonId) =>
  apiFetch(`/simulation/season/${seasonId}/reset`, { method: "POST" });
export const finalizeWeek = (weekId, userId) =>
  apiFetch("/weeks/finalize", {
    method: "POST",
    body: JSON.stringify({ weekID: weekId, finalizedByUserID: userId }),
  });
export const restoreOfficialSchedule = (weekId) =>
  apiFetch(`/simulation/week/${weekId}/restore-official-schedule`, {
    method: "POST",
  });

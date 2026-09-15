import { apiFetch } from "./api";

export async function getPicksByWeek(userId, weekId) {
  return apiFetch(`/picks/user/${userId}/week/${weekId}`);
}

export async function submitPick(userId, gameId, selectedTeamId) {
  return apiFetch("/picks", {
    method: "POST",

    body: JSON.stringify({
      userID: userId,
      gameID: gameId,
      selectedTeamID: selectedTeamId,
    }),
  });
}

export async function getWeekEntryStatus(userId, weekId) {
  return apiFetch(`/week-entries/user/${userId}/week/${weekId}`);
}

export async function submitWeekEntry(userId, weekId, tieBreakerGuess = null) {
  return apiFetch("/week-entries/submit", {
    method: "POST",
    body: JSON.stringify({
      userID: userId,
      weekID: weekId,
      tieBreakerGuess:
        tieBreakerGuess === "" || tieBreakerGuess == null
          ? null
          : Number(tieBreakerGuess),
    }),
  });
}

export async function getWeekPickDistribution(weekId) {
  return apiFetch(`/picks/distribution/week/${weekId}`);
}

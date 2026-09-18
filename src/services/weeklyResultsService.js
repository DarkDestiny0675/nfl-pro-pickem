import { apiFetch } from "./api";

const DISPLAY_TIME_ZONE = "America/Chicago";

function parseUtcDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const normalized = hasTimeZone ? text : `${text}Z`;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatGame(game, pick) {
  const kickoff = parseUtcDate(game.kickoffAtUtc);

  return {
    ...game,
    day: kickoff
      ? kickoff.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: DISPLAY_TIME_ZONE,
        })
      : "Schedule pending",
    time: kickoff
      ? kickoff.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: DISPLAY_TIME_ZONE,
          timeZoneName: "short",
        })
      : "",
    selectedTeamID: pick?.selectedTeamID ?? null,
    selectedTeam: pick?.selectedTeam ?? null,
    isCorrect: pick?.isCorrect ?? null,
    pointsAwarded: pick?.pointsAwarded ?? null,
  };
}

function addWeeklyRanks(standings) {
  const ordered = [...standings].sort((left, right) => {
    const pointDifference = Number(right.points || 0) - Number(left.points || 0);
    if (pointDifference !== 0) return pointDifference;

    const correctDifference =
      Number(right.correctPicks || 0) - Number(left.correctPicks || 0);
    if (correctDifference !== 0) return correctDifference;

    return String(left.displayName || "").localeCompare(
      String(right.displayName || ""),
    );
  });

  let previousPoints = null;
  let previousCorrect = null;
  let currentRank = 0;

  return ordered.map((item, index) => {
    const points = Number(item.points || 0);
    const correct = Number(item.correctPicks || 0);

    if (points !== previousPoints || correct !== previousCorrect) {
      currentRank = index + 1;
      previousPoints = points;
      previousCorrect = correct;
    }

    return { ...item, rank: currentRank };
  });
}

export async function getWeeklyResults(userId, weekId) {
  const [games, picks, standings] = await Promise.all([
    apiFetch(`/games/week/${weekId}`),
    apiFetch(`/picks/user/${userId}/week/${weekId}`),
    apiFetch(`/weeks/${weekId}/standings`),
  ]);

  const pickByGame = new Map(picks.map((pick) => [pick.gameID, pick]));

  const resultGames = await Promise.all(
    games.map(async (game) => {
      const details = await apiFetch(`/games/${game.gameID}`);
      return formatGame(details, pickByGame.get(game.gameID));
    }),
  );

  const rankedStandings = addWeeklyRanks(standings);
  const standing =
    rankedStandings.find(
      (item) => Number(item.userID) === Number(userId),
    ) ?? null;

  const correctPicks = standing?.correctPicks ?? 0;
  const incorrectPicks = standing?.incorrectPicks ?? 0;
  const points = standing?.points ?? 0;
  const gamesRemaining = resultGames.filter(
    (game) => game.gameStatus !== "Final",
  ).length;
  const finalGames = resultGames.length - gamesRemaining;

  return {
    games: resultGames,
    standing,
    correctPicks,
    incorrectPicks,
    points,
    gamesRemaining,
    bestPossible: points + gamesRemaining,
    finalGames,
  };
}

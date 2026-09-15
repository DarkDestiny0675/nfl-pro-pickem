export const DISPLAY_TIME_ZONE = "America/Chicago";

export function teamAbbreviation(teamName = "") {
  return teamName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function parseLeagueDateTime(value) {
  if (!value) return new Date(NaN);
  const text = String(value).trim();
  const withoutZone = text.replace(/Z$/i, "").replace(/[+-]\d\d:\d\d$/, "");
  const match = withoutZone.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/,
  );
  if (!match) return new Date(text);
  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(text.endsWith("Z") ? text : `${text}Z`);
}

export function centralTimeZoneName(value) {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: DISPLAY_TIME_ZONE,
      timeZoneName: "short",
    })
      .formatToParts(parseLeagueDateTime(value))
      .find((part) => part.type === "timeZoneName")?.value || "CT"
  );
}

export function normalizeApiGame(game) {
  const kickoff = parseLeagueDateTime(game.kickoffAtUtc);
  const lockAt = game.lockAtUtc
    ? parseLeagueDateTime(game.lockAtUtc)
    : new Date(kickoff.getTime() - 60 * 60 * 1000);
  const status = String(game.gameStatus || "").toLowerCase();
  const isLocked =
    new Date() >= lockAt ||
    ["final", "inprogress", "canceled", "postponed", "suspended"].includes(
      status,
    );
  const timeZoneName = centralTimeZoneName(game.kickoffAtUtc);
  return {
    ...game,
    id: game.gameID,
    day: kickoff.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: DISPLAY_TIME_ZONE,
    }),
    time: `${kickoff.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: DISPLAY_TIME_ZONE,
    })} ${timeZoneName}`,
    network: game.broadcastNetwork || "NFL",
    status: isLocked ? "locked" : "open",
    lockText: isLocked
      ? "Locked"
      : `Locks ${lockAt.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: DISPLAY_TIME_ZONE,
        })} at ${lockAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: DISPLAY_TIME_ZONE,
        })} ${centralTimeZoneName(game.lockAtUtc || game.kickoffAtUtc)}`,
    away: {
      id: game.awayTeamID,
      city: "",
      name: game.awayTeam,
      short: teamAbbreviation(game.awayTeam),
      record: "",
      color: "#3b82f6",
    },
    home: {
      id: game.homeTeamID,
      city: "",
      name: game.homeTeam,
      short: teamAbbreviation(game.homeTeam),
      record: "",
      color: "#22c55e",
    },
  };
}

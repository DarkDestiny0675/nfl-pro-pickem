import { Check, Clock3, RefreshCw, X } from "lucide-react";
import "./LiveResultsScreen.css";

function normalizeStatus(value) {
  return String(value || "Scheduled")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function pickState(game) {
  if (!game.selectedTeamID) return "No pick";
  if (normalizeStatus(game.gameStatus) === "final") {
    return game.isCorrect ? "Correct" : "Incorrect";
  }
  if (game.awayScore == null || game.homeScore == null) return "Pending";
  const pickedAway = game.selectedTeamID === game.awayTeamID;
  const pickedScore = pickedAway ? game.awayScore : game.homeScore;
  const otherScore = pickedAway ? game.homeScore : game.awayScore;
  if (pickedScore > otherScore) return "Leading";
  if (pickedScore < otherScore) return "Trailing";
  return "Tied";
}

function periodLabel(period) {
  if (!period) return "LIVE";
  if (period === 1) return "1ST";
  if (period === 2) return "2ND";
  if (period === 3) return "3RD";
  if (period === 4) return "4TH";
  return period === 5 ? "OT" : `${period - 4}OT`;
}

function gameDisplay(game) {
  const status = normalizeStatus(game.gameStatus);
  const detail = game.statusDetail || "";
  if (status === "final")
    return { label: "FINAL", detail: "Game complete", tone: "final" };
  if (status === "halftime" || /half/i.test(detail))
    return { label: "HALFTIME", detail: detail || "Halftime", tone: "live" };
  if (status === "inprogress") {
    const label = periodLabel(game.currentPeriod);
    const clock = game.gameClock ? `${game.gameClock} remaining` : "Live now";
    return { label, detail: clock, tone: "live" };
  }
  if (/delay/i.test(status) || /delay/i.test(detail))
    return {
      label: "DELAYED",
      detail: detail || "Game delayed",
      tone: "warning",
    };
  if (/postpon/i.test(status) || /postpon/i.test(detail))
    return {
      label: "POSTPONED",
      detail: detail || "Game postponed",
      tone: "warning",
    };
  if (/cancel/i.test(status) || /cancel/i.test(detail))
    return {
      label: "CANCELED",
      detail: detail || "Game canceled",
      tone: "warning",
    };
  return {
    label: "SCHEDULED",
    detail: detail || "Awaiting kickoff",
    tone: "scheduled",
  };
}

function TeamScore({ name, score, selected, winner }) {
  return (
    <div
      className={`live-team ${selected ? "selected" : ""} ${winner ? "winner" : ""}`}
    >
      <span>{name}</span>
      <strong>{score ?? "-"}</strong>
      {/*selected && <em>Your Pick</em>*/}
    </div>
  );
}

export default function LiveResultsScreen({
  results,
  loading,
  error,
  onRefresh,
  weekNumber = 1,
}) {
  const games = results?.games ?? [];
  const lastSync = games
    .map((game) => game.lastScoreSyncUtc)
    .filter(Boolean)
    .sort()
    .at(-1);
  return (
    <>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">Week {weekNumber}</span>
          <h1>Live Results</h1>
          <p>Follow every game and see how your picks are performing.</p>
          <div className="live-refresh-note">
            Auto-refreshes every 15 seconds
            {lastSync && (
              <span>
                Last update{" "}
                {new Date(lastSync).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onRefresh()}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "refresh-spin" : ""} />{" "}
          Refresh
        </button>
      </div>
      <div className="live-summary-grid">
        <Summary
          label="Leading"
          value={results?.leadingPicks ?? 0}
          tone="green"
        />
        <Summary
          label="Trailing"
          value={results?.trailingPicks ?? 0}
          tone="red"
        />
        <Summary
          label="Pending"
          value={results?.pendingPicks ?? 0}
          tone="blue"
        />
        <Summary
          label="Final Record"
          value={`${results?.correctPicks ?? 0}-${results?.incorrectPicks ?? 0}`}
          tone="gold"
        />
      </div>
      {loading && (
        <div className="notice">
          <Clock3 size={18} /> Loading live results...
        </div>
      )}
      {error && <div className="notice purple">{error}</div>}
      {results?.syncWarning && (
        <div className="notice sync-warning">
          Live feed warning: {results.syncWarning}. Showing the most recently
          stored scores.
        </div>
      )}
      {!loading && !error && games.length === 0 && (
        <div className="notice">No Week {weekNumber} games are available.</div>
      )}
      <section className="live-results-list">
        {games.map((game) => {
          const state = pickState(game);
          const display = gameDisplay(game);
          return (
            <article
              className={`live-result-card ${display.tone}`}
              key={game.gameID}
            >
              <div className={`live-result-status ${display.tone}`}>
                <strong>{display.label}</strong>
                <span>{display.detail}</span>
                {game.statusDetail &&
                  display.tone === "live" &&
                  game.statusDetail !== display.detail && (
                    <small>{game.statusDetail}</small>
                  )}
              </div>
              <div className="live-scoreboard">
                <TeamScore
                  name={game.awayTeam}
                  score={game.awayScore}
                  selected={game.selectedTeamID === game.awayTeamID}
                  winner={game.winningTeamID === game.awayTeamID}
                />
                <span className="live-at">VS</span>
                <TeamScore
                  name={game.homeTeam}
                  score={game.homeScore}
                  selected={game.selectedTeamID === game.homeTeamID}
                  winner={game.winningTeamID === game.homeTeamID}
                />
              </div>
              <div
                className={`pick-result-state ${state.toLowerCase().replaceAll(" ", "-")}`}
              >
                {state === "Correct" && <Check size={18} />}
                {state === "Incorrect" && <X size={18} />}
                {state}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function Summary({ label, value, tone }) {
  return (
    <article className={`live-summary ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

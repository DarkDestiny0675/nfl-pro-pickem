import { ChevronRight } from "lucide-react";
import HelmetImage from "../common/HelmetImage";
import useTeamNames from "../../hooks/useTeamNames";
import "./LeaderboardScreen.css";
function applyCompetitionRanks(items) {
  let pp = null,
    pc = null,
    r = 0;
  return items.map((x, i) => {
    const p = Number(x.points || 0),
      c = Number(x.correctPicks || 0);
    if (p !== pp || c !== pc) {
      r = i + 1;
      pp = p;
      pc = c;
    }
    return { ...x, rank: r };
  });
}

export default function LeaderboardScreen({
  standings = [],
  currentUser,
  loading,
  error,
}) {
  const teamNames = useTeamNames();
  const rankedStandings = applyCompetitionRanks(standings);
  const podiumOrder = [
    rankedStandings[1],
    rankedStandings[0],
    rankedStandings[2],
  ].filter(Boolean);

  function initials(displayName = "") {
    return displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">2026 Season</span>
        <h1>Leaderboard</h1>
        <p>Season standings through the current week.</p>
      </div>

      {loading && <div className="notice">Loading season standings...</div>}
      {error && <div className="notice purple">{error}</div>}
      {!loading && !error && rankedStandings.length === 0 && (
        <div className="notice">No scored picks are available yet.</div>
      )}

      {rankedStandings.length > 0 && (
        <>
          <div className="podium">
            {podiumOrder.map((player) => (
              <article
                className={`podium-card place-${player.rank}`}
                key={player.userID}
              >
                <span className="podium-rank">#{player.rank}</span>
                <div className="avatar large">
                  {initials(player.displayName)}
                </div>
                <strong>{player.displayName}</strong>
                <span>{player.points} points</span>
                <div className="podium-base" />
              </article>
            ))}
          </div>

          <section className="panel table-panel">
            <div className="panel-heading">
              <h2>Full Standings</h2>
              <button className="secondary-button" type="button">
                2026 Season <ChevronRight size={16} />
              </button>
            </div>

            <div className="data-table">
              <div className="table-row table-head">
                <span>Rank</span>
                <span>Player</span>
                <span>Points</span>
                <span>Correct</span>
                <span>Incorrect</span>
                <span>Accuracy</span>
              </div>

              {rankedStandings.map((player) => {
                const isCurrentPlayer = player.userID === currentUser?.userID;

                return (
                  <div
                    className={`table-row ${isCurrentPlayer ? "current-player" : ""}`}
                    key={player.userID}
                  >
                    <strong>#{player.rank}</strong>
                    <div className="player-cell">
                      <span className="avatar">
                        {initials(player.displayName)}
                      </span>
                      <strong>{player.displayName}</strong>
                      {isCurrentPlayer && <em>You</em>}
                    </div>
                    <strong>{player.points}</strong>
                    <span>{player.correctPicks}</span>
                    <span>{player.incorrectPicks}</span>
                    <span>
                      {Number(player.winningPercentage || 0).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}

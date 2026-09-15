import { useEffect, useState } from "react";
import { Check, Clock3 } from "lucide-react";
import StatCard from "../common/StatCard";
import { getWeeklyResults } from "../../services/weeklyResultsService";
import { getWeeks } from "../../services/weekService";
import { loadUserSession } from "../../services/sessionService";
import "./WeeklyResultsScreen.css";

export default function WeeklyResultsScreen({ results, loading, error, weekNumber = 1 }) {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    getWeeks().then((items) => {
      setWeeks(items);
      const active = items.find((item) => item.weekNumber === weekNumber);
      setSelectedWeekId(active?.weekID ?? items[0]?.weekID ?? null);
      setReview(null);
    }).catch(() => setWeeks([]));
  }, [weekNumber]);

  async function changeWeek(id) {
    setSelectedWeekId(id);
    const chosen = weeks.find((item) => item.weekID === id);
    if (!chosen || chosen.weekNumber === weekNumber) {
      setReview(null);
      setReviewError("");
      return;
    }
    const user = loadUserSession();
    if (!user?.userID) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      setReview(await getWeeklyResults(user.userID, id));
    } catch (loadError) {
      setReviewError(loadError.message || "Weekly results could not be loaded.");
    } finally {
      setReviewLoading(false);
    }
  }

  const chosenWeek = weeks.find((item) => item.weekID === selectedWeekId);
  const displayWeek = chosenWeek?.weekNumber ?? weekNumber;
  const activeResults = review ?? results;
  const {
    games = [], standing = null, correctPicks = 0, incorrectPicks = 0,
    gamesRemaining = 0, bestPossible = 0, finalGames = 0,
  } = activeResults || {};

  return (
    <>
      <div className="page-heading split-heading">
        <div><span className="eyebrow">Week {displayWeek}</span><h1>Weekly Results</h1><p>Your completed games, current score, and remaining picks.</p></div>
        <div className="week-results-heading-controls">
          {weeks.length > 0 && <select className="week-selector" value={selectedWeekId ?? ""} onChange={(event) => changeWeek(Number(event.target.value))}>{weeks.map((week) => <option key={week.weekID} value={week.weekID}>Week {week.weekNumber}</option>)}</select>}
          <div className="score-orb"><strong>{correctPicks}</strong><span>Correct</span></div>
        </div>
      </div>
      {(loading || reviewLoading) && <div className="notice">Loading weekly results...</div>}
      {(error || reviewError) && <div className="notice purple">{error || reviewError}</div>}
      {!loading && !reviewLoading && !error && !reviewError && (
        <>
          <div className="stat-grid">
            <StatCard label="Your Rank" value={standing?.rank ? `#${standing.rank}` : "--"} detail={standing ? `${standing.points} points this week` : "No standing available"} tone="green" />
            <StatCard label="Correct Picks" value={`${correctPicks} of ${correctPicks + incorrectPicks}`} detail={standing ? `${Number(standing.winningPercentage || 0).toFixed(1)}% this week` : "Awaiting scored picks"} />
            <StatCard label="Games Remaining" value={gamesRemaining} detail={gamesRemaining === 1 ? "One game pending" : `${gamesRemaining} games pending`} tone="purple" />
            <StatCard label="Best Possible" value={bestPossible} detail="Current points plus remaining games" tone="gold" />
          </div>
          <section className="panel">
            <div className="panel-heading"><h2>Game Results</h2><span className="live-pill">{finalGames} Final</span></div>
            {games.length === 0 ? <div className="notice">No games are available for Week {displayWeek}.</div> : (
              <div className="result-list">
                {games.map((game) => {
                  const isFinal = game.gameStatus === "Final";
                  const isCorrect = game.isCorrect === true;
                  const isIncorrect = game.isCorrect === false;
                  return (
                    <div className="result-row" key={game.gameID}>
                      <span className={`result-icon ${isCorrect ? "correct" : isIncorrect ? "incorrect" : isFinal && !game.selectedTeam ? "no-pick" : "pending"}`}>{isFinal ? <Check size={18} /> : <Clock3 size={18} />}</span>
                      <div className="result-detail">
                        <div className="result-teams"><strong>{game.awayTeam} at {game.homeTeam}</strong><span>{isFinal ? `${game.awayScore ?? 0} - ${game.homeScore ?? 0} · Final` : `${game.day} · ${game.time}`}</span></div>
                        <div className="your-pick"><span>Your Pick</span><strong>{game.selectedTeam || "No pick"}</strong></div>
                      </div>
                      <span className={`result-badge ${isCorrect ? "win" : ""}`}>{isFinal ? game.selectedTeam ? game.pointsAwarded != null ? `${game.pointsAwarded > 0 ? "+" : ""}${game.pointsAwarded} Point${game.pointsAwarded === 1 ? "" : "s"}` : "Not Submitted" : "No Pick" : "Pending"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

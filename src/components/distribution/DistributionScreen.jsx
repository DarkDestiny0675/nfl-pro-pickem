import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import TeamMark from "../common/TeamMark";
import { getWeekPickDistribution } from "../../services/pickService";
import { getWeeks } from "../../services/weekService";
import {
  centralTimeZoneName,
  DISPLAY_TIME_ZONE,
  parseLeagueDateTime,
} from "../../utils/gameUtils";
import "./DistributionScreen.css";

function team(name, code, id) {
  const parts = (name || "Unknown Team").split(" ");
  return {
    id,
    city: parts.slice(0, -1).join(" "),
    name: parts.at(-1),
    fullName: name,
    short: code,
  };
}

function format(game) {
  const kickoff = parseLeagueDateTime(game.kickoffAtUtc);
  const lockAt = parseLeagueDateTime(game.lockAtUtc);
  const gameStatus = String(game.gameStatus || "").toLowerCase();
  const isClosed =
    game.isLocked || gameStatus === "final" || gameStatus === "in progress";
  return {
    id: game.gameID,
    status: isClosed ? "closed" : "open",
    show: Number(game.submittedPickCount || 0) > 0,
    day: kickoff.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: DISPLAY_TIME_ZONE,
    }),
    time: kickoff.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: DISPLAY_TIME_ZONE,
    }),
    tz: centralTimeZoneName(game.kickoffAtUtc),
    lock: `Locks ${lockAt.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: DISPLAY_TIME_ZONE,
    })} at ${lockAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: DISPLAY_TIME_ZONE,
    })} ${centralTimeZoneName(game.lockAtUtc)}`,
    away: team(game.awayTeam, game.awayTeamCode, game.awayTeamID),
    home: team(game.homeTeam, game.homeTeamCode, game.homeTeamID),
    awayPercent: game.awayPercent ?? 0,
    homePercent: game.homePercent ?? 0,
    count: game.submittedPickCount ?? 0,
  };
}

export default function DistributionScreen({
  distribution = [],
  loading = false,
  error = "",
}) {
  const [weeks, setWeeks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    getWeeks()
      .then((items) => {
        setWeeks(items);
        const active =
          items.find((week) => week.status !== "Finalized") ?? items.at(-1);
        setSelected(active?.weekID ?? null);
      })
      .catch((loadError) =>
        setReviewError(loadError.message || "Weeks could not be loaded."),
      );
  }, []);

  async function change(weekId) {
    setSelected(weekId);
    setBusy(true);
    setReviewError("");
    try {
      setReview(await getWeekPickDistribution(weekId));
    } catch (loadError) {
      setReviewError(loadError.message || "Pick distribution could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  const games = (review ?? distribution).map(format);
  const visibleError = reviewError || error;
  return (
    <>
      <div className="page-heading distribution-page-heading">
        <div>
          <span className="eyebrow">Community Insights</span>
          <h1>Pick Distribution</h1>
          <p>Each week shows its own team-selection percentages.</p>
        </div>
        {weeks.length > 0 && (
          <select
            className="week-selector"
            value={selected ?? ""}
            onChange={(event) => change(Number(event.target.value))}
          >
            {weeks.map((week) => (
              <option key={week.weekID} value={week.weekID}>
                Week {week.weekNumber}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="notice purple">
        <ShieldCheck size={20} />
        <div>
          <strong>Submitted Picks Only</strong>
          <span>Percentage of team selection based on submitted picks only.</span>
        </div>
      </div>
      {(loading || busy) && <div className="panel">Loading pick distribution...</div>}
      {visibleError && <div className="notice purple">{visibleError}</div>}
      {!loading && !busy && !visibleError && (
        <section className="distribution-grid">
          {games.map((game) => (
            <article className="distribution-card" key={game.id}>
              <div className="distribution-heading">
                <span>{game.day} · {game.time} {game.tz}</span>
                <span className={`status-dot ${game.status}`}>{game.status}</span>
              </div>
              {game.show ? (
                <>
                  <Row team={game.away} value={game.awayPercent} />
                  <Row team={game.home} value={game.homePercent} />
                  <small className="response-count">
                    Based on {game.count} submitted {game.count === 1 ? "pick" : "picks"}
                  </small>
                </>
              ) : (
                <div className="hidden-distribution">
                  <Lock size={28} />
                  <strong>No submitted picks yet</strong>
                  <span>{game.lock}</span>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function Row({ team, value }) {
  return (
    <div className="distribution-row">
      <TeamMark team={team} size="small" side="away" />
      <strong>{team.short}</strong>
      <div className="distribution-bar">
        <div style={{ width: `${value}%` }} />
      </div>
      <b>{value}%</b>
    </div>
  );
}

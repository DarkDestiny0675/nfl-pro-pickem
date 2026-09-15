import { useEffect, useState } from "react";
import { CalendarSync, Play, RotateCcw, Save, Trophy } from "lucide-react";
import { getGamesByWeek } from "../../services/gameService";
import {
  finalizeWeek,
  resetSeason,
  resetWeek,
  restoreOfficialSchedule,
  simulateGame,
  simulateWeek,
} from "../../services/simulationService";
import ConfirmModal from "../common/ConfirmModal";
import "./SimulationCenter.css";

export default function SimulationCenter({
  currentUser,
  weekId,
  weekNumber = 1,
  onWeekReset,
}) {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState("");
  const [awayScore, setAwayScore] = useState(24);
  const [homeScore, setHomeScore] = useState(21);
  const [status, setStatus] = useState("Final");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  async function loadGames() {
    if (!weekId) return;
    const values = await getGamesByWeek(weekId);
    setGames(values);
    if (
      values.length &&
      !values.some((game) => String(game.gameID) === String(gameId))
    ) {
      setGameId(String(values[0].gameID));
    }
  }

  useEffect(() => {
    loadGames().catch((loadError) => setError(loadError.message));
  }, [weekId]);

  function addLog(text) {
    setLog((items) =>
      [`${new Date().toLocaleTimeString()}  ${text}`, ...items].slice(0, 8),
    );
  }

  async function run(action, success, reloadAfter = false) {
    setBusy(true);
    setError("");
    try {
      await action();
      addLog(success);
      if (reloadAfter) {
        window.location.reload();
        return;
      }
      await loadGames();
    } catch (actionError) {
      setError(actionError.message || "Simulation action failed.");
    } finally {
      if (!reloadAfter) setBusy(false);
    }
  }

  async function executeResetWeek() {
    setConfirmation(null);
    await run(async () => {
      await resetWeek(weekId);
      if (onWeekReset) await onWeekReset();
    }, `Week ${weekNumber} reset to a clean simulation state`);
  }

  async function executeRestore() {
    setConfirmation(null);
    await run(
      () => restoreOfficialSchedule(weekId),
      "Official NFL schedule restored and verified",
    );
  }

  async function executeSeasonReset() {
    setConfirmation(null);
    await run(
      () => resetSeason(currentUser?.seasonID || 1),
      "Season reset to Week 1",
      true,
    );
  }

  const selected = games.find((game) => String(game.gameID) === String(gameId));

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Commissioner Testing</span>
        <h1>Simulation Center</h1>
        <p>
          Test scores, scoring, winners, and weekly finalization without live
          games.
        </p>
      </div>
      {error && <div className="notice purple">{error}</div>}
      <div className="notice">
        Live Results now reads stored SQL scores only. These controls remain
        available for commissioner testing and manual result workflows; opening
        Live Results no longer contacts ESPN.
      </div>
      <section className="simulation-actions">
        <button
          onClick={() =>
            run(() => simulateWeek(weekId), `Week ${weekNumber} simulated`)
          }
          disabled={busy}
        >
          <Play /> Simulate Week
        </button>
        <button
          onClick={() =>
            run(
              () => finalizeWeek(weekId, currentUser?.userID),
              `Week ${weekNumber} finalized`,
              true,
            )
          }
          disabled={busy}
        >
          <Trophy /> Finalize Week
        </button>
        <button
          className="danger"
          onClick={() => setConfirmation("resetWeek")}
          disabled={busy}
        >
          <RotateCcw /> Reset Week
        </button>
        <button
          className="restore"
          onClick={() => setConfirmation("restore")}
          disabled={busy}
        >
          <CalendarSync /> Restore Official Schedule
        </button>
        <button
          className="danger"
          onClick={() => setConfirmation("resetSeason")}
          disabled={busy}
        >
          <RotateCcw /> Reset Entire Season
        </button>
      </section>

      <section className="panel simulation-game-panel">
        <div className="panel-heading">
          <h2>Game Simulation</h2>
          <strong>Week {weekNumber}</strong>
        </div>
        <div className="simulation-form">
          <label>
            <span>Game</span>
            <select
              value={gameId}
              onChange={(event) => setGameId(event.target.value)}
            >
              {games.map((game) => (
                <option key={game.gameID} value={game.gameID}>
                  {game.awayTeam} at {game.homeTeam}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Away Score</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
            />
          </label>
          <label>
            <span>Home Score</span>
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>Scheduled</option>
              <option>InProgress</option>
              <option>Final</option>
            </select>
          </label>
        </div>
        <button
          className="primary-button"
          disabled={busy || !selected}
          onClick={() =>
            run(
              () =>
                simulateGame({
                  gameID: Number(gameId),
                  awayScore: Number(awayScore),
                  homeScore: Number(homeScore),
                  gameStatus: status,
                }),
              `${selected?.awayTeam} ${awayScore}, ${selected?.homeTeam} ${homeScore} applied`,
            )
          }
        >
          <Save /> Apply Simulation
        </button>
      </section>

      <section className="panel simulation-log">
        <div className="panel-heading">
          <h2>Activity Log</h2>
        </div>
        {log.length ? (
          log.map((item, index) => <div key={`${item}-${index}`}>{item}</div>)
        ) : (
          <p>No simulation activity yet.</p>
        )}
      </section>

      <ConfirmModal
        open={confirmation === "resetWeek"}
        title={`Reset Week ${weekNumber}`}
        message="This clears only the selected week's picks, submissions, scores, and winner."
        confirmLabel="Reset Week"
        busy={busy}
        onCancel={() => setConfirmation(null)}
        onConfirm={executeResetWeek}
      />
      <ConfirmModal
        open={confirmation === "restore"}
        title="Restore Official Schedule"
        message="This replaces simulated kickoff dates with the official schedule."
        confirmLabel="Restore Schedule"
        tone="warning"
        busy={busy}
        onCancel={() => setConfirmation(null)}
        onConfirm={executeRestore}
      />
      <ConfirmModal
        open={confirmation === "resetSeason"}
        title="Reset Entire Season"
        message="This permanently clears every season pick, submission, score, weekly winner, season champion, override, and pending schedule update, restores the official schedule, and returns the application to Week 1."
        confirmLabel="Reset Entire Season"
        busy={busy}
        onCancel={() => setConfirmation(null)}
        onConfirm={executeSeasonReset}
      />
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, X } from "lucide-react";
import { helmetLookup } from "../../utils/helmetLookup";
import {
  getGamesByWeek,
  getTeams,
  importSeasonSchedule,
  setGameOfWeek,
} from "../../services/gameService";
import "./ScheduleScreen.css";

const SEASON_YEAR = 2026;
const WEEKS = Array.from({ length: 18 }, (_, index) => index + 1);

function ScheduleHelmet({ teamName, side }) {
  const source = helmetLookup[teamName]?.[side];
  return source ? (
    <img className="schedule-helmet-image" src={source} alt={`${teamName} helmet`} />
  ) : (
    <span className="schedule-helmet-fallback">NFL</span>
  );
}

function normalizeGame(game) {
  const value = game.kickoffAtUtc.endsWith("Z")
    ? game.kickoffAtUtc
    : `${game.kickoffAtUtc}Z`;
  const kickoff = new Date(value);
  return {
    ...game,
    id: game.gameID,
    day: kickoff.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "America/Chicago",
    }),
    time: kickoff.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
    }),
    away: { id: game.awayTeamID, name: game.awayTeam },
    home: { id: game.homeTeamID, name: game.homeTeam },
    status: game.gameStatus?.toLowerCase() || "scheduled",
  };
}

export default function ScheduleScreen({ games: initialGames = [] }) {
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState(initialGames);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadWeek(selectedWeek) {
    setBusy(true);
    setMessage("");
    try {
      const result = await getGamesByWeek(selectedWeek);
      setGames(result.map(normalizeGame));
    } catch (error) {
      setGames([]);
      setMessage(error.message || `Week ${selectedWeek} could not be loaded.`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadWeek(week);
  }, [week]);

  useEffect(() => {
    getTeams().then(setTeams).catch(() => setTeams([]));
  }, []);

  const visibleGames = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return games;
    return games.filter((game) =>
      `${game.away.name} ${game.home.name}`.toLowerCase().includes(value),
    );
  }, [games, search]);

  async function handleImport() {
    setBusy(true);
    setMessage("Importing the 2026 regular-season schedule from ESPN...");
    try {
      const result = await importSeasonSchedule(SEASON_YEAR);
      setMessage(result.message);
      await loadWeek(week);
    } catch (error) {
      setMessage(error.message || "Schedule import failed.");
      setBusy(false);
    }
  }

  async function handleGameOfWeek(gameId) {
    setBusy(true);
    try {
      await setGameOfWeek(gameId);
      setGames((current) => current.map((game) => ({
        ...game,
        isGameOfWeek: game.gameID === gameId,
      })));
    } catch (error) {
      setMessage(error.message || "Game of the Week could not be updated.");
    } finally {
      setBusy(false);
    }
  }


  return (
    <>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">Commissioner Center</span>
          <h1>Manage Schedule</h1>
          <p>Import the season, manage weekly games, and choose the featured matchup.</p>
        </div>
        <div className="schedule-heading-actions">
          <button className="secondary-button" type="button" onClick={handleImport} disabled={busy}>
            <Download size={18} /> Import 2026 Schedule
          </button>
          <button className="primary-button" type="button">
            <Plus size={18} /> Add Game
          </button>
        </div>
      </div>

      <section className="panel schedule-management-panel">
        <div className="toolbar schedule-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search teams or matchup" />
          </div>
          <select value={week} onChange={(event) => setWeek(Number(event.target.value))}>
            {WEEKS.map((number) => <option key={number} value={number}>Week {number}</option>)}
          </select>
        </div>

        {message && <div className="schedule-message">{message}</div>}
        {busy && <div className="schedule-loading">Working...</div>}
        {!busy && visibleGames.length === 0 && <div className="schedule-empty">No games found for Week {week}.</div>}

        <div className="schedule-management-list">
          {visibleGames.map((game) => (
            <div className="schedule-management-row" key={game.gameID}>
              <div className="schedule-time"><strong>{game.day}</strong><span>{game.time}</span></div>
              <strong className="schedule-away-name">{game.away.name}</strong>
              <div className="schedule-away-helmet"><ScheduleHelmet teamName={game.away.name} side="away" /></div>
              <span className="schedule-versus">AT</span>
              <div className="schedule-home-helmet"><ScheduleHelmet teamName={game.home.name} side="home" /></div>
              <strong className="schedule-home-name">{game.home.name}</strong>
              <span className={`status-dot ${game.status}`}>{game.status}</span>
              <label className="game-of-week-choice">
                <input type="radio" name="game-of-week" checked={game.isGameOfWeek === true} disabled={busy} onChange={() => handleGameOfWeek(game.gameID)} />
                <span>Game of the Week</span>
              </label>
              <button className="icon-button" type="button" aria-label="Edit game" onClick={() => setMessage(
                "Game editing will be enabled after the schedule import is validated.",
              )}><Pencil size={18} /></button>
            </div>
          ))}
        </div>
      </section>


    </>
  );
}

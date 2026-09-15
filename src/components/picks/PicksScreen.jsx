import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCheck, Clock3, Lock } from "lucide-react";
import TeamMark from "../common/TeamMark";
import ConfirmModal from "../common/ConfirmModal";
import { getGamesByWeek } from "../../services/gameService";
import {
  getPicksByWeek,
  getWeekEntryStatus,
  submitPick,
  submitWeekEntry,
} from "../../services/pickService";
import { getWeeks } from "../../services/weekService";
import { loadUserSession } from "../../services/sessionService";
import { normalizeApiGame } from "../../utils/gameUtils";
import "./PicksScreen.css";

export default function PicksScreen(props) {
  const {
    games,
    picks,
    submitted,
    requiresResubmit = false,
    onSubmit,
    onPick,
    loading,
    error,
    seasonYear = 2026,
    weekNumber = 1,
    tieBreakerRequired = false,
    tieBreakerQuestion = "",
    tieBreakerGuess = "",
    tieBreakerLocked = false,
    onTieBreakerGuessChange,
  } = props;
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeWeek = useMemo(
    () => weeks.find((w) => Number(w.weekNumber) === Number(weekNumber)),
    [weeks, weekNumber],
  );
  useEffect(() => {
    getWeeks()
      .then((items) => {
        setWeeks(items);
        const active = items.find(
          (w) => Number(w.weekNumber) === Number(weekNumber),
        );
        setSelectedWeekId(active?.weekID ?? items[0]?.weekID ?? null);
        setSelectedState(null);
      })
      .catch((e) =>
        setSelectedError(e.message || "Weeks could not be loaded."),
      );
  }, [weekNumber]);

  async function changeWeek(weekId) {
    setSelectedWeekId(weekId);
    if (Number(weekId) === Number(activeWeek?.weekID)) {
      setSelectedState(null);
      setSelectedError("");
      return;
    }
    const user = loadUserSession();
    if (!user?.userID) return;
    setSelectedLoading(true);
    setSelectedError("");
    try {
      const [loadedGames, savedPicks, entry] = await Promise.all([
        getGamesByWeek(weekId),
        getPicksByWeek(user.userID, weekId),
        getWeekEntryStatus(user.userID, weekId),
      ]);
      const restored = {};
      savedPicks.forEach((pick) => {
        restored[pick.gameID] =
          pick.selectedTeamID === pick.awayTeamID ? "away" : "home";
      });
      setSelectedState({
        games: loadedGames.map(normalizeApiGame),
        picks: restored,
        submitted: entry.entryStatus === "Submitted",
        requiresResubmit: false,
        tieBreakerRequired: Boolean(entry.tieBreakerRequired),
        tieBreakerQuestion: entry.tieBreakerQuestion || "",
        tieBreakerGuess:
          entry.tieBreakerGuess == null ? "" : String(entry.tieBreakerGuess),
        tieBreakerLocked: Boolean(entry.tieBreakerLocked),
      });
    } catch (e) {
      setSelectedError(e.message || "The selected week could not be loaded.");
    } finally {
      setSelectedLoading(false);
    }
  }

  const selectedWeek = weeks.find(
    (w) => Number(w.weekID) === Number(selectedWeekId),
  );
  const displayWeekNumber = selectedWeek?.weekNumber ?? weekNumber;
  const readOnly =
    Number(displayWeekNumber) < Number(weekNumber) ||
    String(selectedWeek?.status || "").toLowerCase() === "finalized";
  const alternate = selectedState != null;
  const displayGames = selectedState?.games ?? games;
  const displayPicks = selectedState?.picks ?? picks;
  const displaySubmitted = selectedState?.submitted ?? submitted;
  const displayRequires = selectedState?.requiresResubmit ?? requiresResubmit;
  const tbRequired = selectedState?.tieBreakerRequired ?? tieBreakerRequired;
  const tbQuestion = selectedState?.tieBreakerQuestion ?? tieBreakerQuestion;
  const tbGuess = selectedState?.tieBreakerGuess ?? tieBreakerGuess;
  const tbLocked = selectedState?.tieBreakerLocked ?? tieBreakerLocked;
  const total = displayGames.length;
  const selectedCount = displayGames.filter((g) => displayPicks[g.id]).length;
  const ready =
    total > 0 &&
    selectedCount === total &&
    (!tbRequired || (tbGuess !== "" && Number(tbGuess) >= 0));

  async function saveAlternate(game, side) {
    if (readOnly) return;
    const user = loadUserSession();
    if (!user?.userID) return;
    const selectedTeamID = side === "away" ? game.awayTeamID : game.homeTeamID;
    const previous = selectedState.picks[game.id];
    setSelectedState((state) => ({
      ...state,
      picks: { ...state.picks, [game.id]: side },
      requiresResubmit:
        state.submitted && previous !== side ? true : state.requiresResubmit,
    }));
    try {
      await submitPick(user.userID, game.gameID, selectedTeamID);
    } catch (e) {
      setSelectedError(e.message || "The pick could not be saved.");
    }
  }
  async function submitAlternate() {
    const user = loadUserSession();
    if (!user?.userID || !selectedWeekId) return;
    setSubmitting(true);
    try {
      await submitWeekEntry(user.userID, selectedWeekId, tbGuess);
      setSelectedState((state) => ({
        ...state,
        submitted: true,
        requiresResubmit: false,
      }));
      setShowSubmit(false);
    } catch (e) {
      setSelectedError(e.message || "Week picks could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">{seasonYear} Regular Season</span>
          <h1>Week {displayWeekNumber} Picks</h1>
          <p>
            {readOnly
              ? "Review your submitted selections for this completed week."
              : "Select the team you believe will win each matchup."}
          </p>
        </div>
        <div className="picks-heading-tools">
          {weeks.length > 0 && (
            <select
              className="week-selector"
              value={selectedWeekId ?? ""}
              onChange={(e) => changeWeek(Number(e.target.value))}
            >
              {weeks.map((w) => (
                <option key={w.weekID} value={w.weekID}>
                  Week {w.weekNumber}
                  {Number(w.weekNumber) === Number(weekNumber)
                    ? " (Current)"
                    : ""}
                </option>
              ))}
            </select>
          )}
          <div className="week-progress">
            <div>
              <span>Your Progress</span>
              <strong>
                {selectedCount} of {total} selected
              </strong>
            </div>
            <div className="progress-track">
              <div
                style={{
                  width: `${total ? (selectedCount / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {readOnly ? (
        <div className="notice purple">
          <Lock size={20} />
          <div>
            <strong>Historical Review Mode</strong>
            <span>
              Selections, tie-breaker, and submission controls are read-only.
            </span>
          </div>
        </div>
      ) : (
        <div className="notice">
          <Clock3 size={20} />
          <div>
            <strong>Each matchup locks one hour before kickoff.</strong>
            <span>You may edit any pick until that matchup locks.</span>
          </div>
        </div>
      )}
      {(loading || selectedLoading) && (
        <div className="notice">Loading Week {displayWeekNumber} games...</div>
      )}
      {(selectedError || error) && (
        <div className="notice purple">{selectedError || error}</div>
      )}
      <section className="game-list">
        {displayGames.map((game) => {
          const locked =
            readOnly ||
            [
              "locked",
              "InProgress",
              "Final",
              "Canceled",
              "Postponed",
              "Suspended",
            ].includes(game.status);
          const selected = displayPicks[game.id];
          return (
            <article
              className={`game-card ${locked ? "is-locked" : ""}`}
              key={game.id}
            >
              <div className="game-meta">
                <div>
                  <span className="game-day">{game.day}</span>
                  <strong>{game.time}</strong>
                  <small>{game.network}</small>
                </div>
                <span className={`lock-pill ${locked ? "locked" : ""}`}>
                  {locked ? <Lock size={14} /> : <Clock3 size={14} />}{" "}
                  {game.lockText}
                </span>
              </div>
              <div className="matchup">
                <button
                  className={`team-choice ${selected === "away" ? "selected" : ""}`}
                  disabled={locked}
                  onClick={() =>
                    alternate
                      ? saveAlternate(game, "away")
                      : onPick(game, "away")
                  }
                >
                  <TeamMark team={game.away} side="away" />
                  <span>
                    <small>{game.awayTeam}</small>
                  </span>
                  {selected === "away" && (
                    <Check className="selection-check" size={20} />
                  )}
                </button>
                <div className="versus">AT</div>
                <button
                  className={`team-choice ${selected === "home" ? "selected" : ""}`}
                  disabled={locked}
                  onClick={() =>
                    alternate
                      ? saveAlternate(game, "home")
                      : onPick(game, "home")
                  }
                >
                  <TeamMark team={game.home} side="home" />
                  <span>
                    <small>{game.homeTeam}</small>
                  </span>
                  {selected === "home" && (
                    <Check className="selection-check" size={20} />
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>
      {tbRequired && (
        <section className="panel tie-breaker-entry">
          <div className="panel-heading">
            <h2>Weekly Tie-Breaker</h2>
          </div>
          <label>
            <span>{tbQuestion || "Enter your tie-breaker guess."}</span>
            <input
              type="number"
              value={tbGuess}
              disabled={readOnly || tbLocked}
              onChange={(e) =>
                alternate
                  ? setSelectedState((state) => ({
                      ...state,
                      tieBreakerGuess: e.target.value,
                      requiresResubmit: state.submitted
                        ? true
                        : state.requiresResubmit,
                    }))
                  : onTieBreakerGuessChange?.(e.target.value)
              }
            />
          </label>
        </section>
      )}
      {!readOnly && (
        <div className="sticky-submit">
          <div>
            <strong>
              {displaySubmitted && displayRequires
                ? `Week ${displayWeekNumber} Picks Modified`
                : displaySubmitted
                  ? `Week ${displayWeekNumber} Picks Submitted`
                  : `${selectedCount} of ${total} picks ready`}
            </strong>
            <span>
              {displaySubmitted
                ? "Open matchups remain editable. Changes require re-submission."
                : "Review your selections before submitting."}
            </span>
          </div>
          <button
            className="primary-button"
            disabled={!ready || (displaySubmitted && !displayRequires)}
            onClick={() => (alternate ? setShowSubmit(true) : onSubmit())}
          >
            <ClipboardCheck size={19} />
            {displaySubmitted && displayRequires
              ? `Re-Submit Week ${displayWeekNumber} Picks`
              : displaySubmitted
                ? "Submitted"
                : `Submit Week ${displayWeekNumber} Picks`}
          </button>
        </div>
      )}
      <ConfirmModal
        open={showSubmit}
        title={`Submit Week ${displayWeekNumber} Picks?`}
        message="Your selections will be marked as submitted. Open matchups remain editable, but changes require re-submission."
        confirmLabel="Submit Picks"
        tone="warning"
        busy={submitting}
        onCancel={() => setShowSubmit(false)}
        onConfirm={submitAlternate}
      />
    </>
  );
}

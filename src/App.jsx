import { useCallback, useEffect, useState } from "react";
import { games as mockGames } from "./data";
import { getGamesByWeek, setGameOfWeek } from "./services/gameService";
import { getSeasonStandings } from "./services/leaderboardService";
import { getWeeklyResults } from "./services/weeklyResultsService";
import {
  getPicksByWeek,
  getWeekEntryStatus,
  submitPick,
  submitWeekEntry,
  getWeekPickDistribution,
} from "./services/pickService";
import { getLiveResults } from "./services/liveResultsService";
import { getUserProfile } from "./services/userService";
import { getDashboardSummary } from "./services/dashboardService";
import {
  clearUserSession,
  loadUserSession,
  saveUserSession,
} from "./services/sessionService";
import SplashScreen from "./components/splash/SplashScreen";
import ScheduleScreen from "./components/schedule/ScheduleScreen";
import LiveResultsScreen from "./components/results/LiveResultsScreen";
import WeeklyResultsScreen from "./components/results/WeeklyResultsScreen";
import PlayerApprovalsScreen from "./components/players/PlayerApprovalsScreen";
import PicksScreen from "./components/picks/PicksScreen";
import DistributionScreen from "./components/distribution/DistributionScreen";
import CommentsScreen from "./components/comments/CommentsScreen";
import LeaderboardScreen from "./components/leaderboard/LeaderboardScreen";
import ProfileScreen from "./components/profile/ProfileScreen";
import AdminScreen from "./components/admin/AdminScreen";
import SimulationCenter from "./components/admin/SimulationCenter";
import AuditScreen from "./components/audit/AuditScreen";
import { normalizeApiGame } from "./utils/gameUtils";
import ApplicationShell from "./components/shell/ApplicationShell";
import ForcePasswordChangeScreen from "./components/auth/ForcePasswordChangeScreen";
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [leagueContext, setLeagueContext] = useState(null);
  const [leagueContextError, setLeagueContextError] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState("");
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState("");
  const [weeklyResults, setWeeklyResults] = useState(null);
  const [weeklyResultsLoading, setWeeklyResultsLoading] = useState(false);
  const [weeklyResultsError, setWeeklyResultsError] = useState("");
  const [liveResults, setLiveResults] = useState(null);
  const [liveResultsLoading, setLiveResultsLoading] = useState(false);
  const [liveResultsError, setLiveResultsError] = useState("");
  const [distribution, setDistribution] = useState([]);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionError, setDistributionError] = useState("");
  const [updatingGameOfWeek, setUpdatingGameOfWeek] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
  useEffect(() => {
    async function loadLeagueContext() {
      setLeagueContextError("");
      try {
        setLeagueContext(await getDashboardSummary());
      } catch (error) {
        setLeagueContextError(
          error.message || "League information could not be loaded.",
        );
      }
    }
    loadLeagueContext();
  }, []);
  useEffect(() => {
    async function restoreSession() {
      const savedUser = loadUserSession();
      if (!savedUser?.userID) {
        setRestoringSession(false);
        return;
      }
      try {
        const profile = await getUserProfile(savedUser.userID);
        const restoredUser = { ...savedUser, ...profile };
        setCurrentUser(restoredUser);
        setPage(profile.isProfileComplete ? "picks" : "profile");
        setAuthenticated(true);
      } catch {
        clearUserSession();
      } finally {
        setRestoringSession(false);
      }
    }
    restoreSession();
  }, []);
  useEffect(() => {
    async function loadWeek() {
      if (!currentUser?.userID || !leagueContext?.weekID) {
        return;
      }
      setGamesLoading(true);
      setGamesError("");
      try {
        const [loadedGames, savedPicks, entryStatus] = await Promise.all([
          getGamesByWeek(leagueContext.weekID),
          getPicksByWeek(currentUser.userID, leagueContext.weekID),
          getWeekEntryStatus(currentUser.userID, leagueContext.weekID),
        ]);
        setGames(loadedGames.map(normalizeApiGame));
        const restoredPicks = {};
        savedPicks.forEach((pick) => {
          restoredPicks[pick.gameID] =
            pick.selectedTeamID === pick.awayTeamID ? "away" : "home";
        });
        setPicks(restoredPicks);
        setSubmitted(entryStatus.entryStatus === "Submitted");
        setRequiresResubmit(false);
        setTieBreakerRequired(Boolean(entryStatus.tieBreakerRequired));
        setTieBreakerQuestion(entryStatus.tieBreakerQuestion || "");
        setTieBreakerLocked(Boolean(entryStatus.tieBreakerLocked));
        setTieBreakerLockAtUtc(entryStatus.tieBreakerLockAtUtc || null);
        setTieBreakerGuess(
          entryStatus.tieBreakerGuess == null
            ? ""
            : String(entryStatus.tieBreakerGuess),
        );
      } catch (error) {
        console.error("Week load failed", error);
        setGamesError(
          error.message ||
            `Week ${leagueContext.weekNumber} could not be loaded.`,
        );
      } finally {
        setGamesLoading(false);
      }
    }
    if (authenticated) {
      loadWeek();
    }
  }, [authenticated, currentUser?.userID, leagueContext?.weekID]);
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState("picks");
  const [picks, setPicks] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [requiresResubmit, setRequiresResubmit] = useState(false);
  const [tieBreakerRequired, setTieBreakerRequired] = useState(false);
  const [tieBreakerQuestion, setTieBreakerQuestion] = useState("");
  const [tieBreakerGuess, setTieBreakerGuess] = useState("");
  const [tieBreakerLocked, setTieBreakerLocked] = useState(false);
  const [tieBreakerLockAtUtc, setTieBreakerLockAtUtc] = useState(null);
  const [submittingWeek, setSubmittingWeek] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    async function refreshDashboard() {
      setDashboardLoading(true);
      setLeagueContextError("");
      try {
        setLeagueContext(await getDashboardSummary());
      } catch (error) {
        setLeagueContextError(error.message || "League dashboard could not be loaded.");
      } finally {
        setDashboardLoading(false);
      }
    }
    if (authenticated && page === "admin") refreshDashboard();
  }, [authenticated, page]);

  useEffect(() => {
    async function loadStandings() {
      setStandingsLoading(true);
      setStandingsError("");
      try {
        const loadedStandings = await getSeasonStandings(
          leagueContext.seasonID,
        );
        setStandings(loadedStandings);
      } catch (error) {
        console.error("Leaderboard load failed", error);
        setStandingsError(
          error.message || "The leaderboard could not be loaded.",
        );
      } finally {
        setStandingsLoading(false);
      }
    }
    if (authenticated && page === "leaderboard" && leagueContext?.seasonID) {
      loadStandings();
    }
  }, [authenticated, page, leagueContext?.seasonID]);
  useEffect(() => {
    async function loadResults() {
      if (!currentUser?.userID || !leagueContext?.weekID) {
        return;
      }
      setWeeklyResultsLoading(true);
      setWeeklyResultsError("");
      try {
        const loadedResults = await getWeeklyResults(
          currentUser.userID,
          leagueContext.weekID,
        );
        setWeeklyResults(loadedResults);
      } catch (error) {
        console.error("Weekly results load failed", error);
        setWeeklyResultsError(
          error.message || "Weekly results could not be loaded.",
        );
      } finally {
        setWeeklyResultsLoading(false);
      }
    }
    if (authenticated && page === "results") {
      loadResults();
    }
  }, [authenticated, page, currentUser?.userID, leagueContext?.weekID]);
  useEffect(() => {
    async function loadDistribution() {
      if (!leagueContext?.weekID) return;
      setDistributionLoading(true); setDistributionError("");
      try { setDistribution(await getWeekPickDistribution(leagueContext.weekID)); }
      catch (error) { setDistributionError(error.message || "Pick distribution could not be loaded."); }
      finally { setDistributionLoading(false); }
    }
    if (authenticated && page === "distribution") loadDistribution();
  }, [authenticated, page, leagueContext?.weekID]);

  const loadLiveResults = useCallback(async ({ silent = false } = {}) => {
    if (!currentUser?.userID || !leagueContext?.weekID) return;
    if (!silent) setLiveResultsLoading(true);
    setLiveResultsError("");
    try {
      setLiveResults(
        await getLiveResults(currentUser.userID, leagueContext.weekID),
      );
    } catch (error) {
      setLiveResultsError(error.message || "Live results could not be loaded.");
    } finally {
      if (!silent) setLiveResultsLoading(false);
    }
  }, [currentUser?.userID, leagueContext?.weekID]);
  useEffect(() => {
    if (!authenticated || page !== "live") return undefined;
    loadLiveResults();
    const refreshTimer = window.setInterval(() => {
      loadLiveResults({ silent: true });
    }, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [authenticated, page, loadLiveResults]);
  async function handleSubmitWeek() {
    if (!currentUser?.userID || !leagueContext?.weekID) return;
    setSubmittingWeek(true);
    setSubmissionError("");
    try {
      await submitWeekEntry(
        currentUser.userID,
        leagueContext.weekID,
        tieBreakerGuess,
      );
      setSubmitted(true);
      setRequiresResubmit(false);
      setShowSubmit(false);
      setLeagueContext(await getDashboardSummary());
    } catch (error) {
      setSubmissionError(error.message || "Week picks could not be submitted.");
    } finally {
      setSubmittingWeek(false);
    }
  }
  async function handleGameOfWeekChange(gameId) {
    setUpdatingGameOfWeek(true);
    setGamesError("");
    try {
      await setGameOfWeek(gameId);
      setGames((currentGames) =>
        currentGames.map((game) => ({
          ...game,
          isGameOfWeek: game.gameID === gameId,
        })),
      );
    } catch (error) {
      setGamesError(error.message || "Game of the Week could not be updated.");
    } finally {
      setUpdatingGameOfWeek(false);
    }
  }
  async function handlePick(game, side) {
    if (!currentUser?.userID) {
      return;
    }
    const selectedTeamID = side === "away" ? game.awayTeamID : game.homeTeamID;
    const previousSelection = picks[game.id];
    setPicks((current) => ({ ...current, [game.id]: side }));
    setGamesError("");
    try {
      await submitPick(currentUser.userID, game.gameID, selectedTeamID);
      if (submitted && previousSelection !== side) {
        setRequiresResubmit(true);
      }
    } catch (error) {
      setPicks((current) => {
        const restored = { ...current };
        if (previousSelection) {
          restored[game.id] = previousSelection;
        } else {
          delete restored[game.id];
        }
        return restored;
      });
      setGamesError(error.message || "The pick could not be saved.");
    }
  }
  const isCommissioner = currentUser?.roleID === 1;
  const commissionerPages = [
    "admin",
    "schedule",
    "simulation",
    "players",
    "audit",
  ];
  useEffect(() => {
    if (authenticated && !isCommissioner && commissionerPages.includes(page)) {
      setPage("picks");
    }
  }, [authenticated, isCommissioner, page]);
  if (restoringSession) return null;
  if (authenticated && !isCommissioner && commissionerPages.includes(page)) {
    return null;
  }
  if (authenticated && currentUser?.mustChangePassword) {
    return (
      <ForcePasswordChangeScreen
        currentUser={currentUser}
        onComplete={() => {
          const updated = { ...currentUser, mustChangePassword: false };
          saveUserSession(
            updated,
            Boolean(localStorage.getItem("proPickEm.rememberedUser")),
          );
          setCurrentUser(updated);
          setPage("picks");
        }}
      />
    );
  }
  if (!authenticated) {
    return (
      <SplashScreen
        mode={authMode}
        setMode={setAuthMode}
        leagueContext={leagueContext}
        onLogin={async (user, rememberMe) => {
          const profile = await getUserProfile(user.userID);
          const authenticatedUser = { ...user, ...profile };
          saveUserSession(authenticatedUser, rememberMe);
          setCurrentUser(authenticatedUser);
          setPage(profile.isProfileComplete ? "picks" : "profile");
          setAuthenticated(true);
        }}
      />
    );
  }
  const screen = {
    picks: (
      <PicksScreen
        games={games}
        picks={picks}
        submitted={submitted}
        requiresResubmit={requiresResubmit}
        onSubmit={() => setShowSubmit(true)}
        onPick={handlePick}
        loading={gamesLoading}
        error={gamesError || leagueContextError}
        seasonYear={leagueContext?.seasonYear}
        weekNumber={leagueContext?.weekNumber}
        tieBreakerRequired={tieBreakerRequired}
        tieBreakerQuestion={tieBreakerQuestion}
        tieBreakerGuess={tieBreakerGuess}
        tieBreakerLocked={tieBreakerLocked}
        tieBreakerLockAtUtc={tieBreakerLockAtUtc}
        onTieBreakerGuessChange={(value) => {
          setTieBreakerGuess(value);
          if (submitted) {
            setRequiresResubmit(true);
          }
        }}
      />
    ),
    distribution: <DistributionScreen distribution={distribution} loading={distributionLoading} error={distributionError} />,
    comments: <CommentsScreen currentUser={currentUser} />,
    live: (
      <LiveResultsScreen
        results={liveResults}
        loading={liveResultsLoading}
        error={liveResultsError}
        onRefresh={loadLiveResults}
        weekNumber={leagueContext?.weekNumber}
      />
    ),
    results: (
      <WeeklyResultsScreen
        results={weeklyResults}
        loading={weeklyResultsLoading}
        error={weeklyResultsError}
        weekNumber={leagueContext?.weekNumber}
      />
    ),
    leaderboard: (
      <LeaderboardScreen
        standings={standings}
        currentUser={currentUser}
        loading={standingsLoading}
        error={standingsError}
      />
    ),
    profile: (
      <ProfileScreen
        currentUser={currentUser}
        onProfileSaved={(profile) => {
          setCurrentUser((user) => ({ ...user, ...profile }));
        }}
      />
    ),
    admin: isCommissioner ? (
      <AdminScreen
        setPage={setPage}
        dashboard={leagueContext}
        loading={dashboardLoading}
        error={leagueContextError}
      />
    ) : null,
    simulation: isCommissioner ? (
      <SimulationCenter
        currentUser={currentUser}
        weekId={leagueContext?.weekID}
        weekNumber={leagueContext?.weekNumber}
        onWeekReset={async () => {
          if (!currentUser?.userID || !leagueContext?.weekID) {
            return;
          }

          const loadedGames = await getGamesByWeek(leagueContext.weekID);

          const savedPicks = await getPicksByWeek(
            currentUser.userID,
            leagueContext.weekID,
          );

          const entryStatus = await getWeekEntryStatus(
            currentUser.userID,
            leagueContext.weekID,
          );

          const restoredPicks = {};

          savedPicks.forEach((pick) => {
            restoredPicks[pick.gameID] =
              pick.selectedTeamID === pick.awayTeamID ? "away" : "home";
          });

          setGames(loadedGames.map(normalizeApiGame));
          setPicks(restoredPicks);

          setSubmitted(entryStatus.entryStatus === "Submitted");

          setRequiresResubmit(false);

          setTieBreakerGuess(
            entryStatus.tieBreakerGuess == null
              ? ""
              : String(entryStatus.tieBreakerGuess),
          );
        }}
      />
    ) : null,
    schedule: isCommissioner ? (
      <ScheduleScreen
        games={games}
        onGameOfWeekChange={handleGameOfWeekChange}
        updatingGameOfWeek={updatingGameOfWeek}
      />
    ) : null,
    players: isCommissioner ? (
      <PlayerApprovalsScreen currentUser={currentUser} />
    ) : null,
    audit: isCommissioner ? <AuditScreen /> : null,
  }[page];
  return (
    <ApplicationShell
      page={page}
      setPage={setPage}
      screen={screen}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentUser={currentUser}
      showSubmit={showSubmit}
      setShowSubmit={setShowSubmit}
      setSubmitted={setSubmitted}
      weekNumber={leagueContext?.weekNumber}
      onConfirmSubmit={handleSubmitWeek}
      submittingWeek={submittingWeek}
      submissionError={submissionError}
      onSignOut={() => {
        clearUserSession();
        setAuthenticated(false);
        setCurrentUser(null);
        setGames([]);
        setPicks({});
        setSubmitted(false);
        setRequiresResubmit(false);
        setTieBreakerRequired(false);
        setTieBreakerQuestion("");
        setTieBreakerGuess("");
        setTieBreakerLocked(false);
        setTieBreakerLockAtUtc(null);
        setStandings([]);
        setWeeklyResults(null);
        setLiveResults(null);
        setDistribution([]);
        setDistributionError("");
        setPage("picks");
      }}
    />
  );
}

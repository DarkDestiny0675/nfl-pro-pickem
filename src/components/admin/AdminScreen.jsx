import {
  Activity,
  CalendarDays,
  ChevronRight,
  History,
  Plus,
  TestTube2,
  Users,
} from "lucide-react";
import StatCard from "../common/StatCard";
import "./AdminScreen.css";

const CENTRAL_TIME_ZONE = "America/Chicago";

function zone(value){return new Intl.DateTimeFormat("en-US",{timeZone:CENTRAL_TIME_ZONE,timeZoneName:"short"}).formatToParts(new Date(value)).find(x=>x.type==="timeZoneName")?.value||"CT";}
function formatNextLock(value) {
  if (!value) return "No remaining locks";
  const lock = new Date(value);
  const day = lock.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: CENTRAL_TIME_ZONE,
  });
  const time = lock.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CENTRAL_TIME_ZONE,
  });
  return `${day} at ${time} ${zone(value)}`;
}

function matchupDay(value) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: CENTRAL_TIME_ZONE,
  });
}

export default function AdminScreen({ setPage, dashboard, loading, error }) {
  const players = dashboard?.players ?? 0;
  const submitted = dashboard?.submitted ?? 0;
  const inProgress = dashboard?.inProgress ?? 0;
  const notStarted = dashboard?.notStarted ?? 0;
  const didNotSubmit = dashboard?.didNotSubmit ?? 0;
  const completion = dashboard?.completionPercent ?? 0;
  const openGames = dashboard?.openGames ?? 0;
  const nextLockText = formatNextLock(dashboard?.nextLockAtUtc);
  const matchups = dashboard?.matchups ?? [];const attentionDetail=(dashboard?.pendingScheduleItems??0)>0?`${dashboard.pendingScheduleItems} schedule item${dashboard.pendingScheduleItems===1?"":"s"}`:didNotSubmit>0?`${didNotSubmit} player${didNotSubmit===1?"":"s"} did not submit`:"No items need attention";

  return (
    <>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">Commissioner Center</span>
          <h1>League Dashboard</h1>
          <p>Monitor participation and manage the current week.</p>
        </div>
        <button className="primary-button" onClick={() => setPage("schedule")}>
          <Plus size={18} /> Add Matchup
        </button>
      </div>
      {loading && <div className="notice">Loading league dashboard...</div>}
      {error && <div className="notice purple">{error}</div>}
      {!loading && !error && (
        <>
          <div className="stat-grid">
            <StatCard
              label="Active Players"
              value={players}
              detail={`${players} eligible this week`}
            />
            <StatCard
              label="Fully Submitted"
              value={submitted}
              detail={`${completion}% completion`}
              tone="green"
            />
            <StatCard
              label="Open Matchups"
              value={openGames}
              detail={dashboard?.nextLockAtUtc ? `Next lock ${nextLockText}` : "All matchups locked"}
              tone="purple"
            />
            <StatCard
              label="Needs Attention"
              value={dashboard?.needsAttention ?? 0}
              detail={attentionDetail}
              tone="gold"
            />
          </div>
          <div className="admin-grid">
            <section className="panel span-two">
              <div className="panel-heading">
                <div>
                  <h2>Submission Progress</h2>
                  <p>Week {dashboard?.weekNumber ?? 1} player readiness</p>
                </div>
                <strong>{completion}%</strong>
              </div>
              <div className="large-progress">
                <div style={{ width: `${completion}%` }} />
              </div>
              <div className="submission-legend">
                <span><i className="green-dot" />{submitted} complete</span>
                <span><i className="blue-dot" />{inProgress} in progress</span>
                <span><i className="gray-dot" />{notStarted} not started</span>
                {didNotSubmit > 0 && <span>{didNotSubmit} did not submit</span>}
              </div>
              <div className="admin-callout">
                <Activity size={20} />
                <span>
                  <strong>
                    {submitted === players
                      ? "Every eligible player has submitted."
                      : `${Math.max(0,players-submitted)} ${Math.max(0,players-submitted)===1?"player has":"players have"} not submitted.`}
                  </strong>{" "}
                  {dashboard?.nextLockAtUtc
                    ? `The next deadline is ${nextLockText}.`
                    : "There are no remaining lock deadlines this week."}
                </span>
              </div>
            </section>
            <QuickActions setPage={setPage} />
            <section className="panel span-three">
              <div className="panel-heading">
                <h2>Current Week Matchups</h2>
                <button className="secondary-button" onClick={() => setPage("schedule")}>
                  View Schedule
                </button>
              </div>
              <div className="compact-games">
                {matchups.map((game) => (
                  <div key={game.gameID}>
                    <span>{matchupDay(game.kickoffAtUtc)}</span>
                    <strong>{game.awayTeamCode} <small>at</small> {game.homeTeamCode}</strong>
                    <span className={`status-dot ${game.isLocked ? "locked" : "open"}`}>
                      {game.isLocked ? "locked" : "open"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function QuickActions({ setPage }) {
  const actions = [
    ["schedule", CalendarDays, "Manage Schedule", "Add games and update kickoff times"],
    ["simulation", TestTube2, "Simulation Center", "Test games, scoring, and week finalization"],
    ["players", Users, "Manage Players", "Roles, status, and access"],
    ["audit", History, "View Audit History", "Review tracked changes"],
  ];
  return (
    <section className="panel">
      <div className="panel-heading"><h2>Quick Actions</h2></div>
      {actions.map(([page, Icon, title, detail]) => (
        <button className="action-row" key={page} onClick={() => setPage(page)}>
          <Icon />
          <span><strong>{title}</strong><small>{detail}</small></span>
          <ChevronRight />
        </button>
      ))}
    </section>
  );
}

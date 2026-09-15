import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Gamepad2,
  History,
  LayoutDashboard,
  LogOut,
  Medal,
  Menu,
  MessageSquare,
  Moon,
  Radio,
  TestTube2,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import Modal from "../common/Modal";

const playerNavItems = [
  { id: "picks", label: "Make Picks", icon: ClipboardCheck },
  { id: "distribution", label: "Pick Distribution", icon: BarChart3 },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "live", label: "Live Results", icon: Radio },
  { id: "results", label: "Weekly Results", icon: Trophy },
  { id: "leaderboard", label: "Leaderboard", icon: Medal },
  { id: "profile", label: "My Profile", icon: UserCircle2 },
];
const commissionerNavItems = [
  { id: "admin", label: "Commissioner", icon: LayoutDashboard },
  { id: "schedule", label: "Manage Schedule", icon: CalendarDays },
  { id: "simulation", label: "Simulation Center", icon: TestTube2 },
  { id: "players", label: "Player Approvals", icon: Users },
  { id: "audit", label: "Audit History", icon: History },
];

export default function ApplicationShell({
  page,
  setPage,
  screen,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onSignOut,
  showSubmit,
  setShowSubmit,
  setSubmitted,
  weekNumber = 1,
  onConfirmSubmit,
  submittingWeek = false,
  submissionError = "",
}) {
  const isCommissioner = currentUser?.roleID === 1;
  const navItems = isCommissioner
    ? [...playerNavItems, ...commissionerNavItems]
    : playerNavItems;
  const title =
    navItems.find((item) => item.id === page)?.label ?? "Pro Pick Em";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand-lockup">
          <span>
            <Gamepad2 />
          </span>
          <div>
            <strong>PRO PICK 'EM</strong>
            <small>2026 Season</small>
          </div>
        </div>
        <nav>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {isCommissioner && index === playerNavItems.length && (
                  <span className="nav-section">Commissioner</span>
                )}
                <button
                  className={page === item.id ? "active" : ""}
                  onClick={() => {
                    setPage(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {page === item.id && <ChevronRight size={16} />}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={onSignOut}>
            <LogOut size={19} /> Sign Out
          </button>
          <small>Concept Build 1.0</small>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>
          <div>
            <span>Pro Pick 'Em</span>
            <strong>{title}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button">
              <Moon size={19} />
            </button>
            <button className="user-menu">
              <span className="avatar">
                {currentUser?.displayName?.substring(0, 2) ?? "??"}
              </span>

              <span>
                <strong>{currentUser?.displayName ?? "Unknown User"}</strong>

                <small>
                  {currentUser?.roleID === 1
                    ? "Commissioner"
                    : currentUser?.roleID === 2
                      ? "Co-Commissioner"
                      : "Player"}
                </small>
              </span>
            </button>
          </div>
        </header>
        <main>{screen}</main>
      </div>
      {sidebarOpen && (
        <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />
      )}
      {showSubmit && (
        <Modal
          title={`Submit Week ${weekNumber} Picks?`}
          onClose={() => setShowSubmit(false)}
          actions={
            <div className="submission-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setShowSubmit(false)}
              >
                Keep Reviewing
              </button>
              <button
                className="primary-button"
                disabled={submittingWeek}
                onClick={onConfirmSubmit}
              >
                <Check size={18} />{" "}
                {submittingWeek ? "Submitting..." : "Submit Picks"}
              </button>
            </div>
          }
        >
          {submissionError && (
            <div className="notice purple">{submissionError}</div>
          )}
          <div className="confirmation-graphic">
            <ClipboardCheck size={40} />
          </div>
          <p>
            Your selections will be marked as submitted. You will still be able
            to update picks for matchups that have not reached their lock time.
          </p>
        </Modal>
      )}
    </div>
  );
}

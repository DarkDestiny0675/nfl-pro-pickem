import { useEffect, useMemo, useState } from "react";
import {
  Check,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  activateUser,
  approveUser,
  changeUserRole,
  commissionerResetPassword,
  deactivateUser,
  deleteUser,
  getUsers,
  rejectUser,
} from "../../services/userService";
import ConfirmModal from "../common/ConfirmModal";
import HelmetImage from "../common/HelmetImage";
import useTeamNames from "../../hooks/useTeamNames";
import "./PlayerApprovalsScreen.css";

export default function PlayerApprovalsScreen({ currentUser }) {
  const teamNames = useTeamNames();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setMessage("");
    try {
      setUsers(await getUsers());
    } catch (error) {
      setMessage(error.message || "Players could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const counts = useMemo(
    () => ({
      pending: users.filter((user) => user.approvalStatus === "Pending").length,
      approved: users.filter((user) => user.approvalStatus === "Approved").length,
      rejected: users.filter((user) => user.approvalStatus === "Rejected").length,
    }),
    [users],
  );

  const visibleUsers = useMemo(() => {
    const value = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesStatus = filter === "All" || user.approvalStatus === filter;
      const matchesSearch =
        !value ||
        `${user.displayName} ${user.email}`.toLowerCase().includes(value);
      return matchesStatus && matchesSearch;
    });
  }, [users, filter, search]);

  async function runAction(action, successMessage) {
    setLoading(true);
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || "The player could not be updated.");
      setLoading(false);
    }
  }

  async function resetPlayerPassword(user) {
    setLoading(true);
    setTemporaryPassword(null);
    try {
      const result = await commissionerResetPassword(
        user.userID,
        currentUser.userID,
      );
      setTemporaryPassword({
        name: user.displayName,
        value: result.temporaryPassword,
      });
    } catch (error) {
      setMessage(error.message || "The password could not be reset.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    await runAction(
      () => deleteUser(target.userID, currentUser.userID),
      `${target.displayName} was deleted.`,
    );
  }

  return (
    <>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">Commissioner Center</span>
          <h1>Player Approvals</h1>
          <p>Review new registrations and control league access.</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="approval-summary-grid">
        <Summary label="Pending" value={counts.pending} tone="gold" icon={ShieldCheck} />
        <Summary label="Approved" value={counts.approved} tone="green" icon={UserCheck} />
        <Summary label="Rejected" value={counts.rejected} tone="red" icon={UserX} />
      </div>

      <section className="panel approval-panel">
        <div className="approval-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
            />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {message && <div className="approval-message">{message}</div>}
        {temporaryPassword && (
          <div className="temporary-password-panel">
            <strong>Temporary Password for {temporaryPassword.name}</strong>
            <code>{temporaryPassword.value}</code>
            <span>Share this privately. The player must change it at next login.</span>
          </div>
        )}
        {loading && <div className="approval-message">Loading players...</div>}

        <div className="approval-list">
          {visibleUsers.map((user) => {
            const isCurrentCommissioner = user.userID === currentUser?.userID;
            return (
              <article className="approval-row" key={user.userID}>
                <div className="approval-player">
                  <span className="avatar">
                    <HelmetImage
                      teamName={teamNames[user.favoriteTeamID]}
                      side="home"
                      size={38}
                      fallback={user.displayName.substring(0, 2).toUpperCase()}
                    />
                  </span>
                  <span>
                    <strong>{user.displayName}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>

                <span className={`approval-status ${user.approvalStatus.toLowerCase()}`}>
                  {user.approvalStatus}
                </span>

                <select
                  value={user.roleID}
                  disabled={loading || isCurrentCommissioner}
                  onChange={(event) =>
                    runAction(
                      () =>
                        changeUserRole(
                          user.userID,
                          Number(event.target.value),
                          currentUser.userID,
                        ),
                      `${user.displayName}'s role was updated.`,
                    )
                  }
                >
                  <option value={1}>Commissioner</option>
                  <option value={2}>Co-Commissioner</option>
                  <option value={3}>Player</option>
                </select>

                <div className="approval-actions">
                  {user.approvalStatus !== "Approved" && (
                    <button
                      className="approve-button"
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        runAction(
                          () => approveUser(user.userID, currentUser.userID),
                          `${user.displayName} was approved.`,
                        )
                      }
                    >
                      <Check size={16} /> Approve
                    </button>
                  )}
                  {user.approvalStatus !== "Rejected" && !isCurrentCommissioner && (
                    <button
                      className="reject-button"
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        runAction(
                          () => rejectUser(user.userID, currentUser.userID),
                          `${user.displayName} was rejected.`,
                        )
                      }
                    >
                      <UserX size={16} /> Reject
                    </button>
                  )}
                  {user.approvalStatus === "Approved" && !isCurrentCommissioner && (
                    <button
                      className="secondary-button small"
                      type="button"
                      disabled={loading}
                      onClick={() => resetPlayerPassword(user)}
                    >
                      <KeyRound size={15} /> Reset Password
                    </button>
                  )}
                  {user.approvalStatus === "Approved" && !isCurrentCommissioner && (
                    <button
                      className="secondary-button small"
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        runAction(
                          () =>
                            user.isActive
                              ? deactivateUser(user.userID)
                              : activateUser(user.userID),
                          `${user.displayName} was ${
                            user.isActive ? "deactivated" : "activated"
                          }.`,
                        )
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  {!isCurrentCommissioner && user.roleID !== 1 && (
                    <button
                      className="delete-user-button"
                      type="button"
                      disabled={loading}
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {!loading && visibleUsers.length === 0 && (
            <div className="approval-empty">No players match this view.</div>
          )}
        </div>
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Player Account"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.displayName}? This permanently removes the account and its league data.`
            : ""
        }
        confirmLabel="Delete Player"
        busy={loading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function Summary({ label, value, tone, icon: Icon }) {
  return (
    <article className={`approval-summary ${tone}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

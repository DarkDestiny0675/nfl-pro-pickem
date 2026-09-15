import { Medal } from "lucide-react";
import HelmetImage from "../common/HelmetImage";
import useTeamNames from "../../hooks/useTeamNames";

export default function SeasonLeadersCard({ leaders = [], weekNumber = 1 }) {
  const teamNames = useTeamNames();
  const safeLeaders = Array.isArray(leaders) ? leaders : [];
  return (
    <article className="splash-card season-leaders-card">
      <div className="splash-card-heading">
        <Medal size={28} />
        <strong>Season Leaders</strong>
        <span>Week {weekNumber}</span>
      </div>
      <div className="splash-leader-list">
        {safeLeaders.length === 0 && (
          <div className="splash-leader-row">
            <span className="leader-rank">1</span>
            <span className="avatar">NFL</span>
            <strong>No eligible players</strong>
            <b>0</b>
            <small>PTS</small>
          </div>
        )}
        {safeLeaders.slice(0, 5).map((player, index) => (
          <div
            className="splash-leader-row"
            key={player.userID ?? `leader-${index}`}
          >
            <span className="leader-rank">{player.rank ?? index + 1}</span>
            <span className="avatar">
              <HelmetImage
                teamName={teamNames[player.favoriteTeamID]}
                side="home"
                size={32}
                fallback={
                  player.displayName?.slice(0, 2).toUpperCase() ?? "NFL"
                }
              />
            </span>
            <strong>{player.displayName ?? "League Player"}</strong>
            <b>{player.points ?? 0}</b>
            <small>PTS</small>
          </div>
        ))}
      </div>
    </article>
  );
}

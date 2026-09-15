import {
  CalendarDays,
  Check,
  Clock3,
  Gamepad2,
  Lock,
  Users,
} from "lucide-react";
const DISPLAY_TIME_ZONE = "America/Chicago";
function formatNextLock(value) {
  if (!value) return "No upcoming lock";
  const utcValue = value.endsWith("Z") ? value : `${value}Z`;
  return new Date(utcValue).toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
    timeZoneName: "short",
  });
}
export default function ThisWeekCard({ summary }) {
  const weekNumber = summary?.weekNumber ?? 1;
  return (
    <article className="splash-card this-week-card">
      <div className="splash-card-heading">
        <CalendarDays size={28} />
        <strong>This Week</strong>
        <span>Week {weekNumber}</span>
      </div>
      <div className="week-stat-grid">
        <WeekStat
          icon={<Gamepad2 size={30} />}
          value={summary?.games ?? 0}
          label="Games"
        />
        <WeekStat
          icon={<Users size={30} />}
          value={summary?.players ?? 0}
          label="Players"
        />
        <WeekStat
          icon={<Check size={30} />}
          value={summary?.submitted ?? 0}
          label="Submitted"
          tone="green-stat"
        />
        <WeekStat
          icon={<Clock3 size={30} />}
          value={summary?.pending ?? 0}
          label="Pending"
          tone="gold-stat"
        />
        {(summary?.didNotSubmit ?? 0) > 0 && (
          <WeekStat
            icon={<Lock size={30} />}
            value={summary.didNotSubmit}
            label="Did Not Submit"
            tone="red-stat"
          />
        )}
      </div>
      <div className="next-lock-panel">
        <Lock size={22} />
        <div>
          <span>Next Lock</span>
          <strong>{formatNextLock(summary?.nextLockAtUtc)}</strong>
          <small>Picks lock one hour before kickoff</small>
        </div>
      </div>
    </article>
  );
}
function WeekStat({ icon, value, label, tone = "" }) {
  return (
    <div className={tone}>
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

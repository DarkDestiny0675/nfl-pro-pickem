import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getGameOfWeek } from "../../services/gameService";
import HelmetImage from "../common/HelmetImage";

const DISPLAY_TIME_ZONE = "America/Chicago";

const fallbackGame = {
  day: "Sunday",
  time: "TBD",
  awayPercent: 0,
  homePercent: 0,
  away: {
    id: 0,
    city: "Away",
    name: "Team",
    fullName: "Away Team",
    short: "AWY",
  },
  home: {
    id: 0,
    city: "Home",
    name: "Team",
    fullName: "Home Team",
    short: "HME",
  },
};

function createTeam(fullName, teamID) {
  const safeName = fullName || "Unknown Team";
  const nameParts = safeName.split(" ");
  return {
    id: teamID,
    city: nameParts.slice(0, -1).join(" "),
    name: nameParts.slice(-1).join(" "),
    fullName: safeName,
    short: safeName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase(),
  };
}

function mapGameOfWeek(result) {
  if (!result || !result.kickoffAtUtc) return fallbackGame;

  const kickoffValue = result.kickoffAtUtc.endsWith("Z")
    ? result.kickoffAtUtc
    : `${result.kickoffAtUtc}Z`;

  const kickoff = new Date(kickoffValue);

  return {
    day: kickoff.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: DISPLAY_TIME_ZONE,
    }),
    time: kickoff.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: DISPLAY_TIME_ZONE,
    }),
    awayPercent: result.awayPercent ?? 0,
    homePercent: result.homePercent ?? 0,timeZoneName:kickoff.toLocaleTimeString("en-US",{timeZone:DISPLAY_TIME_ZONE,timeZoneName:"short"}).split(" ").pop(),
    away: createTeam(result.awayTeam, result.awayTeamID),
    home: createTeam(result.homeTeam, result.homeTeamID),
  };
}

export default function GameOfWeekCard({ weekId, game }) {
  const [selectedGame, setSelectedGame] = useState(game || fallbackGame);

  useEffect(() => {
    async function loadSelectedGame() {
      try {
        if (!weekId) {
          setSelectedGame(game || fallbackGame);
          return;
        }
        const result = await getGameOfWeek(weekId);
        setSelectedGame(mapGameOfWeek(result));
      } catch {
        setSelectedGame(game || fallbackGame);
      }
    }

    loadSelectedGame();
  }, [weekId, game]);

  const activeGame = selectedGame || fallbackGame;

  return (
    <article className="splash-card game-of-week-card">
      <div className="splash-card-heading centered-heading">
        <Activity size={28} />
        <div>
          <strong>Game Of The Week</strong>
          <span>
            {activeGame.day} • {activeGame.time} {activeGame.timeZoneName||"CT"}
          </span>
        </div>
      </div>

      <div className="featured-matchup">
        <FeaturedTeam
          team={activeGame.away}
          percentage={activeGame.awayPercent}
          side="away"
        />
        <div className="featured-versus">VS</div>
        <FeaturedTeam
          team={activeGame.home}
          percentage={activeGame.homePercent}
          side="home"
        />
      </div>

      <div className="pick-percentage-bar">
        <div
          className="away-percentage"
          style={{ width: `${activeGame.awayPercent}%` }}
        />
        <div
          className="home-percentage"
          style={{ width: `${activeGame.homePercent}%` }}
        />
      </div>

      <small className="percentage-caption">
        Percentage of submitted picks
      </small>
    </article>
  );
}

function FeaturedTeam({ team, percentage, side }) {
  const teamName =
    team?.fullName || `${team?.city || ""} ${team?.name || ""}`.trim();

  return (
    <div className="featured-team">
      <div className="featured-helmet">
        <HelmetImage
          teamName={teamName}
          side={side}
          size={172}
          fallback={team?.short || "NFL"}
        />
      </div>
      <small>{team?.city}</small>
      <strong>{team?.name}</strong>
      <b>{percentage}%</b>
      <em>of picks</em>
    </div>
  );
}

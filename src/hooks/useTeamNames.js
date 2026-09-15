import { useEffect, useMemo, useState } from "react";
import { getRegistrationTeams } from "../services/registrationService";

export default function useTeamNames() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    getRegistrationTeams().then(setTeams).catch(() => setTeams([]));
  }, []);
  return useMemo(() => {
    const names = {};
    teams.forEach((team) => { names[team.teamID] = team.teamName; });
    return names;
  }, [teams]);
}

import { apiFetch } from "./api";

export async function getSeasonStandings(seasonId) {
  return apiFetch(`/seasons/${seasonId}/standings`);
}

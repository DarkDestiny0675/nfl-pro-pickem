import { apiFetch } from "./api";

export async function getTeamsDropdown() {
  return apiFetch("/teams/dropdown");
}

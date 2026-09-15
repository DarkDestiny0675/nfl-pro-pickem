import { apiFetch } from "./api";
export function getRegistrationTeams() {
  return apiFetch("/registration-options/teams");
}

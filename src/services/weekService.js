import { apiFetch } from "./api";
export function getWeeks(){return apiFetch("/weeks");}

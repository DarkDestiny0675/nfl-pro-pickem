import { apiFetch } from "./api";
export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function register(account) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...account, roleID: 3 }),
  });
}
export function getSecurityQuestion(email) {
  return apiFetch("/password-recovery/question", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
export function verifySecurityAnswer(email, answer) {
  return apiFetch("/password-recovery/verify", {
    method: "POST",
    body: JSON.stringify({ email, answer }),
  });
}
export function resetPassword(email, resetToken, newPassword) {
  return apiFetch("/password-recovery/reset", {
    method: "POST",
    body: JSON.stringify({ email, resetToken, newPassword }),
  });
}
export function changeTemporaryPassword(
  userID,
  temporaryPassword,
  newPassword,
) {
  return apiFetch("/password-recovery/change-temporary", {
    method: "POST",
    body: JSON.stringify({ userID, temporaryPassword, newPassword }),
  });
}

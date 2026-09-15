import { apiFetch } from "./api";

export function getUsers() {
  return apiFetch("/users");
}

export function getUserProfile(userID) {
  return apiFetch(`/profile/${userID}`);
}

export function updateUserProfile(userID, profile) {
  return apiFetch(`/profile/${userID}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function approveUser(userID, approvedByUserID) {
  return apiFetch("/users/approve", {
    method: "POST",
    body: JSON.stringify({ userID, approvedByUserID }),
  });
}

export function rejectUser(userID, changedByUserID) {
  return apiFetch("/users/reject", {
    method: "POST",
    body: JSON.stringify({ userID, changedByUserID }),
  });
}

export function activateUser(userID) {
  return apiFetch("/users/activate", {
    method: "POST",
    body: JSON.stringify({ userID }),
  });
}

export function deactivateUser(userID) {
  return apiFetch("/users/deactivate", {
    method: "POST",
    body: JSON.stringify({ userID }),
  });
}

export function changeUserRole(userID, newRoleID, changedByUserID) {
  return apiFetch("/users/change-role", {
    method: "POST",
    body: JSON.stringify({ userID, newRoleID, changedByUserID }),
  });
}

export function commissionerResetPassword(userID, commissionerUserID) {
  return apiFetch("/password-recovery/commissioner-reset", {
    method: "POST",
    body: JSON.stringify({ userID, commissionerUserID }),
  });
}

export function deleteUser(userID, commissionerUserID) {
  return apiFetch(`/user-deletion/${userID}/by/${commissionerUserID}`, {
    method: "DELETE",
  });
}

import { apiFetch } from "./api";

export function getComments() {
  return apiFetch("/comments");
}

export function createComment(userID, commentText) {
  return apiFetch("/comments", {
    method: "POST",
    body: JSON.stringify({ userID, commentText }),
  });
}

export function updateComment(commentID, actingUserID, commentText) {
  return apiFetch(`/comments/${commentID}`, {
    method: "PUT",
    body: JSON.stringify({ actingUserID, commentText }),
  });
}

export function deleteComment(commentID, actingUserID) {
  return apiFetch(`/comments/${commentID}`, {
    method: "DELETE",
    body: JSON.stringify({ actingUserID }),
  });
}

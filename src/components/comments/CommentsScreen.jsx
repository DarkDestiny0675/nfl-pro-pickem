import { useEffect, useState } from "react";
import { Edit3, MessageSquare, Send, Trash2, X } from "lucide-react";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../../services/commentsService";
import ConfirmModal from "../common/ConfirmModal";
import "./CommentsScreen.css";

const MAX_LENGTH = 1000;

function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value)) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommentsScreen({ currentUser }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingID, setEditingID] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteTargetID, setDeleteTargetID] = useState(null);

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      setComments(await getComments());
    } catch (loadError) {
      setError(loadError.message || "Comments could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function handlePost(event) {
    event.preventDefault();
    if (!commentText.trim() || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createComment(currentUser.userID, commentText.trim());
      setCommentText("");
      setMessage("Comment posted.");
      await loadComments();
    } catch (saveError) {
      setError(saveError.message || "Comment could not be posted.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(commentID) {
    if (!editingText.trim() || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateComment(commentID, currentUser.userID, editingText.trim());
      setEditingID(null);
      setEditingText("");
      setMessage("Comment updated.");
      await loadComments();
    } catch (saveError) {
      setError(saveError.message || "Comment could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(){if(!deleteTargetID)return;setSaving(true);setError("");setMessage("");try{await deleteComment(deleteTargetID,currentUser.userID);setDeleteTargetID(null);setMessage("Comment deleted.");await loadComments();}catch(deleteError){setError(deleteError.message||"Comment could not be deleted.");}finally{setSaving(false);}}

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">League Community</span>
        <h1>Comments</h1>
        <p>Talk picks, games, and everything happening across the league.</p>
      </div>

      <form className="panel comment-composer" onSubmit={handlePost}>
        <div className="comment-composer-heading">
          <MessageSquare size={22} />
          <div>
            <strong>Post a comment</strong>
            <span>Everyone in the league can see this conversation.</span>
          </div>
        </div>
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="What do you want to say?"
          maxLength={MAX_LENGTH}
          rows={4}
          disabled={saving}
        />
        <div className="comment-composer-footer">
          <span>{commentText.length} / {MAX_LENGTH}</span>
          <button
            className="primary-button"
            type="submit"
            disabled={!commentText.trim() || saving}
          >
            <Send size={17} /> {saving ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {error && <div className="notice purple">{error}</div>}
      {message && <div className="notice">{message}</div>}

      <section className="comments-feed">
        {loading && <div className="panel comment-empty">Loading comments...</div>}
        {!loading && comments.length === 0 && (
          <div className="panel comment-empty">
            <MessageSquare size={34} />
            <strong>No comments yet</strong>
            <span>Start the league conversation.</span>
          </div>
        )}
        {!loading && comments.map((comment) => {
          const ownsComment = comment.userID === currentUser.userID;
          const mayDelete = ownsComment || currentUser.roleID === 1;
          const initials = comment.displayName?.substring(0, 2).toUpperCase() || "??";
          return (
            <article className="panel comment-card" key={comment.commentID}>
              <div className="comment-avatar">{initials}</div>
              <div className="comment-content">
                <div className="comment-meta">
                  <div>
                    <strong>{comment.displayName}</strong>
                    <span>
                      {relativeTime(comment.createdAtUtc)}
                      {comment.isEdited ? " · Edited" : ""}
                    </span>
                  </div>
                  {(ownsComment || mayDelete) && editingID !== comment.commentID && (
                    <div className="comment-actions">
                      {ownsComment && (
                        <button
                          type="button"
                          title="Edit comment"
                          onClick={() => {
                            setEditingID(comment.commentID);
                            setEditingText(comment.commentText);
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      {mayDelete && (
                        <button
                          className="delete"
                          type="button"
                          title="Delete comment"
                          onClick={() => setDeleteTargetID(comment.commentID)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {editingID === comment.commentID ? (
                  <div className="comment-editor">
                    <textarea
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      maxLength={MAX_LENGTH}
                      rows={4}
                      disabled={saving}
                    />
                    <div>
                      <button
                        className="secondary-button small"
                        type="button"
                        onClick={() => {
                          setEditingID(null);
                          setEditingText("");
                        }}
                      >
                        <X size={15} /> Cancel
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        disabled={!editingText.trim() || saving}
                        onClick={() => handleEdit(comment.commentID)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{comment.commentText}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>
      <ConfirmModal open={deleteTargetID!=null} title="Delete Comment" message="Are you sure you want to delete this comment? This action cannot be undone." confirmLabel="Delete Comment" busy={saving} onCancel={()=>setDeleteTargetID(null)} onConfirm={confirmDelete}/>
    </>
  );
}

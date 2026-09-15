import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import SecretField from "./SecretField";
import { changeTemporaryPassword } from "../../services/authService";
import "./ForcePasswordChangeScreen.css";

export default function ForcePasswordChangeScreen({ currentUser, onComplete }) {
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("The new passwords do not match.");
      return;
    }
    try {
      await changeTemporaryPassword(currentUser.userID, temporaryPassword, newPassword);
      onComplete();
    } catch (error) {
      setMessage(error.message || "The password could not be changed.");
    }
  }

  return <div className="forced-password-page"><form className="panel forced-password-card" onSubmit={submit}><LockKeyhole size={44} /><h1>Change Your Password</h1><p>A commissioner issued a temporary password. Create a private password before continuing.</p><SecretField label="Temporary Password" value={temporaryPassword} onChange={(e)=>setTemporaryPassword(e.target.value)} /><SecretField label="New Password" minLength={8} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} /><SecretField label="Confirm New Password" minLength={8} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />{message && <div className="notice purple">{message}</div>}<button className="primary-button">Save New Password</button></form></div>;
}

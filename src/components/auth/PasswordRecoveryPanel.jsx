import { KeyRound, Lock, ShieldAlert } from "lucide-react";
import SecretField from "./SecretField";
import { useEffect, useState } from "react";
import { getSecurityQuestion, resetPassword, verifySecurityAnswer } from "../../services/authService";
import "./PasswordRecoveryPanel.css";

export default function PasswordRecoveryPanel({ onReturn }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (step !== "complete") return undefined;
    const timer = window.setInterval(() => setCountdown((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        onReturn();
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [step, onReturn]);

  async function begin(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = await getSecurityQuestion(email);
      if (result.locked) setStep("locked");
      else { setQuestion(result.question); setStep("answer"); }
    } catch (error) { setMessage(error.message || "Password recovery could not be started."); }
    finally { setBusy(false); }
  }

  async function verify(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = await verifySecurityAnswer(email, answer);
      setToken(result.resetToken); setStep("reset");
    } catch (error) {
      if (error.data?.locked) setStep("locked");
      else {
        const remaining = error.data?.attemptsRemaining;
        setMessage(remaining == null ? error.message : `Incorrect answer. ${remaining} attempts remaining.`);
      }
    } finally { setBusy(false); }
  }

  async function finish(event) {
    event.preventDefault(); setMessage("");
    if (password !== confirmPassword) {
      setMessage("The passwords do not match. Please try again."); return;
    }
    setBusy(true);
    try { await resetPassword(email, token, password); setCountdown(5); setStep("complete"); }
    catch (error) { setMessage(error.message || "The password could not be reset."); }
    finally { setBusy(false); }
  }

  return <section className="splash-login-column"><div className="splash-login-card recovery-card">
    <KeyRound className="recovery-icon" size={38} /><h2>Password Recovery</h2>
    {step === "email" && <form onSubmit={begin}><p>Enter the email address for the account.</p><Field label="Email Address" type="email" placeholder="Enter your email" value={email} setValue={setEmail} /><button className="stadium-button" disabled={busy}>Continue</button></form>}
    {step === "answer" && <form onSubmit={verify}><label>Security Question<div className="recovery-question">{question}</div></label><SecretField label="Security Answer" placeholder="Enter your security answer" value={answer} onChange={(event)=>setAnswer(event.target.value)} /><button className="stadium-button" disabled={busy}>Verify Answer</button></form>}
    {step === "reset" && <form onSubmit={finish}><SecretField label="Enter Password" minLength={8} placeholder="Enter a new password" value={password} onChange={(event)=>setPassword(event.target.value)} /><SecretField label="Confirm Password" minLength={8} placeholder="Confirm your new password" value={confirmPassword} onChange={(event)=>setConfirmPassword(event.target.value)} /><button className="stadium-button" disabled={busy}>Reset Password</button></form>}
    {step === "locked" && <div className="recovery-lock"><ShieldAlert size={42} /><h3>Password Recovery Locked</h3><p>Self-service recovery was disabled after five unsuccessful attempts.</p><p>Please contact the league commissioner to have the password reset.</p></div>}
    {step === "complete" && <div className="recovery-lock success"><Lock size={42} /><h3>Password Updated Successfully</h3><p>Your password has been changed. Please sign in with the new password.</p><strong>Returning to Sign In in {countdown}...</strong></div>}
    {message && <div className="recovery-message">{message}</div>}
    {step !== "complete" && <button className="create-account-button" type="button" onClick={onReturn}>Return to Sign In</button>}
  </div></section>;
}

function Field({ label, type = "text", placeholder, value, setValue }) {
  return <label>{label}<input required type={type} minLength={type === "password" ? 8 : undefined} placeholder={placeholder} value={value} onChange={(event) => setValue(event.target.value)} /></label>;
}

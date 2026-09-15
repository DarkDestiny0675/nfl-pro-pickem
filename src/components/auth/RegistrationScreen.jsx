import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { register } from "../../services/authService";
import { getRegistrationTeams } from "../../services/registrationService";
import SecretField from "./SecretField";
import { securityQuestions } from "./securityQuestions";
import "./RegistrationScreen.css";

const emptyForm = {
  firstName: "", lastName: "", displayName: "", email: "",
  favoriteTeamID: "", password: "", confirmPassword: "",
  securityQuestionID: 1, securityAnswer: "",
};

export default function RegistrationScreen({ onReturn }) {
  const [form, setForm] = useState(emptyForm);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    if (countdown === null) return undefined;
    if (countdown === 0) { onReturn(); return undefined; }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, onReturn]);

  useEffect(() => {
    getRegistrationTeams()
      .then(setTeams)
      .catch(() => setMessage("NFL teams could not be loaded."));
  }, []);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage("The passwords do not match. Please try again.");
      return;
    }
    setBusy(true);
    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        favoriteTeamID: Number(form.favoriteTeamID),
        roleID: 3,
        securityQuestionID: Number(form.securityQuestionID),
        securityAnswer: form.securityAnswer,
      });
      setForm(emptyForm);
      setMessage(result.message || "Registration submitted for commissioner approval.");
      setCountdown(5);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        <button className="registration-back" type="button" onClick={onReturn}><ArrowLeft size={18} />Return to Sign In</button>
        <header className="registration-heading">
          <span className="registration-icon"><UserPlus size={28} /></span>
          <div><span>Join the League</span><h1>Create Your Account</h1><p>Complete the information below. A commissioner will approve access to the league.</p></div>
        </header>
        <form onSubmit={submit}>
          <section className="registration-section">
            <div className="registration-section-title"><strong>Player Information</strong><span>Tell the league who you are.</span></div>
            <div className="registration-grid">
              <Field label="First Name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
              <Field label="Last Name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              <Field label="Display Name" value={form.displayName} onChange={(e) => setField("displayName", e.target.value)} />
              <Field label="Email Address" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              <label className="registration-wide">Favorite Team<select required value={form.favoriteTeamID} onChange={(e) => setField("favoriteTeamID", e.target.value)}><option value="">Select your favorite NFL team</option>{teams.map((team) => <option value={team.teamID} key={team.teamID}>{team.teamName}</option>)}</select></label>
            </div>
          </section>
          <section className="registration-section">
            <div className="registration-section-title"><strong>Account Security</strong><span>Protect access to your picks and account.</span></div>
            <div className="registration-grid">
              <SecretField label="Password" minLength={8} placeholder="Enter your password" value={form.password} onChange={(e) => setField("password", e.target.value)} />
              <SecretField label="Confirm Password" minLength={8} placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />
              <label className="registration-wide">Security Question<select value={form.securityQuestionID} onChange={(e) => setField("securityQuestionID", e.target.value)}>{securityQuestions.map((question, index) => <option value={index + 1} key={question}>{question}</option>)}</select></label>
              <div className="registration-wide"><SecretField label="Security Answer" placeholder="Enter your private answer" value={form.securityAnswer} onChange={(e) => setField("securityAnswer", e.target.value)} /></div>
            </div>
          </section>
          {message && <div className={`registration-message ${isError ? "error" : "success"}`}>{message}{!isError && countdown !== null && <span>Returning to Sign In in {countdown}...</span>}</div>}
          <button className="registration-submit" type="submit" disabled={busy || teams.length === 0 || countdown !== null}><ShieldCheck size={20} />{busy ? "Creating Account..." : "Create Account"}</button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return <label>{label}<input required type={type} value={value} onChange={onChange} /></label>;
}

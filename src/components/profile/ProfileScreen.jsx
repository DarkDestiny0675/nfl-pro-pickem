import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import SecretField from "../auth/SecretField";
import HelmetImage from "../common/HelmetImage";
import { securityQuestions } from "../auth/securityQuestions";
import { getRegistrationTeams } from "../../services/registrationService";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import "./ProfileScreen.css";

const emptyForm = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  favoriteTeamID: "",
  securityQuestionID: 1,
  securityAnswer: "",
};

function initials(profile) {
  return (profile?.displayName || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleName(roleID) {
  if (roleID === 1) return "Commissioner";
  if (roleID === 2) return "Co-Commissioner";
  return "Player";
}

export default function ProfileScreen({ currentUser, onProfileSaved }) {
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [loadedProfile, loadedTeams] = await Promise.all([
          getUserProfile(currentUser.userID),
          getRegistrationTeams(),
        ]);
        setProfile(loadedProfile);
        setTeams(Array.isArray(loadedTeams) ? loadedTeams : []);
        setForm({
          firstName: loadedProfile.firstName || "",
          lastName: loadedProfile.lastName || "",
          displayName: loadedProfile.displayName || "",
          email: loadedProfile.email || "",
          favoriteTeamID: loadedProfile.favoriteTeamID || "",
          securityQuestionID: loadedProfile.securityQuestionID || 1,
          securityAnswer: loadedProfile.securityAnswer || "",
        });
      } catch (loadError) {
        setError(loadError.message || "Profile could not be loaded.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser.userID]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await updateUserProfile(currentUser.userID, {
        ...form,
        favoriteTeamID: Number(form.favoriteTeamID),
        securityQuestionID: Number(form.securityQuestionID),
      });
      setProfile(updated);
      setForm((current) => ({
        ...current,
        favoriteTeamID: updated.favoriteTeamID || current.favoriteTeamID,
        securityAnswer: updated.securityAnswer || current.securityAnswer,
      }));
      setMessage("Profile saved successfully.");
      onProfileSaved(updated);
    } catch (saveError) {
      setError(saveError.message || "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="notice">Loading your profile...</div>;
  if (error && !profile) return <div className="notice purple">{error}</div>;

  const favoriteTeam = teams.find(
    (team) => Number(team.teamID) === Number(form.favoriteTeamID),
  );
  const favoriteTeamName =
    favoriteTeam?.teamName || "No favorite team selected";

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Account</span>
        <h1>My Profile</h1>
        <p>Manage your player information and account security.</p>
      </div>

      <section className="profile-hero">
        <div className="profile-team-helmet">
          <HelmetImage
            teamName={favoriteTeam?.teamName}
            side="home"
            size={48}
            fallback={initials(profile)}
          />
        </div>
        <div>
          <h2>{profile.displayName}</h2>
          <p>
            {roleName(profile.roleID)} · {favoriteTeamName} · {profile.email}
          </p>
          <span className="status-chip">
            {profile.isActive ? "Active Player" : "Inactive"}
          </span>
        </div>
      </section>

      <form className="profile-registration-card" onSubmit={save}>
        <section className="profile-form-section">
          <div className="profile-section-heading">
            <strong>Player Information</strong>
            <span>Update the information shown throughout the league.</span>
          </div>
          <div className="profile-form-grid">
            <Field
              label="First Name"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
            />
            <Field
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
            />
            <Field
              label="Display Name"
              value={form.displayName}
              onChange={(e) => setField("displayName", e.target.value)}
            />
            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            <label className="profile-wide">
              Favorite Team
              <select
                required
                value={form.favoriteTeamID}
                onChange={(e) => setField("favoriteTeamID", e.target.value)}
              >
                <option value="">Select your favorite NFL team</option>
                {teams.map((team) => (
                  <option value={team.teamID} key={team.teamID}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="profile-form-section">
          <div className="profile-section-heading">
            <strong>Account Security</strong>
            <span>Maintain the recovery information for your account.</span>
          </div>
          <div className="profile-form-grid">
            <label className="profile-wide">
              Security Question
              <select
                value={form.securityQuestionID}
                onChange={(e) => setField("securityQuestionID", e.target.value)}
              >
                {securityQuestions.map((question, index) => (
                  <option value={index + 1} key={question}>
                    {question}
                  </option>
                ))}
              </select>
            </label>
            <div className="profile-wide">
              <SecretField
                label="Security Answer"
                value={form.securityAnswer}
                placeholder="Enter your security answer"
                onChange={(e) => setField("securityAnswer", e.target.value)}
              />
            </div>
          </div>
        </section>

        {message && <div className="profile-message success">{message}</div>}
        {error && <div className="profile-message error">{error}</div>}
        <button className="profile-save-button" type="submit" disabled={saving}>
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <label>
      {label}
      <input required type={type} value={value} onChange={onChange} />
    </label>
  );
}

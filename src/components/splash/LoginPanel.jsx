import { Lock, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { login } from "../../services/authService";
import "./LoginPanel.css";

export default function LoginPanel({ setMode, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    try {
      onLogin(await login(email, password), rememberMe);
    } catch (error) {
      setMessage(error.message || "Login failed.");
    }
  }

  return (
    <section className="splash-login-column">
      <form className="splash-login-card" onSubmit={handleSubmit}>
        <div className="login-title-rule">
          <span />
          <div>★ ★ ★ ★ ★</div>
          <span />
        </div>
        <div className="login-brand">
          <strong>PRO PICK 'EM</strong>
          <span>
            Compete.<em> Predict.</em>
            <b> Win.</b>
          </span>
          <p>
            Build the perfect week. Beat your friends. Become the season
            champion.
          </p>
        </div>
        <Field
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          setValue={setEmail}
        />
        <Field
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          setValue={setPassword}
        />
        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember Me</span>
          </label>
          <button type="button" onClick={() => setMode("recovery")}>
            Forgot Password?
          </button>
        </div>
        <button className="stadium-button" type="submit">
          <Lock size={20} />
          Enter The Stadium
        </button>
        <div className="account-divider">
          <span />
          <small>OR</small>
          <span />
        </div>
        <button
          className="create-account-button"
          type="button"
          onClick={() => setMode("registration")}
        >
          <UserCircle2 size={22} />
          Create Account
        </button>
        {message && <div className="login-error-message">{message}</div>}
        <small className="account-helper">
          Sign in using an approved league account.
        </small>
      </form>
    </section>
  );
}

function Field({ label, type, placeholder, value, setValue }) {
  return (
    <label>
      {label}
      <input
        required
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </label>
  );
}

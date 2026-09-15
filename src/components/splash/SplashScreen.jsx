import FeatureRibbon from "./FeatureRibbon";
import GameOfWeekCard from "./GameOfWeekCard";
import LoginPanel from "./LoginPanel";
import SeasonLeadersCard from "./SeasonLeadersCard";
import ThisWeekCard from "./ThisWeekCard";
import PasswordRecoveryPanel from "../auth/PasswordRecoveryPanel";
import RegistrationScreen from "../auth/RegistrationScreen";
export default function SplashScreen({
  mode,
  setMode,
  onLogin,
  leagueContext,
}) {
  if (mode === "registration")
    return <RegistrationScreen onReturn={() => setMode("login")} />;
  return (
    <div className="splash-screen">
      <section className="splash-stage">
        <div className="splash-logo">
          <div className="brand-text">
            <strong>PRO PICK 'EM</strong>
            <small>Every Game Counts</small>
          </div>
        </div>
        <div className="splash-content-container">
          <GameOfWeekCard weekId={leagueContext?.weekID} />
          <div className="splash-lower-panels">
            <SeasonLeadersCard
              leaders={leagueContext?.leaders}
              weekNumber={leagueContext?.weekNumber}
            />
            <ThisWeekCard summary={leagueContext} />
          </div>
        </div>
        <FeatureRibbon />
      </section>
      {mode === "recovery" ? (
        <PasswordRecoveryPanel onReturn={() => setMode("login")} />
      ) : (
        <LoginPanel setMode={setMode} onLogin={onLogin} />
      )}
    </div>
  );
}

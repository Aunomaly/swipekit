import { Routes, Route } from "react-router-dom";
import { C, F } from "./components/shared";
import AuthGuard from "./components/auth/AuthGuard";
import AuthPage from "./components/auth/AuthPage";
import NavBar from "./components/NavBar";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import DesignReviewApp from "./components/design-review/DesignReviewApp";
import SurveyApp from "./components/survey/SurveyApp";
import DesignReviewerView from "./components/design-review/DesignReviewerView";
import SurveyReviewerView from "./components/survey/SurveyReviewerView";
import DesignSessionResults from "./components/design-review/DesignSessionResults";
import SurveyResults from "./components/survey/SurveyResults";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(167,139,250,.08) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <NavBar />

      <Routes>
        {/* public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/r/:sessionId" element={<DesignReviewerView />} />
        <Route path="/s/:surveyId" element={<SurveyReviewerView />} />

        {/* demo flows — public, auth only required to generate a share link */}
        <Route path="/design" element={<DesignReviewApp />} />
        <Route path="/survey" element={<SurveyApp />} />

        {/* protected — creator only */}
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/results/r/:sessionId" element={<AuthGuard><DesignSessionResults /></AuthGuard>} />
        <Route path="/results/s/:surveyId" element={<AuthGuard><SurveyResults /></AuthGuard>} />
      </Routes>
    </div>
  );
}

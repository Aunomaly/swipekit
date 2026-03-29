import { Routes, Route } from "react-router-dom";
import { C, F, FS } from "./components/shared";
import DesignReviewApp from "./components/design-review/DesignReviewApp";
import SurveyApp from "./components/survey/SurveyApp";
import DesignReviewerView from "./components/design-review/DesignReviewerView";
import SurveyReviewerView from "./components/survey/SurveyReviewerView";
import Landing from "./components/Landing";

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/design" element={<DesignReviewApp />} />
        <Route path="/survey" element={<SurveyApp />} />
        <Route path="/r/:sessionId" element={<DesignReviewerView />} />
        <Route path="/s/:surveyId" element={<SurveyReviewerView />} />
      </Routes>
    </div>
  );
}

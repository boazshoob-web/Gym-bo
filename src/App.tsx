import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import BottomNav from "./components/BottomNav";
import WorkoutPage from "./pages/WorkoutPage";
import ExercisesPage from "./pages/ExercisesPage";
import RoutinesPage from "./pages/RoutinesPage";
import HistoryPage from "./pages/HistoryPage";
import ProgressPage from "./pages/ProgressPage";
import { seedIfEmpty } from "./seed";
import { I18nProvider } from "./i18n";

export default function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <I18nProvider>
      <HashRouter>
        <div className="h-full flex flex-col">
          <Routes>
            <Route path="/" element={<WorkoutPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </I18nProvider>
  );
}

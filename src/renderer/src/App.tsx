import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./views/HomePage";
import RulePage from "./views/RulePage";

import ProfilePage from "./views/ProfilePage";
import ReportPage from "./views/ReportPage";
import SettingPage from "./views/SettingPage";
import AboutPage from "./views/AboutPage";
import HelpPage from "./views/HelpPage";
import FolderPage from "./views/FolderPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="rules" element={<RulePage />} />
          <Route path="profiles" element={<ProfilePage />} />
          <Route path="folders" element={<FolderPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="settings" element={<SettingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

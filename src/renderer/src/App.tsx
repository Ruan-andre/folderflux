import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./views/HomePage";
import RulePage from "./views/RulePage";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { GeneralTheme } from "./themes/GeneralTheme";
import ProfilePage from "./views/ProfilePage";
import ReportPage from "./views/ReportPage";
import SettingPage from "./views/SettingPage";
import AboutPage from "./views/AboutPage";
import HelpPage from "./views/HelpPage";

function App() {
  return (
    <ThemeProvider theme={GeneralTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="rules" element={<RulePage />} />
            <Route path="profiles" element={<ProfilePage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="settings" element={<SettingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./layouts/main";
import Home from "./views/home";
import Rules from "./views/rules";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { GeneralTheme } from "./themes/GeneralTheme";
import Profiles from "./views/profiles";
import Report from "./views/report";
import Settings from "./views/settings";

function App() {
  return (
    <ThemeProvider theme={GeneralTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            <Route path="rules" element={<Rules />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="report" element={<Report />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

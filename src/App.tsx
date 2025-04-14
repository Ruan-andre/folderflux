import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./layouts/main";
import Home from "./views/home";
// import Rules from "./views/rules";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { GeneralTheme } from "./themes/GeneralTheme";

function App() {
  return (
    <ThemeProvider theme={GeneralTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            {/* <Route path="rules" element={<Rules />} /> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

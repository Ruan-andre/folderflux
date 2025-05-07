import { Outlet } from "react-router-dom";
import Sidebar from "../../Sidebar";

const MainLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

import { Outlet } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { useSidebarStore } from "../../../store/sidebarStore";
import { Box } from "@mui/material";

const MainLayout = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);

  const sidebarOpenWidth = 245;
  const sidebarClosedWidth = 80;

  const currentSidebarWidth = isOpen ? sidebarOpenWidth : sidebarClosedWidth;

  return (
    <Box>
      <Sidebar />
      <Box
        component="main"
        sx={{
          marginLeft: `${currentSidebarWidth}px`,
          padding: "1.5rem",
          transition: "margin-left 0.2s ease-in-out",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

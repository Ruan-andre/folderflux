import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#332F2F", // Dark Brown - Primary accent color
      light: "#5C5C5C", // Lighter version of dark brown
      dark: "#1A1A1A", // Darker version of dark brown
    },
    secondary: {
      main: "#B8A99B", // Light Brown - Sidebar background
      light: "#D4C8BC", // Lighter version of light brown
      dark: "#9A8A7A", // Darker version of light brown
    },
    text: {
      primary: "#332F2F", // Dark Brown - Primary text
      secondary: "#5C5C5C", // Medium gray for secondary text
    },
    background: {
      default: "#EAE4DF", // Very Light Beige - Main content background
      paper: "#F5F2ED", // Slightly lighter beige for cards/paper
    },
    divider: "#B8A99B", // Light Brown for dividers
    action: {
      hover: "#D4C8BC", // Light Brown hover state
      selected: "#B8A99B", // Light Brown selected state
      active: "#9A8A7A", // Darker Brown active state
    },
    success: {
      main: "#5C9C74", // Medium Green - Button background
      light: "#7BB88A", // Lighter green
      dark: "#4A7D5E", // Darker green
    },
    grey: {
      50: "#F5F2ED", // Very light beige
      100: "#EAE4DF", // Light beige
      200: "#D4C8BC", // Light brown
      300: "#B8A99B", // Medium light brown
      400: "#9A8A7A", // Medium brown
      500: "#808080", // Medium gray (progress indicator)
      600: "#5C5C5C", // Darker gray
      700: "#4A4A4A", // Even darker gray
      800: "#332F2F", // Dark brown
      900: "#1A1A1A", // Very dark brown
    },
  },
  shape: {
    borderRadius: 8, // Increased border radius for modern look
  },
  typography: {
    fontSize: 16,
    caption: { fontSize: "1.8rem" },
    subtitle1: { fontSize: "1.5rem" },
    fontWeightBold: "bold",
    h5: { fontWeight: 600 },
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          backgroundColor: "#5C9C74", // Medium Green
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#4A7D5E", // Darker green on hover
          },
        },
        outlined: {
          borderColor: "#B8A99B", // Light Brown border
          color: "#332F2F", // Dark Brown text
          transition: "0.3s",
          "&:hover": {
            color: "#FFFFFF",
            backgroundColor: "#B8A99B", // Light Brown background on hover
            borderColor: "#9A8A7A", // Darker brown border on hover
          },
        },
        text: {
          color: "#332F2F", // Dark Brown text
          "&:hover": {
            backgroundColor: "#D4C8BC", // Light Brown hover background
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5F2ED", // Slightly lighter beige for cards
          border: "1px solid #D4C8BC", // Light brown border
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#332F2F", // Dark Brown title bar
          color: "#FFFFFF",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#B8A99B", // Light Brown sidebar
          color: "#332F2F", // Dark Brown text
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5F2ED", // Light beige background
        },
      },
    },
  },
});

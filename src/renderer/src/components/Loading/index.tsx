import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Backdrop, Stack, Typography } from "@mui/material";

const Loading = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
      open={isLoading}
    >
      <React.Fragment>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e01cd5" />
              <stop offset="100%" stopColor="#1CB5E0" />
            </linearGradient>
          </defs>
        </svg>
        <Stack alignItems={"center"} spacing={2}>
          <CircularProgress size={60} sx={{ "svg circle": { stroke: "url(#my_gradient)" } }} />
          <Typography component={"div"} marginTop={2} fontSize={30}>
            Processando, aguarde...
          </Typography>
        </Stack>
      </React.Fragment>
    </Backdrop>
  );
};

export default Loading;

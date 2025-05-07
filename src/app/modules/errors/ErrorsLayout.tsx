import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useThemeMode } from "../../../_themes/partials";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Stack } from "@mui/material";
import { colors } from "../theme/MuiTheme";

const BODY_CLASSES = ["bgi-size-cover", "bgi-position-center", "bgi-no-repeat"];
const ErrorsLayout = () => {
  const { mode } = useThemeMode();
  // useEffect(() => {
  //   BODY_CLASSES.forEach((c) => document.body.classList.add(c));
  //   document.body.style.backgroundImage =
  //     mode === "dark"
  //       ? `url(${toAbsoluteUrl("media/auth/bg7-dark.jpg")})`
  //       : `url(${toAbsoluteUrl("media/auth/bg7.jpg")})`;

  //   return () => {
  //     BODY_CLASSES.forEach((c) => document.body.classList.remove(c));
  //     document.body.style.backgroundImage = "none";
  //   };
  // }, [mode]);

  return (
    <>
      <Stack flexGrow={1}>
        <Outlet />
      </Stack>
    </>
  );
};

export { ErrorsLayout };

import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Container, Grid, Typography, Stack, Box } from "@mui/material";
import { Languages } from "../../../_themes/layout/components/header/navbarmenus/Languages";
import { useIntl } from "react-intl";
import LightDarkMode from "../../../_themes/layout/components/header/navbarmenus/LightDarkMode";

const AuthLayout = () => {
  const { formatMessage } = useIntl();
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100%";
    }
    return () => {
      if (root) {
        root.style.height = "auto";
      }
    };
  }, []);

  return (
    <Container
      sx={{ height: "100vh", alignContent: "center" }}
      className="d-flex flex-column gap-4"
    >
      <Stack direction="row" spacing={2} sx={{
        alignItems: "center",
        justifyContent: "flex-end"
      }}>
        <LightDarkMode />
        <Languages />
      </Stack>
      <Grid
        container
        className="flex-grow-1 justify-content-evenly align-items-center"
        sx={{
          py: 2,
          gap: 4
        }}>
        <Grid
          size={{
            xs: 12,
            sm: 5
          }}
          sx={{
            order: { xs: "2", sm: "inherit" },
            justifyContent: "center"
          }}>
          <Stack>
            <Outlet />
          </Stack>

          <Stack
            direction={"row"}
            spacing={2}
            sx={{
              justifyContent: "space-evenly",
              marginBlock: "2rem"
            }}>
            <Link to={"/"}>{formatMessage({ id: "LINK.TERM" })} </Link>
            <Link to={"/"}> {formatMessage({ id: "LINK.PLAN" })} </Link>
            <Link to={"/"}>{formatMessage({ id: "LINK.CONTACTUS" })} </Link>
          </Stack>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 5
          }}
          sx={{
            textAlign: "center"
          }}>
          <Stack spacing={2}>
            <Box component={"div"}>
              <img
                alt="Logo"
                src={toAbsoluteUrl("media/logos/favicon.png")}
                style={{ maxWidth: "250px" }}
              />
            </Box>

            <Typography variant="h4">Fast, Efficient and Productive</Typography>

            <Typography variant="body1">
              Code Ji’s CMS portal simplifies employee and applicant management
              by allowing businesses to track profiles, recruitment stages, and
              performance efficiently. It streamlines HR processes, enabling
              easy updates without technical expertise.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export { AuthLayout };

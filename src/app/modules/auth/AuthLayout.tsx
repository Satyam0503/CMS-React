import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Container, Grid, Typography, Stack, Box } from "@mui/material";
import { useLang } from "../../../_themes/i18n/Metronici18n";
import { languages } from "../../../utils/constant/Constant";
import { Languages } from "../../../_themes/layout/components/header/navbarmenus/Languages";

const AuthLayout = () => {
  const lang = useLang();
  const currentLanguage = languages.find((x) => x.lang === lang);
  const [languageAnchorEl, setLanguangeAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const open = Boolean(languageAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguangeAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setLanguangeAnchorEl(null);
  };

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
      <Stack className="align-self-end">
        <Languages />
      </Stack>
      <Grid
        container
        py={2}
        gap={4}
        className="flex-grow-1 justify-content-evenly align-items-center"
      >
        <Grid
          item
          xs={12}
          sm={5}
          order={{ xs: "2", sm: "inherit" }}
          sx={{ justifyContent: "center" }}
        >
          <Stack>
            <Outlet />
          </Stack>

          <Stack
            direction={"row"}
            spacing={2}
            justifyContent={"space-evenly"}
            sx={{ marginBlock: "2rem" }}
          >
            <Typography variant="body1">
              <Link to={"/"}>{"Terms"} </Link>
            </Typography>
            <Typography variant="body1">
              <Link to={"/"}> {"Plans"} </Link>
            </Typography>
            <Typography variant="body1">
              <Link to={"/"}>{"Contact Us"}</Link>
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={5} textAlign={"center"}>
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

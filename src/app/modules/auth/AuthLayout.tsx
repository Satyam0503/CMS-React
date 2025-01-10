import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Container, Grid, Typography, Link } from "@mui/material";

const AuthLayout = () => {
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
    <Container>
      <Grid
        container
        py={4}
        gap={4}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Grid
          item
          xs={12}
          md={5}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          order={{ xs: "2", md: "inherit" }}
          width={"100%"}
        >
          <Grid item xs={12}>
            <Outlet />
          </Grid>

          <Grid
            item
            xs={12}
            display={"flex"}
            justifyContent={"space-around"}
            mt={2}
          >
            <Link href="" underline="none">
              {"Terms"}
            </Link>
            <Link href="" underline="none">
              {"Plans"}
            </Link>
            <Link href="" underline="none">
              {"Contact Us"}
            </Link>
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          display={"flex"}
          flexDirection={"column"}
          textAlign={"center"}
          justifyContent={"center"}
          gap={2}
        >
          <Grid item>
            <img
              alt="Logo"
              src={toAbsoluteUrl("media/logos/favicon.png")}
              style={{ maxWidth: "250px" }}
            />
          </Grid>

          <Typography variant="h2">Fast, Efficient and Productive</Typography>

          <Typography variant="body1">
            We can help you with an easy way to manage all of your website‘s
            content without needing to manually edit your site’s code any time
            you want to make a change.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export { AuthLayout };

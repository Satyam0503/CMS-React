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
        p={{ xs: 2, md: 3 }}
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
          order={{ xs: "2", sm: "inherit" }}
          width={"100%"}
        >
          <Grid item>
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
        >
          <Grid item>
            <img
              alt="Logo"
              src={toAbsoluteUrl("media/logos/favicon.png")}
              style={{ width: "300px" }}
            />
          </Grid>

          <Typography variant="h2">Fast, Efficient and Productive</Typography>

          <Typography>
            We can help you achieve a strong web presence and provide you strong
            SEO & brand development that gives you an advantage over your
            competition in online marketing.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export { AuthLayout };

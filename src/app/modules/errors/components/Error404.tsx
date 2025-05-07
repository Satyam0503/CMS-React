import { FC } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Container, Grid, Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Home } from "@mui/icons-material";

const Error404: FC = () => {
  return (
    <>
      <Container className="d-flex justify-content-center align-items-center flex-grow-1 gap-5">
        <Stack alignItems={"center"} my={3}>
          <img
            src={toAbsoluteUrl("media/auth/404-error.png")}
            alt=""
            style={{ maxHeight: "500px", maxWidth: "100%" }}
          />
        </Stack>
        <Stack spacing={6}>
          <Stack spacing={1}>
            <Typography variant="h1" fontWeight={700} fontSize="52px">
              Oops!
            </Typography>
            <Typography variant="h1">Page not found</Typography>
            <Typography variant="body1">
              We're sorry, the page you requested could not be found. Please go
              back to the homepage!
            </Typography>
          </Stack>

          <Link to="/">
            <CustomisedButton
              label="Return Home"
              variant="contained"
              Icon={<Home />}
              iconPosition="start"
            />
          </Link>
        </Stack>
      </Container>
    </>
  );
};

export { Error404 };

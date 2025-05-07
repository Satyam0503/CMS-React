import { FC } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Container, Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Home } from "@mui/icons-material";

const Error500: FC = () => {
  return (
    <>
      <Container className="d-flex justify-content-center align-items-center flex-grow-1 gap-5">
        <Stack alignItems={"center"} my={3}>
          <img
            src={toAbsoluteUrl("media/auth/500-error.png")}
            alt=""
            style={{ maxHeight: "500px", maxWidth: "100%" }}
          />
        </Stack>
        <Stack spacing={6}>
          <Stack spacing={1}>
            <Typography variant="h1" fontWeight={700} fontSize="52px">
              System Error
            </Typography>
            <Typography variant="h6">
              Something went wrong! Please try again later.
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

export { Error500 };
